import { ProductVariantPriceUpdateFileFinalFullGlobalActionContext } from "gadget-server";
import { subMinutes } from "date-fns";

// Function to format date to YYYYMMDDHHmmss string
const formatDateToCustomString = (date) =>  {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Function to handle Shopify GraphQL requests with error handling
const shopifyRequest = async (shopify, query, variables, logger) => {
  try {
    const response = await shopify.graphql(query, variables);
    return response;
  } catch (error) {
    logger.error(`Sync full Error making Shopify request: ${error.message}`);
    throw error;
  }
};
/**
 * Performs a bulk MRP update in Shopify using the provided variant data.
 * 
 * @async
 * @function performBulkMrpUpdate
 * @param {object} shopify - The Shopify connection object.
 * @param {string} productId - The ID of the product whose variants are being updated.
 * @param {Array} variantsData - The variant data to be updated in Shopify.
 * @param {object} logger - A logger object for recording informational and error messages during execution.
 * 
 * @returns {Promise<void>} A promise that resolves when the update operation is complete.
 * 
 * @throws {Error} If an error occurs during the bulk update, it is logged and handled within the function.
 */
const performBulkMrpUpdate = async (shopify, variantsData, logger) => {
  logger.info(`Sync full Performing bulk MRP update for all product IDs`);

  // Group variants by productId
  const groupedVariants = new Map();

  variantsData.forEach(variant => {
    const { productId } = variant;
    if (!groupedVariants.has(productId)) {
      groupedVariants.set(productId, []);
    }
    groupedVariants.get(productId).push(variant);
  });

  // Iterate over each group and perform the bulk update
  for (const [productId, variants] of groupedVariants.entries()) {
    // logger.info(`Preparing bulk MRP update for product ID: ${productId}`);

    const mutation = `#graphql
      mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          product {
            id
          }
          productVariants {
            id
            metafields(first: 15) {
              edges {
                node {
                  namespace
                  key
                  value
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      productId: `gid://shopify/Product/${productId}`,
      variants: variants.map(variant => ({
        id: `gid://shopify/ProductVariant/${variant.id}`,
        compareAtPrice: `${variant.price}`, // Ensure price is a string
      })),
    };

    try {
      const response = await shopifyRequest(shopify, mutation, variables, logger);
      logger.info(`Sync full Bulk update response for product ID ${productId}: ${JSON.stringify(response)}`);
    } catch (error) {
      logger.error(`Sync full Error performing bulk update for product ID ${productId}: ${error.message}`);
    }
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
        inventoryItemId: true,
        productVariantId: true,
        productId: true
      },
      filter: {
        isNewProduct : {equals: true},
        shop : {equals: shopId}
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
    // Create initial sync status
    syncStatus = await api.khagatiSyncStatus.create({
      isSyncing: true,
      lastSyncStartedAt: new Date(),
      syncTypes: {
        priceSync: { status: "running" },
        inventorySync: { status: "pending" }
      },
      overallStatus: "running"
    });

    await connections.shopify.setCurrentShop("59823030316");
    const shopify = connections.shopify.current;
    const shopId = connections.shopify.currentShop.id

    // Price sync
    const productsVariants = await getProductVariants(api, logger, shopId);
    let allPagesProcessedSuccessfully = true;
    let invalidRecordsCount = 0;
    let totalErpRecordsCount = 0;
    const variantsData = [];

    for (const record of productsVariants) {
      if (!record.outletId || !record.itemId) {
        logger.warn(`Invalid outletId or sku for record: ${JSON.stringify(record)}`);
        invalidRecordsCount++;
        continue;
      }
      // const formattedTimestamp = formatDateToCustomString(record.shopifyCreatedAt);
      const findMrpStock = await api.erpItem.findMany({
        select: {
          id: true,
          mrp: true,
          stock: true,
        },
        filter: {
          outletId: { equals: Number(record.outletId) },
          itemId: { equals: Number(record.itemId) }
        },
      });
      
      // logger.info(`Fetched MRP and stock data: ${JSON.stringify(findMrpStock)}`);
      // totalErpRecordsCount += findMrpStock.length;
      // logger.info(`Total ERP records found so far: ${totalErpRecordsCount}`);

      if (findMrpStock.length) {
        variantsData.push({
          id: record.productVariantId,
          price: findMrpStock[0].mrp,
          productId: record.productId
        });
        if (variantsData.length === 50) {
          // logger.info("over 50 limit variantData length------>>>")
          try {
            await performBulkMrpUpdate(shopify, variantsData, logger);
            variantsData.length = 0; // Clear the array
          } catch (error) {
            allPagesProcessedSuccessfully = false;
            logger.error(`Sync full An error occurred in productVariantPriceUpdate Full sync ${error}`);
          }
        }
      }
    }

    // Perform bulk MRP update for remaining records if any
    try {
      if (variantsData.length > 0) {
        await performBulkMrpUpdate(shopify, variantsData, logger);
      }
    } catch (error) {
      allPagesProcessedSuccessfully = false;
      logger.error(`Sync full An error occurred in productVariantPriceUpdate Full sync ${error}`);
    }
    
    // logger.info(`Number of records with invalid outletId or sku: ${invalidRecordsCount}`);

    // Update status after price sync

    // Start inventory sync immediately
    try {
      const inventoryResult = await api.productVariantUpdateFileFinalFull;
      await api.khagatiSyncStatus.update(syncStatus.id, {
        syncTypes: {
          priceSync: {
            status: "completed",
            completedAt: new Date()
          },
          inventorySync: {
            status: "running"
          }
        }
      });
      logger.info("inventoryResult", inventoryResult);
      if (inventoryResult?.result) {
        await api.khagatiSyncStatus.update(syncStatus.id, {
          syncTypes: {
            inventorySync: {
              status: "completed",
              completedAt: new Date()
            }
          },
          overallStatus: "completed",
          lastSyncCompletedAt: new Date(),
          isSyncing: false
        });
        // Inventory sync successful - status will be updated by the inventory action
        return { result: true };
      } else {
        throw new Error("Inventory sync failed");
      }
    } catch (error) {
      logger.error("Error during inventory sync:", error);
      await api.khagatiSyncStatus.update(syncStatus.id, {
        isSyncing: false,
        syncTypes: {
          priceSync: { status: "failed" },
          inventorySync: { 
            status: "failed",
            completedAt: new Date()
          }
        },
        overallStatus: "failed",
        lastSyncCompletedAt: new Date()
      });
      throw error;
    }

  } catch (error) {
    if (syncStatus) {
      await api.khagatiSyncStatus.update(syncStatus.id, {
        isSyncing: false,
        syncTypes: {
          priceSync: {
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




