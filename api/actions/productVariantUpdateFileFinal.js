import { ActionOptions, ProductVariantUpdateFileFinalGlobalActionContext } from "gadget-server";
import { subMinutes } from "date-fns";

// Function to format date to YYYYMMDDHHmmss string
const formatDateToCustomString = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
/**
 * Executes the scheduled product variant inventory update action.
 * 
 * This function synchronizes the product variant inventory data between the ERP system and Shopify.
 * 
 * @async
 * @function run
 * @param {ProductVariantUpdateFileFinalGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<Array>} A promise that resolves to the list of processed product variants.
 * 
 * @throws {Error} If an error occurs during the synchronization process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  const now = new Date();
  const formattedTimestamp = formatDateToCustomString(subMinutes(now, 20));
  await connections.shopify.setCurrentShop("59823030316");
  const shopify = connections.shopify.current;
  const shopId = connections.shopify.currentShop.id;

  const productsVariants = await getProductVariants(api, logger, formattedTimestamp, shopId);
  let invalidRecordsCount = 0; 
  let totalErpRecordsCount = 0;
  let updateCount = 0;
  const inventoryData = [];
  const khagatiData = [];

  for (const record of productsVariants) {
    if (!record.outletId || !record.itemId) {
      invalidRecordsCount++;
      continue;
    }
    const findMrpStock = await api.khagatiShopifyProductVariantInfo.findMany({
      first: 250,
      select: {
        id: true,
        stock: true,
        outletId: true,
        itemId: true,
        inventoryItemId: true
      },
      filter: {
        outletId: { equals: Number(record.outletId) },
        itemId: { equals: String(record.itemId) },
        shop: { equals: shopId }
      }
    });

    totalErpRecordsCount += findMrpStock.length;

    if (findMrpStock.length) {
      const locationId = await getLocationId(api, findMrpStock[0].inventoryItemId, logger);

      if (locationId) {
        khagatiData.push({
          id: findMrpStock[0].id, 
          isNewProduct: false
        });
        inventoryData.push({
          inventoryItemId: findMrpStock[0].inventoryItemId,
          locationId: locationId,
          quantity: record.stock,
        });

        // Perform bulk update every 50 records
        if (inventoryData.length === 50) {
          await performBulkInventoryUpdate(api, shopify, inventoryData, logger);
          const jobs = await api.enqueue(
            api.khagatiShopifyProductVariantInfo.bulkUpdate,
            khagatiData,
            {
              queue: {
                name: "veriant-sync",
              },
            }
          );
          const result = []
  
          for (const job of jobs) {
            result.push(await job.result())
          }
          // Log the results after all jobs have been processed
          logger.info({response: JSON.stringify(result, null, 2)}, "Bulk khagati product variant:");
          updateCount++;
          khagatiData.length = 0; // Clear the array
          inventoryData.length = 0; // Clear the array
        }
      }
    }
  }

  // Perform bulk update for remaining records if any
  if (inventoryData.length > 0) {
    await performBulkInventoryUpdate(api, shopify, inventoryData, logger);
      const jobs = await api.enqueue(
        api.khagatiShopifyProductVariantInfo.bulkUpdate,
        khagatiData,
        {
          queue: {
            name: "veriant-sync",
          },
        }
      );
      const result = []
  
      for (const job of jobs) {
        result.push(await job.result())
      }
      // Log the results after all jobs have been processed
      logger.info({response: JSON.stringify(result, null, 2)}, "Bulk khagati product variant:");
  }
  logger.info(`Number of records with invalid outletId or sku: ${invalidRecordsCount}`);
  logger.info(`Total ERP records processed: ${totalErpRecordsCount}`);
  logger.info(`Total updates made: ${updateCount}`);
  return true
}

/**
 * Performs a bulk inventory update in Shopify using the provided inventory data.
 * 
 * @async
 * @function performBulkInventoryUpdate
 * @param {object} shopify - The Shopify connection object.
 * @param {Array} inventoryData - The inventory data to be updated in Shopify.
 * @param {object} logger - A logger object for recording informational and error messages during execution.
 * 
 * @returns {Promise<number>} The number of records successfully updated in Shopify.
 * 
 * @throws {Error} If an error occurs during the bulk update, it is logged and handled within the function.
 */
