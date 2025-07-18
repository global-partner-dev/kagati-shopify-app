import { globalShopifySync, ActionOptions, ScheduledShopifySyncGlobalActionContext } from "gadget-server";

const HourInMs = 60 * 60 * 1000; // Define the duration of an hour in milliseconds

/**
 * Executes the scheduled Shopify synchronization action.
 * 
 * This function filters the Shopify models that are set to sync-only, then triggers a global synchronization for those models,
 * considering changes that occurred in the last 25 hours. The function is designed to run as a scheduled action at a specified time daily.
 * 
 * @async
 * @function run
 * @param {ScheduledShopifySyncGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves when the synchronization completes.
 * 
 * @throws {Error} If an error occurs during the synchronization process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  // Filter models that are set to sync-only and retrieve their API identifiers
  const syncOnlyModels = connections.shopify.enabledModels
    .filter(model => model.syncOnly)
    .map(model => model.apiIdentifier);

  // Calculate the timestamp for data synchronization (25 hours ago from now)
  const syncSince = new Date(Date.now() - 25 * HourInMs);

  // Trigger the global Shopify synchronization for the filtered models
  await globalShopifySync({
    apiKeys: connections.shopify.apiKeys,
    syncSince,
    models: syncOnlyModels
  });
};

/**
 * Action options for the scheduled Shopify synchronization.
 * 
 * @constant
 * @type {ActionOptions}
 * @property {object} triggers - Configuration for scheduling the action.
 * @property {Array} triggers.scheduler - Scheduler configuration specifying when the action should run.
 * @property {string} triggers.scheduler.every - Frequency of the action (e.g., daily).
 * @property {string} triggers.scheduler.at - Specific time when the action should run (in UTC).
 */
export const options = {
  triggers: {
    scheduler: [
      {
        every: "day",
        at: "10:51 UTC" // Set the time for the scheduled synchronization
      }
    ]
  }
};