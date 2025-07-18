import { ActionOptions, SplitOrderOnHoldGlobalActionContext } from "gadget-server";

/**
 * This function handles the process of placing a split order "on hold".
 * It retrieves the relevant split order by its ID, updates its status to "on_hold", 
 * and applies the provided on hold status and comment. The function logs both 
 * successful completion and any errors encountered during the process.
 *
 * @function run
 * @param {SplitOrderOnHoldGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters passed to the global action, including the ID of the split order, the new on hold status, and an optional comment.
 * @param {string} context.params.id - The ID of the split order that needs to be updated.
 * @param {string} context.params.onHoldStatus - The new "on hold" status to be applied to the split order.
 * @param {string} context.params.onHoldComment - An optional comment explaining why the order is on hold.
 * @param {object} context.logger - A logging object for recording informational and error messages during the execution of the action.
 * @param {object} context.api - An object containing API methods for interacting with the Gadget platform, specifically for finding and updating orders.
 *
 * @returns {Promise<void>} - This function does not return a value but updates the status of the split order and logs the process.
 *
 * @throws {Error} If there is an error in fetching or updating the order, the error is caught, logged, and not rethrown.
 */

export async function run({ params, logger, api }) {
  
  try {
    // Update the split order status to "on_hold" with the provided status and comment
    const splitOrderData =  await api.khagatiOrderSplit.findOne(params.id);
    if (!splitOrderData) {
      throw new Error('Order not found');
    }
    const existingTimestamp = splitOrderData.timeStamp || {};
    const updatedTimestamp = {
      ...existingTimestamp,
      on_hold: Date.now() // Add current timestamp
    };
    await api.khagatiOrderSplit.update(params.id, {
      orderStatus: "on_hold",
      onHoldStatus: params.onHoldStatus,
      onHoldComment: params.onHoldComment,
      timeStamp:updatedTimestamp
    });

    // Log success message
    logger.info("Split order on hold successfully");
  } catch (error) {
    // Log error message if any step fails
    logger.error({ error }, "Error calling split order on hold action");
  }
}

/**
 * Handles the successful completion of the "on hold" action by retrieving the order data and sending a notification email.
 *
 * @function onSuccess
 * @param {object} context - The context object containing parameters, logger, and API methods.
 * @param {object} context.params - Parameters passed to the action, including the split order ID.
 * @param {string} context.params.id - The ID of the split order that was placed on hold.
 */
export async function onSuccess({ params, logger, api }) {
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
  try {
    // Prepare the SMS request data
    const responseSMS = await api.khagatiSMS({
      smsRequestData: JSON.stringify(smsRequestData),
      subject: "ON_HOLD"
    });

    // Optional: Handle the response if needed
    logger.info("SMS sent successfully:", responseSMS);
  } catch (error) {
    // Handle any errors that occur during the SMS sending process
    logger.error("Failed to send SMS:", error);
  }
  try {
    logger.info(params, "params in");

    // Step 1: Get the splitOrderData using the provided ID
    const splitOrderId = params.id;

    await api.emailSMPT({
      id: splitOrderId,
      orderStatus: "on_hold"
    })
    
  } catch (error) {
    logger.error({ error }, "Error in onSuccess function");
  }

  
}

/**
 * Parameters required for placing a split order on hold.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} id - The ID of the split order that needs to be updated.
 * @property {string} onHoldStatus - The new "on hold" status to be applied to the split order.
 * @property {string} onHoldComment - An optional comment explaining why the order is on hold.
 */
export const params = {
  id: {
    type: "string",
  },
  onHoldStatus: {
    type: "string",
  },
  onHoldComment: {
    type: "string",
  },
};
