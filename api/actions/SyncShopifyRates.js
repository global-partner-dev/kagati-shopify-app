import { ActionOptions, SyncShopifyRatesGlobalActionContext } from "gadget-server";

/**
 * This function serves as a global action to sync Shopify shipping rates with the Gadget platform.
 * It can be customized with the desired logic to retrieve, update, or otherwise manipulate shipping rates
 * using the provided `params`, `logger`, `api`, and `connections` objects.
 *
 * @function run
 * @param {SyncShopifyRatesGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters passed to the global action. These can be customized based on the action's requirements.
 * @param {object} context.logger - A logging object for recording informational and error messages during the execution of the action.
 * @param {object} context.api - An object containing API methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, such as Shopify.
 *
 * @returns {Promise<void>} - This function does not return a value but performs operations defined within the custom logic.
 */
export async function run({ params, logger, api, connections }) {
  // Your logic goes here
  // Example: logger.info("Syncing Shopify rates...");
};

/**
 * Configuration options for the global action.
 *
 * @constant
 * @type {ActionOptions}
 * @property {boolean} [runOnSave=false] - Specifies whether the action should automatically run when an associated record is saved.
 * @property {boolean} [runOnCreate=false] - Specifies whether the action should automatically run when an associated record is created.
 * @property {boolean} [runOnDelete=false] - Specifies whether the action should automatically run when an associated record is deleted.
 */
export const options = {};