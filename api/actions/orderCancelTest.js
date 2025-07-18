import { ActionOptions } from "gadget-server";

const orders = [
      "#1097", "#1105", "#2942"
  ];

/**
 * Executes the order cancellation test action.
 * 
 * This function processes a list of orders, finds them in the system, and prepares them for cancellation.
 * 
 * @async
 * @function run
 * @param {Object} context - The context object provided by Gadget Server.
 * @param {Object} context.params - Parameters provided to the global action.
 * @param {Object} context.logger - A logger object for recording informational and error messages.
 * @param {Object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {Object} context.connections - An object containing connections to external services.
 * 
 * @returns {Promise<string[]>} A promise that resolves to an array of order IDs.
 */
export async function run({ params, logger, api, connections }) {
    let orderIds = [];
    try {
        for (const orderId of orders) {
            logger.info({ orderId: orderId }, "Processing order");
            const order = await api.shopifyOrder.findMany({
                filter: {
                    name: { equals: orderId },
                }
            });
            if(!order.length > 0) {
                logger.warn({ orderId: orderId }, "Order not found");
                continue;
            }
            const splitOrder = await api.khagatiOrderSplit.findMany({
                filter: {
                    orderReferenceId: { equals: order[0].id }
                }
            });
            
            if (order.length > 0 && splitOrder.length > 0) {
                logger.info({ orderId: order[0].id }, "Found order for cancellation");
                orderIds.push(order[0].id);

                await api.splitOrderCancel({
                    splitOrderData: JSON.stringify([{
                        orderReferenceId: order[0].id,
                        id: splitOrder[0].id
                    }])
                });
                // Introduce a delay of 1 second
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                logger.warn({ orderId }, "Order not found");
            }
        }
    } catch (error) {
        logger.error({ error }, "Error in order cancellation test");
        logger.info({ orderIds }, "Order IDs");
        throw error; // Re-throw to let Gadget handle the error
    }

    return orderIds;
}


/**
 * Action options for the scheduled product variant inventory update.
 * 
 * @constant
 * @type {ActionOptions}
 * @property {object} triggers - Configuration for scheduling the action.
 * @property {Array} triggers.scheduler - Scheduler configuration specifying when the action should run.
 * @property {string} triggers.scheduler.cron - Cron expression defining the schedule (every 15 minutes).
 */
export const options = {
    timeoutMS: 900000 // 15 minutes for long actions
};