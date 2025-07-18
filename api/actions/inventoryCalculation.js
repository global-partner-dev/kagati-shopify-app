import { ActionOptions, InvertoryCalculationGlobalActionContext, logger } from "gadget-server";

/**
 * Main function to execute the inventory calculation.
 * 
 * @param {InvertoryCalculationGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the inventory calculation is completed.
 */
export async function run(context) {
  const { params, logger, api } = context;

  try {
    // Execute inventory calculation based on the current mode
    const inventoryMode = await getInventoryMode(api, logger);
    await executeInventoryCalculation(api, inventoryMode, logger);
  } catch (error) {
    // Log any errors during the process
    logger.error({ error }, "Error during Inventory Calculation");
  }
}

/**
 * Retrieves the current inventory mode from the system settings.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with external services.
 * @param {Object} logger - Logger for logging information or errors.
 * @returns {Promise<string>} The current inventory mode as a string.
 */
async function getInventoryMode(api, logger) {
  try {
    const settings = await api.khagatiSetting.findMany({
      select: { value: true },
      filter: { value: { equals: "primary" } },
    });

    const inventoryMode = settings[0]?.value;
    logger.info({ inventoryMode }, "Retrieved Inventory Mode");
    return inventoryMode;
  } catch (error) {
    logger.error({ error }, "Error fetching inventory mode");
    throw new Error("Failed to retrieve inventory mode");
  }
}

/**
 * Executes the appropriate inventory calculation based on the mode.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with external services.
 * @param {string} inventoryMode - The current inventory mode to determine the calculation logic.
 * @param {Object} logger - Logger for logging information or errors.
 * @returns {Promise<void>} Resolves when the calculation is complete.
 */
async function executeInventoryCalculation(api, inventoryMode, logger) {
  try {
    switch (inventoryMode) {
      case "primary_with_backup":
        await api.primaryWithBackupInventoryCalculation();
        logger.info("Executed primary_with_backup inventory calculation");
        break;
      case "cluster":
        await api.clusterInventoryCalculation();
        logger.info("Executed cluster inventory calculation");
        break;
      case "primary":
        await api.primaryInventoryCalculation();
        logger.info("Executed primary inventory calculation");
        break;
      default:
        logger.warn({ inventoryMode }, "Unsupported inventory mode");
        throw new Error("Unsupported inventory mode");
    }
  } catch (error) {
    logger.error({ error }, "Error during inventory calculation execution");
    throw error;
  }
}

/**
 * Action options configuration.
 * 
 * @type {ActionOptions}
 * @property {number} timeoutMS - The timeout for the action in milliseconds (900000ms = 15 minutes).
 * @property {boolean} transactional - Specifies whether the action should be transactional.
 */
export const options = {
  timeoutMS: 900000,
  transactional: false,
};
