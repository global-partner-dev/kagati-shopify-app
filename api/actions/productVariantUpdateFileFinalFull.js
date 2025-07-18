import { ProductVariantUpdateFileFinalFullGlobalActionContext } from "gadget-server";
import { subHours, subMinutes } from "date-fns";
const API_ACCESS_TOKEN = process.env.API_TOKEN
const headers = {
  'Content-Type': 'application/json',
  'X-Auth-Token': API_ACCESS_TOKEN,
};
const url = "https://pet-project-india.myshopify.com/admin/api/2024-10/graphql.json"
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

// Function to make a Shopify GraphQL request with error handling
const shopifyRequest = async (shopify, query, variables, logger) => {
  try {
    const response = await shopify.graphql(query, variables);
    return response;
  } catch (error) {
    logger.error(`Error making Shopify request: ${error.message}`);
    throw error;
  }
};
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
const performBulkInventoryUpdate = async (shopify, inventoryData, logger) => {
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

  logger.debug(
    { mutation, mutationJson: JSON.stringify(mutation) },
    "Bulk Inventory Update Mutation"
  );

  try {
    const response = await shopifyRequest(shopify, mutation, variables, logger);
    if (!response || Object.keys(response).length === 0) {
      logger.error("The response is empty or undefined. No inventory updates were made.");
      return false;
    }
    logger.info(
      `Bulk inventory update response: ${JSON.stringify(response)}`
    );

    // Count successful updates
    const updatedRecords = response.inventorySetOnHandQuantities.inventoryAdjustmentGroup.changes.length;
    return updatedRecords;
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
const getProductVariants = async (api, logger, shopId) => {
  //logger.info("Fetching all product variants");

  const allRecords = [];

  try {
    let records = await api.khagatiShopifyProductVariantInfo.findMany({
      first: 250,
      select: {
        id: true,
        stock: true,
        outletId: true,
        itemId: true,
        inventoryItemId: true
      },
      filter: {
        isNewProduct: { equals: true },
        shop: { equals: shopId }
      }
    });

    //logger.info(`Initial fetch of product variants: ${JSON.stringify(records)}`);
    allRecords.push(...records);

    while (records.hasNextPage) {
      // logger.info("Fetching next page of product variants");
      records = await records.nextPage();
      // logger.info(`Fetched next page of product variants: ${JSON.stringify(records)}`);
      allRecords.push(...records);
    }

    //logger.info(`All product variants fetched: ${JSON.stringify(allRecords)}`);
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
  //logger.info(`Fetching location ID for inventoryItemId: ${inventoryItemId}`);

  try {
    const locationData = await api.shopifyInventoryLevel.findMany({
      select: {
        locationId: true,
      },
      filter: {
        inventoryItemId: { equals: inventoryItemId },
      },
    });

    //logger.info(`Fetched location data: ${JSON.stringify(locationData)}`);
    return locationData.length ? locationData[0].locationId : null;
  } catch (error) {
    logger.error("Error fetching location ID: " + error.message);
    return null;
  }
};

/**
 * Main function to run the stock data synchronization process.
 *
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves to the list of processed product variants.
 * 
 * @throws {Error} If an error occurs during the synchronization process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  let syncStatus;
  try {
    // Find the existing sync status
    syncStatus = await api.khagatiSyncStatus.findFirst({
      sort: { lastSyncStartedAt: "Descending" }
    });

    if (!syncStatus) {
      throw new Error("No sync status found. Price sync should run first.");
    }

    // Update status to show inventory sync is running
    await api.khagatiSyncStatus.update(syncStatus.id, {
      syncTypes: {
        ...syncStatus.syncTypes,
        inventorySync: {
          status: "running"
        }
      }
    });

    await connections.shopify.setCurrentShop("59823030316");
    const shopify = connections.shopify.current;
    const shopId = connections.shopify.currentShop.id
    if (!shopify) {
      throw new Error("Missing Shopify connection");
    }
    const productsVariants = await getProductVariants(api, logger, shopId);

    let allPagesProcessedSuccessfully = true;
    let invalidRecordsCount = 0;
    let totalErpRecordsCount = 0;
    let updateCount = 0
    const inventoryData = [];
    const khagatiData = []

    for (const record of productsVariants) {
      if (!record.outletId || !record.itemId) {
        // logger.warn(`Invalid outletId or sku for record: ${JSON.stringify(record)}`);
        invalidRecordsCount++;
        continue;
      }

      const findMrpStock = await api.erpItem.findMany({
        select: {
          id: true,
          mrp: true,
          stock: true,
        },
        filter: {
          outletId: { equals: record.outletId },
          itemId: { equals: Number(record.itemId) }
        },
      });
      //logger.info(`Fetched MRP and stock data: ${JSON.stringify(findMrpStock)}`);
      totalErpRecordsCount += findMrpStock.length;
      // logger.info(`Total ERP records found so far: ${totalErpRecordsCount}`);

      if (findMrpStock.length) {
        const locationId = await getLocationId(api, record.inventoryItemId, logger);
        khagatiData.push({
          id: record.id,
          stock: record.stock,
          isNewProduct: false
        });
        //  logger.info(`Fetched location ID: ${locationId}`);

        if (locationId) {
          inventoryData.push({
            inventoryItemId: record.inventoryItemId,
            locationId: locationId,
            quantity: findMrpStock[0].stock,
          });

          if (inventoryData.length === 50) {
            const updatedProductVariants = await performBulkInventoryUpdate(shopify, inventoryData, logger);
            updateCount++
            const updatedKhagatiProductVariants = await api.khagatiShopifyProductVariantInfo.bulkUpdate(khagatiData)
            logger.info({ responseKhagati: updatedKhagatiProductVariants }, `response khagati---- ${updateCount}`)
            khagatiData.length = 0; // Clear the array
            inventoryData.length = 0; // Clear the array
            // totalErpRecordsCount = 0;
          }
        }
      }
    }
    // Perform bulk update for remaining records if any
    if (inventoryData.length > 0) {
      const updatedProductVariants2 = await performBulkInventoryUpdate(shopify, inventoryData, logger);
      const updatedKhagatiProductVariants2 = await api.khagatiShopifyProductVariantInfo.bulkUpdate(khagatiData)
      // totalErpRecordsCount = 0;
    }

    logger.info(`Number of records with invalid outletId or sku: ${invalidRecordsCount}`);

    // Update final status
    await api.khagatiSyncStatus.update(syncStatus.id, {
      isSyncing: false,
      lastSyncCompletedAt: new Date(),
      syncTypes: {
        ...syncStatus.syncTypes,
        inventorySync: {
          status: "completed",
          completedAt: new Date()
        }
      },
      overallStatus: "completed"
    });

    return { result: allPagesProcessedSuccessfully };
  } catch (error) {
    if (syncStatus) {
      await api.khagatiSyncStatus.update(syncStatus.id, {
        syncTypes: {
          ...syncStatus.syncTypes,
          inventorySync: {
            status: "failed",
            completedAt: new Date()
          }
        },
        overallStatus: "failed",
        lastSyncCompletedAt: new Date()
      });
    }
    throw error;
  }
}

export const options = { timeoutMS: 900000, triggers: {} };