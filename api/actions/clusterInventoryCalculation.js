import { ActionOptions, ClusterInventoryCalculationGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the inventory cluster calculation process.
 * 
 * @param {ClusterInventoryCalculationGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the inventory calculation process is completed.
 */
export async function run({ params, logger, api, connections }) {
  logger.info("Inventory Cluster calculation started");

  let updates = [];
  let creations = [];

  let productSku = await getProductVariants(api);
  const clusterGroups = await getClusterGroups(api);

  // Iterate over product SKUs and calculate inventory
  while (true) {
    for (const item of productSku) {
      const stock = await getStock(api, item.sku);
      await processClusterStocks(api, logger, item, stock, clusterGroups, updates, creations);
    }

    // Check if there are more pages to process
    if (!productSku.hasNextPage) break;
    productSku = await productSku.nextPage();
  }

  logger.info("Inventory Cluster calculation ended");
}

/**
 * Fetches product variants from Shopify.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with external services.
 * @returns {Promise<Object>} A promise that resolves with the product variants data.
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
 * Fetches cluster groups from the local ERP system.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with the local ERP system.
 * @returns {Promise<Object>} A promise that resolves with the cluster groups data.
 */
async function getClusterGroups(api) {
  const allCluster = await api.khagatiStores.findMany({
    select: { erpStoreId: true, storeCluster: true },
    filter: {
      status: { equals: "active" }
    }
  });

  const clusterGroups = {};
  allCluster.forEach(({ erpStoreId, storeCluster }) => {
    if (!clusterGroups[storeCluster]) {
      clusterGroups[storeCluster] = [];
    }
    clusterGroups[storeCluster].push({ erpStoreId, storeCluster });
  });

  return clusterGroups;
}

/**
 * Fetches stock information for a given SKU.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with the local ERP system.
 * @param {string} sku - The SKU of the product variant.
 * @returns {Promise<Object>} A promise that resolves with the stock data.
 */
async function getStock(api, sku) {
  return api.erpStock.findMany({
    select: { itemReferenceCode: true, stock: true, outletId: true },
    filter: { itemReferenceCode: { equals: sku } },
  });
}

/**
 * Processes stock data across stores in a cluster and updates or creates inventory records.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with the local ERP system.
 * @param {Object} logger - Logger object to log information and errors.
 * @param {Object} item - The product variant data.
 * @param {Object} stock - The stock data for the product variant.
 * @param {Object} clusterGroups - The cluster groups data.
 * @param {Array} updates - The array to store updates to be made.
 * @param {Array} creations - The array to store new records to be created.
 * @returns {Promise<void>} A promise that resolves when the stock processing is completed.
 */
async function processClusterStocks(api, logger, item, stock, clusterGroups, updates, creations) {
  for (const stockItem of stock) {
    const existingStock = await getExistingStock(api, stockItem.outletId, item.sku);
    const clusterStock = await getClusterStock(api, stockItem.outletId, stock, clusterGroups);

    if (existingStock.length > 0) {
      updates.push({
        id: existingStock[0].id,
        primaryStock: stockItem.stock,
        hybridStock: clusterStock,
      });
    } else {
      creations.push({
        variantTitle: item.title,
        variantId: item.id,
        primaryStock: stockItem.stock,
        productImage: item.product.images.edges.length ? item.product.images.edges[0].node.source : "",
        productTitle: item.product ? item.product.title : "",
        productId: item.product ? item.product.id : "",
        outletId: stockItem.outletId,
        sku: item.sku,
        hybridStock: clusterStock,
      });
    }
    await saveUpdatesAndCreations(api, logger, updates, creations);
  }
}

/**
 * Fetches existing stock records for a given SKU and outlet ID.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with the local ERP system.
 * @param {string} outletId - The ID of the outlet.
 * @param {string} sku - The SKU of the product variant.
 * @returns {Promise<Object>} A promise that resolves with the existing stock data.
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
 * Calculates the total stock available across a cluster for a given SKU.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with the local ERP system.
 * @param {string} outletId - The ID of the outlet.
 * @param {Object} stock - The stock data for the product variant.
 * @param {Object} clusterGroups - The cluster groups data.
 * @returns {Promise<number>} A promise that resolves with the calculated cluster stock.
 */
async function getClusterStock(api, outletId, stock, clusterGroups) {
  const findCluster = await api.khagatiStores.findMany({
    select: { storeCluster: true },
    filter: {
      erpStoreId: { equals: String(outletId) },
      status: { equals: "active" }
    },
  });

  let clusterStock = 0;
  if (findCluster.length > 0) {
    const findGroup = clusterGroups[findCluster[0].storeCluster];
    if (findGroup.length > 0) {
      findGroup.forEach(({ erpStoreId }) => {
        const clusterStockItem = stock.find(si => si.outletId == erpStoreId);
        clusterStock += clusterStockItem?.stock || 0;
      });
    }
  }

  return clusterStock;
}

/**
 * Saves the updates and new inventory records to the local ERP system.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with the local ERP system.
 * @param {Object} logger - Logger object to log information and errors.
 * @param {Array} updates - The array of updates to be made.
 * @param {Array} creations - The array of new records to be created.
 * @returns {Promise<void>} A promise that resolves when the updates and creations are saved.
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
 * Action options configuration.
 * 
 * @type {ActionOptions} 
 */
export const options = {
  timeoutMS: 900000, // 15 minutes timeout
  transactional: false
};