
import { ActionOptions, SplitOrderReadyForPickupGlobalActionContext } from "gadget-server";

/**
 * This function handles the process of marking a split order as "ready for pickup".
 * It fetches the relevant split order data, updates its status, and then triggers the creation 
 * of a corresponding porter order using the Gadget platform's API. The function logs the success
 * or failure of these operations.
 *
 * @function run
 * @param {SplitOrderReadyForPickupGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters passed to the global action, including the ID of the split order.
 * @param {string} context.params.id - The ID of the split order that needs to be updated.
 * @param {object} context.logger - A logging object for recording informational and error messages during the execution of the action.
 * @param {object} context.api - An object containing API methods for interacting with the Gadget platform, including methods to find, update, and create orders.
 * @param {object} context.connections - An object containing connections to external services, although it is not used in this specific function.
 *
 * @returns {Promise<void>} - This function does not return a value but updates the status of the split order and logs the process.
 *
 * @throws {Error} If there is an error in fetching, updating, or creating orders, the error is caught, logged, and not rethrown.
 * shipping Confirmation
 */
export async function run({ params, logger, api, connections }) {
  try {
    // Fetch split order data by ID
    const splitOrderData = await api.khagatiOrderSplit.findMany({
      select: {
        id: true,
        orderReferenceId: true,
        erpStoreId: true,
        timeStamp:true
      },
      filter: {
        id: { equals: params.id },
      },
    });
    if (!splitOrderData) {
      throw new Error('Order not found');
    }
    const existingTimestamp = splitOrderData[0].timeStamp || {};
    const updatedTimestamp = {
      ...existingTimestamp,
      ready_for_pickup: Date.now() // Add current timestamp
    };

    // Update the split order status to "ready for pickup" and close its on-hold status
    await api.khagatiOrderSplit.update(splitOrderData[0].id, {
      orderStatus: "ready_for_pickup",
      onHoldStatus: "closed",
      timeStamp:updatedTimestamp
    });

    // Trigger the creation of a porter order
    // await api.porterCreateOrder({
    //   orderId: splitOrderData[0].orderReferenceId,
    //   erpStoreId: splitOrderData[0].erpStoreId
     
    // });

    // Log success message
    logger.info("Split order ready for pickup successfully");
  } catch (error) {
    // Log error message if any step fails
    logger.error({ error }, "Error calling split order ready for pickup action");
  }
}




export async function onSuccess({ params, logger, api, connections }) {
  try {
    logger.info(params, "params in");

    // Get the splitOrderData using the provided ID
    const splitOrderId = params.id;
    const splitOrderData = await api.khagatiOrderSplit.findOne(splitOrderId, {
      select: {
        id: true,
        orderReferenceId: true,
        orderNumber: true,
        lineItems: true,
      },
    });

    logger.info(splitOrderData, "splitOrderData fetched");

    // Use the orderReferenceId to get Shopify order details
    const orderRefId = splitOrderData.orderReferenceId;
    logger.info(orderRefId, "orderRefId=========>");
    // const shopifyOrderResponse = await api.shopifyOrder.findOne(orderRefId, {
    //   select: {
    //     id: true,
    //     email: true,
    //     name: true,
    //     processedAt: true,
    //     currentSubtotalPrice: true,
    //     currentTotalTax: true,
    //     currentTotalPrice: true,
    //     shippingAddress: true,
    //   },
    //   select: {
    //     name: true,
    //     currency: true,
    //     customer: true,
    //     createdAt: true,
    //     processedAt: true,
    //     shippingAddress: true,
    //     billingAddress: true,
    //     orderStatusUrl: true,
    //     lineItems: true,
    //     taxLines: true,
    //     currentSubtotalPrice: true,
    //     currentTotalTax: true,
    //   }
    // });

    const uengageAbility = await api.uengageServiceAbility({ id: orderRefId });
    logger.info({ uengageAbility }, "uengageAbility========>");
    
    if (uengageAbility.error) {
      logger.error(uengageAbility.error);
      await api.khagatiOrderSplit.update(splitOrderId, {
        tplMessage: {
          status: "error",
          msg: uengageAbility.error
        }
      });
      return { success: false, error: uengageAbility.error };
    }

    if (uengageAbility.serviceability.locationServiceAble && uengageAbility.serviceability.riderServiceAble) {
      const { status, payouts } = uengageAbility;
      const { total, price, tax } = payouts;
      
      await api.khagatiOrderSplit.update(splitOrderId, {
        tplMessage: {
          status: "info",
          msg: "Order is available"
        },
        tplPayoutPrice: Number(price.toFixed(2)),
        tplPayoutTax: Number(tax.toFixed(2)),
        tplPayoutTotal: Number(total.toFixed(2)),
        tplStatus: true
      });
    }

    const uengageCreateTask = await api.uengageCreateTask({ id: orderRefId });
    logger.info({ uengageCreateTask: uengageCreateTask}, "uengageCreateTask========>");
    if (!uengageCreateTask.status) {
      const error = uengageCreateTask.message
      return { success: false, error: error };
    }
    const { status, vendor_order_id, taskId, message, Status_code } = uengageCreateTask;
    const requestData = {
      tplStatus: status,
      tplTaskId: String(taskId),
      tplStatusCode: Status_code,
      tplMessage: {
        "status": "info",
        "msg": message
      }
    };
    logger.info({ requestData: requestData}, "requestData in ready_for_pick_up========>");
    try {
      if (status && Status_code === "ACCEPTED") {
        await api.khagatiOrderSplit.update(splitOrderId, requestData);
        logger.info(`Order split updated successfully for ID: ${orderRefId}`);
      }
    } catch (error) {
      logger.error({error: error}, `Error updating order split for ID: ${orderRefId}`);
      // Optionally, log more details or take alternative action if necessary
    }
    // Return a success message
    return { success: true, message: "Order Task Create in Uengage successfully." };

  } catch (error) {
    logger.error({ error }, "Error in onSuccess function");
    return { success: false, error: "Failed to process order." };
  }
}

/**
 * Parameters required for marking a split order as ready for pickup.
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
