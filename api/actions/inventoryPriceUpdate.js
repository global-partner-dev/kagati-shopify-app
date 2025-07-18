import { InventoryPriceUpdateGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the inventory price update.
 * 
 * @param {InventoryPriceUpdateGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<Array>} A promise that resolves with the list of product variants retrieved from Shopify.
 */
export async function run({ params, logger, api, connections }) {
  // Retrieve all product variants from Shopify
  const productsVariants = await getProductVariants(api);

  // Iterate over each product variant to find corresponding MRP and stock details in the ERP system
  for (const record of productsVariants) {
    const findMrpStock = await api.erpItem.findMany({
      select: {
        id: true,
        mrp: true,
        stock: true,
      },
      filter: {
        outletId: { equals: record.storeCode },
        itemId: { equals: record.sku },
      },
    });

    // Log the found MRP and stock details if they exist
    if (findMrpStock.length) {
      logger.info(findMrpStock);
    }
  }

  // Return the list of product variants for potential further use
  return productsVariants;
};

/**
 * Retrieves all product variants from the Shopify store.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with external services.
 * @returns {Promise<Array>} A promise that resolves with a list of product variants.
 */
const getProductVariants = async (api) => {
  const allRecords = [];
  
  try {
    // Fetch the first page of product variants from Shopify
    let records = await api.shopifyProductVariant.findMany({
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

    // Accumulate all fetched records
    allRecords.push(...records);

    // Continue fetching pages until no more records are available
    while (records.hasNextPage) {
      records = await records.nextPage();
      allRecords.push(...records);
    }

    // Return all accumulated product variant records
    return allRecords;
  } catch (error) {
    // Log and return the error message in case of a failure
    logger.error("Error: " + error.message);
    return { error: error.message };
  }
};