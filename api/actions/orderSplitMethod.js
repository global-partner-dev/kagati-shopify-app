import { ActionOptions, OrderSplitMethodGlobalActionContext } from "gadget-server";

/**
 * Function to execute the global action for splitting an order based on specified or automatically determined criteria.
 * 
 * This function is designed to be used as a global action within the Gadget server environment. 
 * It handles the splitting of an order by either a specified method (`orderType`) or by automatically 
 * determining the split method based on the current system settings.
 * 
 * @param {OrderSplitMethodGlobalActionContext} context - The context object containing parameters and resources
 * for executing the global action. The context includes:
 * 
 * @param {Object} context.params - Parameters passed to the global action. This typically includes:
 *  - `orderId`: The ID of the order that needs to be split.
 *  - `orderType`: (Optional) The type of split to apply to the order. If not provided, the function will 
 *    automatically determine the split method based on system settings.
 * 
 * @param {Object} context.logger - Logger object that can be used to log information, warnings, errors, etc.,
 * during the execution of the action.
 * 
 * @param {Object} context.api - API object that provides methods for interacting with the Gadget server's backend services,
 * including performing the order split operations.
 * 
 * @param {Object} context.connections - Connections object that can be used to interact with other services or databases
 * connected to the Gadget server.
 * 
 * @returns {Promise<void>} - The function is asynchronous and returns a Promise. The function's logic should handle
 * any asynchronous operations, such as API calls, within its implementation.
 * 
 * @example
 * // Example usage of the run function:
 * await run({
 *   params: { orderId: "12345", orderType: "manual" },
 *   logger: console,
 *   api: gadgetApi,
 *   connections: someDatabaseConnection
 * });
 */
export async function run({ params, logger, api, connections }) {
  logger.info({splitmethod : params}, "splitmethod--->")
  if (!params.orderId) {
    logger.error("params does not have an order id.");
    return;
  }
  
  logger.info(params, "Params Here!");

  try {
    if (params.orderType) {
      logger.info({here: params.orderType}, "params ordertype--->")
      // Manual order split based on the provided orderType
      await api.manualOrderSplit({
        orderId: params.orderId,
        orderType: params.orderType,
      });
    } else {
      // Automatic order split based on system settings
      logger.info("i am here auto order");
      const inventoryMode = await api.khagatiSetting.findMany({
        select: {
          value: true,
        },
        filter: {
          id: { equals: 7 },
        }
      });

      // Determine the order split method based on inventory mode
      // if (inventoryMode[0].value === "primary_with_backup") {
      //   await api.primaryWithBackupOrderSplit({
      //     orderId: params.orderId,
      //   });
      // } else if (inventoryMode[0].value === "cluster") {
      //   await api.clusterOrderSplit({
      //     orderId: params.orderId,
      //   });
      // } else if (inventoryMode[0].value === "primary") {
      //   await api.primaryOrderSplit({
      //     orderId: params.orderId,
      //   });
      // }
    }
    logger.info("Order Split Successfully");
  } catch (error) {
    logger.error({ error }, "Error calling order split method global action");
  }
};

/**
 * Parameters for the order split global action.
 * 
 * @type {Object}
 */
export const params = {
  orderId: {
    type: "string",
    description: "The ID of the order to be split.",
  },
  orderType: {
    type: "string",
    description: "The method of order split to apply. If not provided, the system will determine the method automatically.",
  }
};