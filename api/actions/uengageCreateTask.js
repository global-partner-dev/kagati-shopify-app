import { UengageCreateTaskGlobalActionContext } from "gadget-server";
import { getUengageData } from "../../web/util/getUengageData";
import { getLatLong } from "../../web/util/geolocation";

/**
 * @param { UengageCreateTaskGlobalActionContext } context
 */
export async function run({ params, logger, api }) {
  const formatPhoneNumber = (phoneNumber) => {
    // Remove spaces
    phoneNumber = phoneNumber.replace(/\s+/g, '');
    logger.info({ phoneNumber }, "Normalized phoneNumber---->>");
  
    // Remove '+' if present
    if (phoneNumber.startsWith('+')) {
      phoneNumber = phoneNumber.slice(1);
    }
  
    // Check and adjust based on length
    if (phoneNumber.length === 12) {
      if (phoneNumber.startsWith("91")) {
        return phoneNumber.slice(2); // Remove '91'
      } else {
        console.error('Invalid phone number format:', phoneNumber);
        return null;
      }
    } else if (phoneNumber.length === 10) {
      return phoneNumber; // Return as is
    } else {
      console.error('Invalid phone number format:', phoneNumber);
      return null;
    }
  };
  
  const orderId = params.id; // Renamed for clarity
  logger.info({ orderId }, "Order ID Received:");

  // Retrieve the Shopify order record
  const shopifyOrderRecord = await api.shopifyOrder.findOne(orderId, {
    select: {
      id: true,
      orderNumber: true,
      financialStatus: true,
      sourceName: true,
      currentTotalPrice: true,
      customerId: true,
      lineItems: {
        edges: {
          node: {
            id: true,
            name: true,
            fulfillableQuantity: true,
            price: true
          }
        },
      },
      shippingAddress: true,
    }
  });
  if (!shopifyOrderRecord) {
    logger.error("No Shopify order record found.");
    throw new Error("Shopify order not found.");
  }
  logger.info({ shopifyOrderRecord }, "Shopify Order Record Retrieved:");
  let orderSourceName;
  if(shopifyOrderRecord.sourceName == "134066733057") {
    orderSourceName = "App"
  } else if (shopifyOrderRecord.sourceName == "web") {
    orderSourceName = "Online Store"
  } else if (shopifyOrderRecord.sourceName == "shopify_draft_order") {
    orderSourceName = "Shopify Store"
  }
  const orderPaidStatus = (shopifyOrderRecord.financialStatus == "paid") ? true : false 
  logger.info({orderPaidStatus: orderPaidStatus}, "orderPaidStatus ------")
  const shippingAddress = shopifyOrderRecord?.shippingAddress
  const customerAddress = [
      shippingAddress.address1,
      shippingAddress.address2,
      shippingAddress.city,
      shippingAddress.province,
      shippingAddress.country
  ]
  .filter(Boolean) // This will remove any undefined or empty strings
  .join(', ');
  
  let order_items = [];

  await Promise.all(shopifyOrderRecord.lineItems.edges.map(async (item) => {
    order_items.push({
      id: item.node.id,
      name: item.node.name,
      quantity: item.node.fulfillableQuantity,
      price: Number(item.node.price)
    });
  }));

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
      storeName: true,
      mobNumber: true,
      lat: true,
      lng: true,
      address: true,
      city: true
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

  const url = 'https://riderapi.uengage.in/createTask';
  const { UENGAGE_ACCESS_TOKEN, UENGAGE_STORE_ID } = await getUengageData(erpStoreId);
  
  try {
    // Prepare payload for API request
    const storeId = UENGAGE_STORE_ID; // Store ID
    let drop_details = {
      name: shippingAddress.name,
      contact_number: formatPhoneNumber(shippingAddress.phone),
      latitude: Number(shippingAddress.latitude),
      longitude: Number(shippingAddress.longitude),
      address: customerAddress,
      city: shippingAddress.city,
    };
    if (shippingAddress.latitude === null || shippingAddress.longitude === null) {
      logger.info({ customerAddress: customerAddress }, "Latitude or Longitude missing, fetching from Geolocation API");
      const geoLocation = await getLatLong(customerAddress, logger);
      logger.info({ geoLocation: geoLocation }, "geoLocation=======>>>");
      
      if (geoLocation.error) {
        logger.error(
          { error: geoLocation.error },
          "Failed to fetch latitude and longitude using Geolocation API"
        );
      } else {
        drop_details.latitude = geoLocation.latitude
        drop_details.longitude = geoLocation.longitude
      }
    } else {
      logger.info({ drop_details }, "Latitude and Longitude found in shippingAddress");
    }
    logger.info({drop_details: drop_details}, "drop_details in create task----->>")
    
    const order_details = {
      order_total: Number(shopifyOrderRecord.currentTotalPrice),
      paid: true.toString(),
      vendor_order_id: shopifyOrderRecord?.orderNumber,
      order_source: orderSourceName,
      customer_orderId: shopifyOrderRecord.customerId
    };
    
    const pickup_details = {
      name: storeData[0].storeName,
      contact_number: formatPhoneNumber(storeData[0].mobNumber),
      latitude: Number(storeData[0].lat),
      longitude: Number(storeData[0].lng),
      address: storeData[0].address,
      city: storeData[0].city
    };

    logger.info({ requestBody: { storeId, order_details, pickup_details, drop_details } }, "Payload Being Sent:");
    logger.info({ UENGAGE_ACCESS_TOKEN }, "UENGAGE Access Token:");
    logger.info({ storeId }, "UENGAGE Store ID:");

    // Sending the POST request
    const requestBody = {
      storeId,
      order_details,
      pickup_details,
      drop_details,
      order_items
    };
    logger.info({requestBody: requestBody}, "requestBody------>")

    const createResponse = await fetch(url, {
      method: "POST",
      headers: {
        'access-token': UENGAGE_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    logger.info({ createResponse }, "Create new Task API Response:");

    // Checking response status and handling errors
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      logger.error({ status: createResponse.status, errorText }, "Failed to fetch serviceability data");
      throw new Error(`Request failed with status ${createResponse.status}`);
    }

    // Parse and log the response data
    const createResponseData = await createResponse.json();
    logger.info({ createResponseData }, "Serviceability Response Received Successfully");

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

