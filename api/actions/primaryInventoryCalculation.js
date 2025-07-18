import { ActionOptions, PrimaryInventoryCalculationGlobalActionContext } from "gadget-server";

/**
 * Executes the Primary Inventory Calculation action.
 * 
 * This function processes the inventory by fetching product variants, checking available stock,
 * and updating or creating inventory records accordingly. The process includes logging, error handling,
 * and ensuring that the inventory reflects accurate stock levels from the primary source.
 * 
 * @async
 * @function run
 * @param {PrimaryInventoryCalculationGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services.
 * 
 * @returns {Promise<void>} A promise that resolves when the inventory calculation and updates are complete.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  // Log the start of the inventory calculation process
  logger.info("Inventory Primary calculation started");

  let updates = [];
  let creations = [];

  // Fetch product variants
  let products = await getProductVariants(api);

  for (const item of products) {
    const stock = await getStock(api, item.sku, item.option2);
    if (stock.length) {
      await processPrimaryStocks(api, logger, item, stock, updates, creations);
    }
  }

  // Log the end of the inventory calculation process
  logger.info("Inventory Primary calculation ended");
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
async function getProductVariants(api, logger) {
  const allProducts = [];

  let records = await api.shopifyProductVariant.findMany({
    first: 250,
    select: {
      id: true,
      title: true,
      sku: true,
      option2: true,
      product: {
        id: true,
        title: true,
        status: true,
        images: {
          edges: {
            node: {
              source: true,
              alt: true
            }
          }
        }
      },
    }
  });

  allProducts.push(...records);

  while (records.hasNextPage) {
    records = await records.nextPage();
    allProducts.push(...records);
  }

  const activeProducts = allProducts.filter(item => item.product.status === "active");

  return activeProducts;
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
async function getStock(api, sku, outletid) {
  return api.erpStock.findMany({
    select: { itemReferenceCode: true, stock: true, outletId: true },
    filter: {
      itemReferenceCode: { equals: sku },
      outletId: { equals: Number(outletid) }
    },
  });
}

/**
 * Processes the stock data for primary stores and updates or creates inventory records.
 * 
 * @async
 * @function processPrimaryStocks
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} logger - A logger object for recording informational and error messages during execution.
 * @param {object} item - The product variant data.
 * @param {Array} stock - The stock data for the product variant.
 * @param {Array} updates - An array to collect update operations.
 * @param {Array} creations - An array to collect create operations.
 * 
 * @returns {Promise<void>} A promise that resolves when the processing is complete.
 */
async function processPrimaryStocks(api, logger, item, stock, updates, creations) {
  const existingStock = await getExistingStock(api, stock[0].outletId, item.sku);

  if (existingStock.length > 0) {
    updates.push({
      id: existingStock[0].id,
      primaryStock: stock[0].stock,
      hybridStock: stock[0].stock,
    });
  } else {
    creations.push({
      variantTitle: item.title,
      variantId: item.id,
      primaryStock: stock[0].stock,
      productImage: item.product.images && item.product.images.edges.length ? item.product.images.edges[0].node.source : "",
      productTitle: item.product ? item.product.title : "",
      productId: item.product ? item.product.id : "",
      outletId: stock[0].outletId,
      sku: item.sku,
      hybridStock: stock[0].stock,
    });
  }

  await saveUpdatesAndCreations(api, logger, updates, creations);
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
    updates.length = 0;
  }
  if (creations.length > 0) {
    await api.internal.khagatiOnlineHybridStock.bulkCreate(creations);
    logger.info(creations, "Inventory created");
    creations.length = 0;
  }
}

/**
 * Action options for the Primary Inventory Calculation action.
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