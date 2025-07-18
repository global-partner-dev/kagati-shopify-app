import { ActionOptions, SplitOrderCancelGlobalActionContext } from "gadget-server";

/**
 * Executes the split order cancellation action.
 * 
 * This function processes split order data, updates the order status to "cancel", restores stock levels for 
 * the relevant line items by adding back the quantities, and logs the process. If any error occurs, it catches 
 * and logs the error.
 * 
 * @async
 * @function run
 * @param {SplitOrderCancelGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action, including the serialized split order data.
 * @param {string} context.params.splitOrderData - A JSON string containing the split order data, including order ID and line items.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform, specifically for finding and updating orders and stock levels.
 * @param {object} context.connections - An object containing connections to external services, though not used in this function.
 * 
 * @returns {Promise<void>} A promise that resolves when the action completes.
 * 
 * @throws {Error} If an error occurs during the process, it is caught, logged, and not rethrown.
 */
export async function run({ params, logger, api, connections }) {
  try {
    // Parse the split order data from the provided JSON string
    const data = JSON.parse(params.splitOrderData)[0];
    let responses = [];
    const orderRefId = data.orderReferenceId;

    // Loop through each line item to restore stock levels
    // for (const item of data.lineItems) {
    //   const response = await api.khagatiOnlineHybridStock.findMany({
    //     select: {
    //       id: true,
    //       hybridStock: true
    //     },
    //     filter: {
    //       outletId: { equals: Number(item.outletId) },
    //       sku: { equals: item.itemReferenceCode }
    //     }
    //   });
    //   // Prepare the stock level update to add back the quantity of the cancelled items
    //   if (response.length) {
    //     responses.push({
    //       id: response[0].id,
    //       hybridStock: response[0].hybridStock + item.quantity
    //     });
    //   }
    // }

    // // Bulk update the stock levels
    // if (responses.length) {
    //   await api.khagatiOnlineHybridStock.bulkUpdate(responses);
    // }

    // Update the split order status to "cancel" and close the on-hold status
    await api.khagatiOrderSplit.update(data.id, {
      orderStatus: "cancel",
      onHoldStatus: "closed"
    });
    await api.cancelShopifyOrder({ id: orderRefId });
    
    const uengageCancelTask = await api.uengageCancelTask({ id: orderRefId });
    
    logger.info({ uengageCancelTask }, "uengageCancelTask========>");
    if (uengageCancelTask.status != true) {
      const error = uengageCancelTask.msg
      return { success: false, error: error };
    } else {
      const { status, status_code, message } = uengageCancelTask;
      const requestData = {
        tplStatusCode : status_code,
        tplMessage: message,
      }
      if (status && status_code === "CANCELLED") {
          await api.khagatiOrderSplit.update(orderRefId, requestData);
        }
    }
    
    // Log success message
    logger.info("Split and Shopiy order cancelled successfully");
  } catch (error) {
    // Log error message if any step fails
    logger.error({ error }, "Error calling split order cancel action");
  }
};


export async function onSuccess({ params, record, logger, api, connections }) {
  try {
    // Parse and log the parameters
    const splitOrderData = JSON.parse(params.splitOrderData)[0];
    logger.info(splitOrderData, "Parsed split order parameters:");

    // Retrieve order reference ID
    const orderRefId = splitOrderData.orderReferenceId;

    // Fetch the order data
    const orderData = await api.khagatiOrder.findMany({
      filter: {
        orderId: { equals: String(orderRefId) }
      },
      select: {
        id: true,
        name: true,
        currency: true,
        customer: true,
        createdAt: true,
        processedAt: true,
        shippingAddress: true,
        billingAddress: true,
        orderStatusUrl: true,
        lineItems: true,
        taxLines: true,
        currentSubtotalPrice: true,
        currentTotalTax: true,
      }
    });

    logger.info({ orderData }, "Retrieved order data:");

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
      // Prepare the SMS request data
      const responseSMS = await api.khagatiSMS({
        smsRequestData: JSON.stringify(smsRequestData),
        subject: "CANCELED"
      });
  
      // Optional: Handle the response if needed
      logger.info("SMS sent successfully:", responseSMS);
    } catch (error) {
      // Handle any errors that occur during the SMS sending process
      logger.error("Failed to send SMS:", error);
    }
    // Send email with order data
    const responseEmail = await api.emailSMPT({ 
      id: splitOrderData.id,
      orderStatus: "canceled" 
    });
    logger.info({ responseEmail }, "Email sent successfully");

  } catch (error) {
    logger.error({ error }, "Error processing onSuccess action");
  }

  // logger.info(shopifyOrderResponse, "shopifyOrderResponse");
  // const phoneNumber = shopifyOrderResponse.shippingAddress.phone
  // const email = shopifyOrderResponse.email
  // const cName = shopifyOrderResponse.shippingAddress.first_name + " " + shopifyOrderResponse.shippingAddress.last_name

}
/** 
 * Parameters required for cancelling a split order.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} splitOrderData - A JSON string containing the split order data, including order ID and line items.
 */
export const params = {
  splitOrderData: {
    type: "string"
  }
}