import { ActionOptions, SplitOrderConfirmGlobalActionContext } from "gadget-server";

/**
 * Executes the split order confirmation action.
 * 
 * @async
 * @function run
 * @param {SplitOrderConfirmGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {string} context.params.splitOrderData - A JSON string containing the split order data, including order ID and line items.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * 
 * @returns {Promise<void>} A promise that resolves when the action completes.
 */
export async function run({ params, logger, api }) {
  try {
    // Parse the split order data from the provided JSON string
    const splitOrderData = JSON.parse(params.splitOrderData)[0];

    // Fetch the split order data using the parsed ID
    const fetchedOrderData = await api.khagatiOrderSplit.findMany({
      select: {
        id: true,
        orderReferenceId: true,
        timeStamp:true,
        erpStoreId: true,
      },
      filter: {
        id: { equals: splitOrderData.id }
      }
    });

    logger.info({ fetchedOrderData }, "Fetched split order data:");

    const orderReferenceId = fetchedOrderData[0]?.orderReferenceId;
    const erpStoreId = fetchedOrderData[0]?.erpStoreId;

    // Check if order data was found
    if (!orderReferenceId || !erpStoreId) {
      logger.warn("Order reference ID or ERP store ID is missing.");
      return; // Exit if data is not found
    }

    const existingTimestamp = fetchedOrderData[0].timeStamp || {};
    const updatedTimestamp = {
      ...existingTimestamp,
      confirm: Date.now() // Add current timestamp
    };

    await api.khagatiOrderSplit.update(fetchedOrderData[0].id, {
      orderStatus: "confirm",
      onHoldStatus: "closed",
      timeStamp:updatedTimestamp
    });

    // Trigger an ERP order push with the order reference ID and store ID
    await api.erpOrderPush({
      orderId: orderReferenceId,
      erpStoreId: erpStoreId,
      lineItems: JSON.stringify(splitOrderData.lineItems)
    });

    // Log success message
    logger.info("Split order confirmed successfully");

  } catch (error) {
    // Log error message if any step fails
    logger.error({ error }, "Error during split order confirmation");
  }
};

/**
 * On success handler for further processing after the split order confirmation.
 * 
 * @async
 * @function onSuccess
 * @param {object} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.record - The record affected by the action.
 * @param {object} context.logger - A logger object for recording messages.
 * @param {object} context.api - An API object for interacting with Gadget platform.
 * 
 * @returns {Promise<void>} A promise that resolves when processing is complete.
 */
export async function onSuccess({ params, record, logger, api }) {
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
    
  } catch (error) {
    logger.error({ error }, "Error processing onSuccess action");
  }
};

/** 
 * Parameters required for confirming a split order.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} splitOrderData - A JSON string containing the split order data, including order ID and line items.
 */
export const params = {
  splitOrderData: {
    type: "string"
  }
};