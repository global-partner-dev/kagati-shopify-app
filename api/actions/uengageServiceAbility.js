import { UengageServiceAbilityGlobalActionContext } from "gadget-server";
import { getUengageData } from "../../web/util/getUengageData";
import { getLatLong } from "../../web/util/geolocation";

/**
 * @param { UengageServiceAbilityGlobalActionContext } context
 */
export async function run({ params, logger, api }) {
  const orderId = params.id; // Renamed for clarity
  logger.info({ orderId }, "Order ID Received:");

  // Retrieve the Shopify order record
  const shopifyOrderRecord = await api.shopifyOrder.findOne(orderId, {
    select: {
      id: true,
      email: true,
      name: true,
      processedAt: true,
      currentSubtotalPrice: true,
      currentTotalTax: true,
      currentTotalPrice: true,
      shippingAddress: true,
      billingAddress: true
    },
  });

 const customerAddress = [
    shopifyOrderRecord?.shippingAddress?.address1,
    shopifyOrderRecord?.shippingAddress?.address2,
    shopifyOrderRecord?.shippingAddress?.city,
    shopifyOrderRecord?.shippingAddress?.province,
    shopifyOrderRecord?.shippingAddress?.country,
  ]
    .filter(Boolean) // Remove null or undefined parts of the address
    .join(", ");

  if (!shopifyOrderRecord) {
    logger.error("No Shopify order record found.");
    throw new Error("Shopify order not found.");
  }

  logger.info({ shopifyOrderRecord }, "Shopify Order Record Retrieved:");

  // Retrieve split order data
  const splitOrderData = await api.khagatiOrderSplit.findMany({
    select: {
      erpStoreId: true,
    },
    filter: {
      orderReferenceId: { equals: orderId },
    },
  });

  if (splitOrderData.length === 0) {
    logger.error("No split order data found for the given order ID.");
    throw new Error("No split order data found.");
  }

  logger.info({ splitOrderData }, "Split Order Data Retrieved:");
  
  const erpStoreId = splitOrderData[0].erpStoreId; // Safely accessing the ERP Store ID

  // Retrieve store data
  const storeData = await api.khagatiStores.findMany({
    select: {
      lat: true,
      lng: true,
    },
    filter: {
      erpStoreId: { equals: erpStoreId },
    },
  });

  if (storeData.length === 0) {
    logger.error("No store data found for the given ERP Store ID.");
    throw new Error("No store data found.");
  }

  logger.info({ storeData }, "Store Data Retrieved:");

  const url = 'https://riderapi.uengage.in/getServiceability';
  const uengageData = await getUengageData(erpStoreId);
  const { UENGAGE_ACCESS_TOKEN, UENGAGE_STORE_ID } = uengageData
  
  try {
    let dropDetails = {
      lat: shopifyOrderRecord?.shippingAddress?.latitude,
      lng: shopifyOrderRecord?.shippingAddress?.longitude,
    };
    
    if (dropDetails.lat === null || dropDetails.lng === null) {
      logger.info({ customerAddress: customerAddress }, "Latitude or Longitude missing, fetching from Geolocation API");
      const geoLocation = await getLatLong(customerAddress, logger);
      logger.info({ geoLocation: geoLocation }, "geoLocation=======>>>");
      
      if (geoLocation.error) {
        logger.error(
          { error: geoLocation.error },
          "Failed to fetch latitude and longitude using Geolocation API"
        );
      } else {
        dropDetails = {
          lat: geoLocation.latitude,
          lng: geoLocation.longitude,
        };
        logger.info({ dropDetails }, "Updated dropDetails with geolocation API response");
      }
    } else {
      logger.info({ dropDetails }, "Latitude and Longitude found in shippingAddress");
    }
    logger.info({dropDetails: dropDetails}, "dropDetails----->>")
    // Prepare payload for API request
    const store_id = UENGAGE_STORE_ID; // Store ID
    const pickupDetails = {
      lat: storeData[0].lat,
      lng: storeData[0].lng,
    };


    logger.info({ requestBody: { store_id, pickupDetails, dropDetails } }, "Payload Being Sent:");
    logger.info({ UENGAGE_ACCESS_TOKEN }, "UENGAGE Access Token:");
    logger.info({ store_id }, "UENGAGE Store ID:");

    // Sending the POST request
    const requestBody = {
      store_id,
      pickupDetails,
      dropDetails,
    };

    const createResponse = await fetch(url, {
      method: "POST",
      headers: {
        'access-token': UENGAGE_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    logger.info({ createResponse }, "Serviceability API Response:");

    // Checking response status and handling errors
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      logger.error({ status: createResponse.status, errorText }, "Failed to fetch serviceability data");
      throw new Error(`Request failed with status ${createResponse.status}`);
    }
    const createResponseData = await createResponse.json();
    logger.info({ createResponseData }, "Serviceability Response Received Successfully");
    
    if(!createResponseData.serviceability.locationServiceAble || !createResponseData.serviceability.riderServiceAble) {
      return {error: createResponseData.payouts.message};
    }
    // Parse and log the response data
    

    return createResponseData
  } catch (error) {
    logger.error({ error }, "Error Fetching Serviceability:");
    throw error;
  }
};

// Define expected parameters for the function
export const params = {
  id: {
    type: "string",
  },
};