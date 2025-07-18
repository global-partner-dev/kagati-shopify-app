import { SplitOrderOnHoldStatusGlobalActionContext } from "gadget-server";

/**
 * This function handles updating the "on hold" status of a split order.
 * It retrieves the relevant split order by its ID, updates its "on hold" status with the provided value,
 * and logs both the successful completion and any errors encountered during the process.
 *
 * @function run
 * @param {SplitOrderOnHoldStatusGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters passed to the global action, including the ID of the split order and the new on hold status.
 * @param {string} context.params.id - The ID of the split order that needs to be updated.
 * @param {string} context.params.onHoldStatus - The new "on hold" status to be applied to the split order.
 * @param {object} context.logger - A logging object for recording informational and error messages during the execution of the action.
 * @param {object} context.api - An object containing API methods for interacting with the Gadget platform, specifically for finding and updating orders.
 * @param {object} context.connections - An object containing connections to external services, though not utilized in this function.
 *
 * @returns {Promise<void>} - This function does not return a value but updates the "on hold" status of the split order and logs the process.
 *
 * @throws {Error} If there is an error in fetching or updating the order, the error is caught, logged, and not rethrown.
 */
export async function run({ params, logger, api, connections }) {
  try {
    // Update the "on hold" status of the split order
    await api.khagatiOrderSplit.update(params.id, {
      onHoldStatus: params.onHoldStatus,
    });

    // Log success message
    logger.info("Split order on hold successfully");
  } catch (error) {
    // Log error message if any step fails
    logger.error({ error }, "Error calling split order on hold action");
  }
}

/**
 * Parameters required for updating the "on hold" status of a split order.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} id - The ID of the split order that needs to be updated.
 * @property {string} onHoldStatus - The new "on hold" status to be applied to the split order.
 */
export const params = {
  id: {
    type: "string",
  },
  onHoldStatus: {
    type: "string",
  },
};