import { BulkAnyGlobalActionContext } from "gadget-server";

/**
 * Main function to enqueue the ERP product synchronization action.
 * 
 * @param {BulkAnyGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the action has been successfully enqueued.
 */
export async function run({ params, logger, api, connections }) {
  try {
    // Enqueue the ERP product sync action with a specific ID and priority
    await api.enqueue(api.erpProductSync, {}, { id: "background-action-55", priority: "PLATFORM" });
    logger.info("ERP product sync action has been successfully enqueued.");
  } catch (error) {
    // Log any errors that occur during the enqueue process
    logger.error(`Failed to enqueue ERP product sync action: ${error.message}`);
  }
}
