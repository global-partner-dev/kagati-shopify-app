import { ActionOptions, SplitOrderOutForDeliveryGlobalActionContext } from "gadget-server";

/**
 * This function handles the process of marking a split order as "out for delivery".
 * It retrieves the relevant split order by ID, updates its status to "out_for_delivery", 
 * and closes its "on hold" status. The function logs both successful completion and any errors encountered.
 *
 * @function run
 * @param {SplitOrderOutForDeliveryGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters passed to the global action, including the ID of the split order.
 * @param {string} context.params.id - The ID of the split order that needs to be updated.
 * @param {object} context.logger - A logging object for recording informational and error messages during the execution of the action.
 * @param {object} context.api - An object containing API methods for interacting with the Gadget platform, specifically for finding and updating orders.
 * @param {object} context.connections - An object containing connections to external services, though not utilized in this function.
 *
 * @returns {Promise<void>} - This function does not return a value but updates the status of the split order and logs the process.
 *
 * @throws {Error} If there is an error in fetching or updating the order, the error is caught, logged, and not rethrown.
 */
export async function run({ params, logger, api, connections }) {
  logger.info(params, "params in splitOrderOutForDelivery");
  
  try {
    // Update the split order status to "out for delivery" and close its on-hold status
    const splitOrderData =  await api.khagatiOrderSplit.findOne(params.id);
    if (!splitOrderData) {
      throw new Error('Order not found');
    }
    const existingTimestamp = splitOrderData.timeStamp || {};
    const updatedTimestamp = {
      ...existingTimestamp,
      out_for_delivery: Date.now() // Update the timestamp with out_for_delivery
    };
    
    await api.khagatiOrderSplit.update(params.id, {
      orderStatus: "out_for_delivery",
      onHoldStatus: "closed",
      timeStamp:updatedTimestamp
    });

    // Log success message
    logger.info("Split order out for delivery successfully");
  } catch (error) {
    // Log error message if any step fails
    logger.error({ error }, "Error calling split order out for delivery action");
  }
}



export async function onSuccess({ params, logger, api, connections }) {
  
  const shopifyShopData = await api.shopifyShop.findMany({});
  const shopifyShopId = shopifyShopData[0].id;
  const shopify = await connections.shopify.forShopId(shopifyShopId);
  try {

    // Step 1: Get the splitOrderData using the provided ID
    const splitOrderId = params.id; // Now using params.id
    const splitOrderData = await api.khagatiOrderSplit.findOne(splitOrderId, {
      select: {
        id: true,
        orderReferenceId: true,
        orderNumber: true, // Include any additional fields needed for the email content
        lineItems: true
      }
    });

    // Step 2: Log and verify the retrieved splitOrderData
    logger.info(splitOrderData, "splitOrderData fetched");

    // Step 3: Use the orderReferenceId to get Shopify order details
    const orderRefId = splitOrderData.orderReferenceId;
    const shopifyOrderResponse = await api.shopifyOrder.findOne(orderRefId, {
      select: {
        id: true,
        email: true,
        name: true,
        processedAt:true,
        currentSubtotalPrice:true,
        currentTotalTax:true,
        currentTotalPrice:true,
        shippingAddress: true
      }
    });

    const orderName = shopifyOrderResponse?.name
    const cName = shopifyOrderResponse?.shippingAddress?.first_name + " " + shopifyOrderResponse?.shippingAddress?.last_name;
    const phoneNumber = shopifyOrderResponse?.shippingAddress?.phone
    
    const smsRequestData = {
      orderName: orderName,
      cName: cName,
      phoneNumber: phoneNumber
    }
    logger.info({ smsRequestData: smsRequestData }, "Fetched images for order data");
    const shopLocation = await api.shopifyLocation.findFirst();
    try {

      const getFulfilledRecords = await api.shopifyFulfillmentOrder.findMany({
        filter: { orderId: { equals: orderRefId } },
        select:{
          id:true,
          orderId:true
        }
      });

      logger.info({ getFulfilledRecords: getFulfilledRecords }, "Fulfilled record");
      if (getFulfilledRecords && getFulfilledRecords.length > 0) {
        const fulfilmentId=getFulfilledRecords[0].id
       const fulfiledStatus = await shopify.graphql(`mutation fulfillmentCreate($fulfillment: FulfillmentInput!) {
        fulfillmentCreate(fulfillment: $fulfillment) {
          fulfillment {
          id
          status
          }
          userErrors {
            field
            message
          }
        }
      }`,{
        fulfillment: {
          lineItemsByFulfillmentOrder:{
            fulfillmentOrderId: `gid://shopify/FulfillmentOrder/${fulfilmentId}`
          }
        }
      });
      logger.info(fulfiledStatus,"fulfiledStatus");
      return fulfiledStatus;
    }
   
    } catch (error) {
      console.error(`Failed to create Shopify product: ${error.message}`);
      throw error;
    }
    

    try {
      // Prepare the SMS request data
      const responseSMS = await api.khagatiSMS({
        smsRequestData: JSON.stringify(smsRequestData),
        subject: "OutForDelivery"
      });
  
      // Optional: Handle the response if needed
      logger.info("SMS sent successfully:", responseSMS);
    } catch (error) {
      // Handle any errors that occur during the SMS sending process
      logger.error("Failed to send SMS:", error);
    }
    // Step 4: Send email notification
    // const responseEmail = await api.emailSMPT({ message, to: shopifyOrderResponse.email, from: "hello@lavipun.com", subject: "Order is out for delivery" });
    // logger.info(responseEmail, "Email sent for order confirmation");

    // Step 6: Send SMS notification
    // const phoneNumber = shopifyOrderResponse.shippingAddress.phone;
    // const cName = `${shopifyOrderResponse.shippingAddress.first_name} ${shopifyOrderResponse.shippingAddress.last_name}`;
    // const tId = "1"; // Template ID for SMS (if required)
    // const responseKhagatiSMS = await api.khagatiSMS({ cName, phoneNumber, tId });
    // logger.info(responseKhagatiSMS, "SMS sent for order confirmation");

  } catch (error) {
    logger.error({ error }, "Error in onSuccess function");
  }
}


/**
 * Parameters required for marking a split order as "out for delivery".
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} id - The ID of the split order that needs to be updated.
 */
export const params = {
  id: {
    type: "string",
  },
};