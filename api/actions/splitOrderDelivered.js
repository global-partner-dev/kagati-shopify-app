import { ActionOptions, SplitOrderDeliveredGlobalActionContext } from "gadget-server";

/**
 * Executes the split order delivery action.
 * 
 * This function retrieves a split order by its ID, updates the order's status to "delivered", 
 * closes the "on hold" status, and logs the process. If any error occurs, it catches and logs the error.
 * 
 * @async
 * @function run
 * @param {SplitOrderDeliveredGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {string} context.params.id - The ID of the split order that needs to be updated.
 * @param {object} context.logger - A logger object for recording informational and error messages during the execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform, specifically for finding and updating orders.
 * @param {object} context.connections - An object containing connections to external services, though not used in this function.
 * 
 * @returns {Promise<void>} A promise that resolves when the action completes.
 * 
 * @throws {Error} If an error occurs during fetching or updating the order, it is caught, logged, and not rethrown.
 * Delivery Confirmation
 */
export async function run({ params, logger, api, connections }) {
  try {
    const splitOrderData =  await api.khagatiOrderSplit.findMany({
      select: {
        id: true,
        orderReferenceId: true,
        timeStamp:true
      },
      filter: {
        id: { in: [params.id] },
      },
    });
    if (!splitOrderData.length > 0) {
      throw new Error('Order not found');
    }
    const existingTimestamp = splitOrderData[0].timeStamp || {};
    const updatedTimestamp = {
      ...existingTimestamp,
      delivered: Date.now() // Add current timestamp
    };
    logger.info({updatedTimestamp: updatedTimestamp}, "previous timestamp")
    // Update the status of the retrieved split order to "delivered" and close the "on hold" status
    const splitOrderUpdate = await api.khagatiOrderSplit.update(params.id, {
      orderStatus: "delivered",
      onHoldStatus: "closed",
      timeStamp:updatedTimestamp
    });

    logger.info({splitOrderUpdate: splitOrderUpdate}, "response in splitOrderDelivered")

    // Log success message
    logger.info("Split order delivered successfully");
  } catch (error) {
    // Log error message
    logger.error({ error }, "Error calling split order delivered action");
  }
};

/** 
 * Parameters required for marking a split order as delivered.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} id - The ID of the split order that needs to be updated.
 */

export async function onSuccess({ params, logger, api, connections }) {
  try {
    logger.info(params, "params in");
    const shopifyShopData = await api.shopifyShop.findMany({});
    const shopifyShopId = shopifyShopData[0].id;
    const shopify = await connections.shopify.forShopId(shopifyShopId);

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
    logger.info({orderRefId: orderRefId}, "orderRefId---->>")
    const orderData = await api.khagatiOrder.findMany({
      filter: {
        orderId: { equals: String(orderRefId) }
      },
      select: {
          name: true,
          currency: true,
          customer: true,
          createdAt: true,
          processedAt: true,
          shippingAddress: true,
          billingAddress: true,
          orderStatusUrl: true,
          lineItems: true, // Just retrieve the lineItems as a whole JSON
          taxLines: true,
          currentSubtotalPrice: true
      }
    });

    if (orderData.length === 0) {
      throw new Error("No records found matching the provided orderRefId.");
    }
    const orderName = orderData[0]?.name
    const cName = orderData[0]?.shippingAddress?.first_name + " " + orderData[0]?.shippingAddress?.last_name;
    const phoneNumber = orderData[0]?.shippingAddress?.phone
    const smsRequestData = {
      orderName: orderName,
      cName: cName,
      phoneNumber: phoneNumber
    }

    logger.info({ smsRequestData: smsRequestData }, "Fetched images for order data");

    try {

      const getFulfilledRecords = await api.shopifyFulfillmentOrder.findMany({
        filter: { 
          orderId: { 
            equals: orderRefId
          }
        },
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
        // return fulfiledStatus;
      }
   
    } catch (error) {
      console.error(`Failed to create Shopify product: ${error.message}`);
      throw error;
    }
    // Step 4: Create the email message
    try {
      // Prepare the SMS request data
      const responseSMS = await api.khagatiSMS({
        smsRequestData: JSON.stringify(smsRequestData),
        subject: "Delivered"
      });
  
      logger.info("SMS sent successfully:", responseSMS);
    } catch (error) {
      // Handle any errors that occur during the SMS sending process
      logger.error("Failed to send SMS:", error);
    }
    
  if (orderData && orderData.length > 0) {
    try {
      const responseEmail = await api.emailSMPT({ 
        id : params.id,
        orderStatus: "delivered" 
      });
      
      logger.info({ responseEmail: responseEmail }, "Email sent successfully");
      
    } catch (emailError) {
      logger.error({ error: emailError }, "Error sending email");
    }
  } else {
    logger.warn("Order data not found; skipping email send.");
  }

  } catch (error) {
    logger.error({ error }, "Error in onSuccess function");
  }
}


export const params = {
  id: {
    type: "string"
  }
};