const performBulkInventoryUpdate = async (api, shopify, inventoryData, logger) => {
  logger.info(`Performing bulk inventory update`);

  const setQuantities = inventoryData.map((inventory) => ({
    inventoryItemId: `gid://shopify/InventoryItem/${inventory.inventoryItemId}`,
    locationId: `gid://shopify/Location/${inventory.locationId}`,
    quantity: inventory.quantity,
  }));

  const mutation = `#graphql
    mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
      inventorySetOnHandQuantities(input: $input) {
        userErrors {
          field
          message
        }
        inventoryAdjustmentGroup {
          createdAt
          reason
          changes {
            name
            delta
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      reason: "correction",
      setQuantities: setQuantities,
    },
  };

  try {
    const job = await api.enqueue(api.shopifyRequest, {
      query: mutation,
      variables: JSON.stringify(variables),
    });
    const response = await job.result();

    if (!response || Object.keys(response).length === 0) {
      logger.error("The response is empty or undefined. No inventory updates were made.");
      return 0; 
    }

    // logger.info(`Bulk inventory update response: ${JSON.stringify(response)}`);

    // Count successful updates
    if (
      response.inventorySetOnHandQuantities &&
      response.inventorySetOnHandQuantities.inventoryAdjustmentGroup &&
      response.inventorySetOnHandQuantities.inventoryAdjustmentGroup.changes
    ) {
      return response.inventorySetOnHandQuantities.inventoryAdjustmentGroup.changes.length;
    } else {
      // logger.error('Missing data in response:', response);
      return 0;
    }
  } catch (error) {
    logger.error("Error performing bulk inventory update: " + error.message);
    return 0;
  }
};

/**
 * Fetches all product variants from Shopify.
 * 
 * @async
 * @function getProductVariants
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} logger - A logger object for recording informational and error messages during execution.
 * 
 * @returns {Promise<Array|object>} A promise that resolves to the list of product variants or an error object.
 * 
 * @throws {Error} If an error occurs during the fetch operation, it is logged and handled within the function.
 */
const getProductVariants = async (api, logger, formattedTimestamp) => {
  const allRecords = [];

  try {
    let records = await api.erpItem.findMany({
      select: {
        id: true,
        mrp: true,
        stock: true,
        outletId : true,
        itemId : true
      },
      filter: {
        itemTimeStamp: {
          greaterThanOrEqual: formattedTimestamp,
        },
      },
    });

    allRecords.push(...records);

    while (records.hasNextPage) {
      records = await records.nextPage();
      allRecords.push(...records);
    }

    return allRecords;
  } catch (error) {
    logger.error("Error fetching product variants: " + error.message);
    return { error: error.message };
  }
};

/**
 * Fetches the location ID for a given inventory item in Shopify.
 * 
 * @async
 * @function getLocationId
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * @param {string} inventoryItemId - The ID of the inventory item for which the location ID is being fetched.
 * @param {object} logger - A logger object for recording informational and error messages during execution.
 * 
 * @returns {Promise<string|null>} A promise that resolves to the location ID or null if no location is found.
 * 
 * @throws {Error} If an error occurs during the fetch operation, it is logged and handled within the function.
 */
const getLocationId = async (api, inventoryItemId, logger) => {
  try {
    const locationData = await api.shopifyInventoryLevel.findMany({
      select: {
        locationId: true,
      },
      filter: {
        inventoryItemId: { equals: inventoryItemId },
      },
    });

    return locationData.length ? locationData[0].locationId : null;
  } catch (error) {
    logger.error("Error fetching location ID: " + error.message);
    return null;
  }
};

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
  triggers: {
    scheduler: [
      // Run at 7:30, 7:45, 8:00, ..., 22:45, 23:00 IST
      { cron: "*/15 2-17 * * *" }, // 02:00-17:45 UTC (7:30-23:00 IST)
      // Special case for 7:30 IST (02:30 UTC)
      { cron: "30 2 * * *" }
    ],
  },
  timeoutMS: 900000 // 15 minutes for long actions
};