import { ActionOptions, PrimaryWithBackupInventoryCalculationGlobalActionContext } from "gadget-server";

/**
 * Executes the Primary With Backup Inventory Calculation action.
 * 
 * This function processes the inventory by fetching product variants, checking available stock in primary and backup stores,
 * and updating or creating inventory records accordingly. The process includes logging, error handling, and ensuring that the inventory
 * reflects accurate stock levels from both primary and backup sources.
 * 
 * @async
 * @function run
 * @param {PrimaryWithBackupInventoryCalculationGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves when the inventory calculation and updates are complete.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  // Log the start of the inventory calculation process
  logger.info("Inventory Primary With Backup calculation started");

  let updates = [];
  let creations = [];

  // Fetch product variants
  let productSku = await getProductVariants(api);
  logger.info(productSku, "productSku");

  // Process each product variant
  while (true) {
    for (const item of productSku) {
      const stock = await getStock(api, item.sku);
      await processPrimaryWithBackupStocks(api, logger, item, stock, updates, creations);
    }

    // Break if there are no more pages of product variants
    if (!productSku.hasNextPage) break;
    productSku = await productSku.nextPage();
  }

  // Log the end of the inventory calculation process
  logger.info("Inventory Primary With Backup calculation ended");
}

/**
 * Fetches product variants from Shopify.
 * 
 * @async
 * @function getProductVariants
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of product variants.
 */
async function getProductVariants(api) {
  return api.shopifyProductVariant.findMany({
    first: 250,
    select: {
      id: true,
      title: true,
      sku: true,
      product: {
        id: true,
        title: true,
        images: {
          edges: {
            node: {
              source: true,
              alt: true
            }
          }
        }
      },
    },
  });
}

/**
 * Fetches stock data from the ERP system based on the SKU.
 * 
 * @async
 * @function getStock
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * @param {string} sku - The SKU of the product variant.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of stock data.
 */
async function getStock(api, sku) {
  return api.erpStock.findMany({
    select: { itemReferenceCode: true, stock: true, outletId: true },
    filter: { itemReferenceCode: { equals: sku } },
  });
}

/**
 * Processes the stock data for both primary and backup stores and updates or creates inventory records.
 * 
 * @async
 * @function processPrimaryWithBackupStocks
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} logger - A logger object for recording informational and error messages during execution.
 * @param {object} item - The product variant data.
 * @param {Array} stock - The stock data for the product variant.
 * @param {Array} updates - An array to collect update operations.
 * @param {Array} creations - An array to collect create operations.
 * 
 * @returns {Promise<void>} A promise that resolves when the processing is complete.
 */
async function processPrimaryWithBackupStocks(api, logger, item, stock, updates, creations) {
  for (const stockItem of stock) {
    const backupStore = await getBackupStore(api, stockItem.outletId);
    const existingStock = await getExistingStock(api, stockItem.outletId, item.sku);

    let backUpStock = 0;
    if (backupStore.length > 0) {
      const backupStockItem = stock.find(si => si.outletId.toString() === backupStore[0].selectBackupWarehouse);
      if (backupStockItem) {
        backUpStock = backupStockItem.stock;
      }
    }

    logger.info(item, "item");

    if (existingStock.length > 0) {
      updates.push({
        id: existingStock[0].id,
        primaryStock: stockItem.stock,
        backUpStock,
        hybridStock: stockItem.stock + backUpStock,
      });
    } else {
      creations.push({
        variantTitle: item.title,
        variantId: item.id,
        primaryStock: stockItem.stock,
        backUpStock,
        productImage: item.product.images.edges.length ? item.product.images.edges[0].node.source : "",
        productTitle: item.product ? item.product.title : "",
        productId: item.product ? item.product.id : "",
        outletId: stockItem.outletId,
        sku: item.sku,
        hybridStock: stockItem.stock + backUpStock,
      });
    }
    await saveUpdatesAndCreations(api, logger, updates, creations);
  }
}

/**
 * Fetches the backup store information based on the outlet ID.
 * 
 * @async
 * @function getBackupStore
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * @param {string} outletId - The ID of the primary outlet.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array containing backup store information.
 */
async function getBackupStore(api, outletId) {
  return api.khagatiStores.findMany({
    select: { selectBackupWarehouse: true },
    filter: {
      erpStoreId: { equals: String(outletId) },
      status: { in: ["Active"] }
    }
  });
}

/**
 * Fetches the existing stock record for a specific outlet and SKU.
 * 
 * @async
 * @function getExistingStock
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * @param {string} outletId - The ID of the outlet.
 * @param {string} sku - The SKU of the product variant.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of existing stock records.
 */
async function getExistingStock(api, outletId, sku) {
  return api.khagatiOnlineHybridStock.findMany({
    select: { id: true },
    filter: {
      outletId: { equals: outletId },
      sku: { equals: sku },
    },
  });
}

/**
 * Saves updates and creates new inventory records based on the processed stock data.
 * 
 * @async
 * @function saveUpdatesAndCreations
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} logger - A logger object for recording informational and error messages during execution.
 * @param {Array} updates - An array of update operations to be performed.
 * @param {Array} creations - An array of create operations to be performed.
 * 
 * @returns {Promise<void>} A promise that resolves when the updates and creations are complete.
 */
async function saveUpdatesAndCreations(api, logger, updates, creations) {
  if (updates.length > 0) {
    await api.khagatiOnlineHybridStock.bulkUpdate(updates);
    logger.info(updates, "Inventory updated");
    updates.length = 0; // Empty the updates array
  }
  if (creations.length > 0) {
    await api.internal.khagatiOnlineHybridStock.bulkCreate(creations);
    logger.info(creations, "Inventory created");
    creations.length = 0; // Empty the creations array
  }
}

/**
 * Action options for the Primary With Backup Inventory Calculation action.
 * 
 * @constant
 * @type {ActionOptions}
 * @property {number} timeoutMS - The maximum time (in milliseconds) that the action is allowed to run.
 * @property {boolean} transactional - Whether the action should be executed in a transactional context.
 */
export const options = {
  timeoutMS: 900000,
  transactional: false
};