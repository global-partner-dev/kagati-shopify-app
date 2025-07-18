import { CheckPeriodicErpItemGlobalActionContext } from "gadget-server";
import { subHours } from "date-fns";

/**
 * Main function to execute the periodic ERP item check process.
 * 
 * @param {CheckPeriodicErpItemGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the ERP item check process is completed.
 */
export async function run({ params, logger, api, connections }) {
  const now = new Date();
  const oneHourAgo = subHours(now, 1);
  const formattedTimestamp = formatDateToCustomString(oneHourAgo);

  try {
    // Fetch all Shopify Product Variants using the provided getProductVariants method
    const shopifyProductVariants = await getProductVariants(api, logger);

    logger.info(`Fetched ${shopifyProductVariants.length} Shopify Product Variants`);

    // Initialize a counter for total ERP items retrieved
    let totalErpItemsCount = 0;

    // Loop through each Shopify Product Variant
    for (const variant of shopifyProductVariants) {
      // Ensure SKU and outletId exist before searching
      if (!variant.sku || !variant.outletId) {
        logger.warn(`Missing SKU or outletId for variant: ${JSON.stringify(variant)}`);
        continue;
      }

      // Search for corresponding ERP items with the formatted itemTimeStamp filter
      const recentErpItems = await api.erpItem.findMany({
        select: {
          id: true,
          mrp: true,
          stock: true,
          itemTimeStamp: true,
        },
        filter: {
          outletId: { equals: Number(variant.outletId) },
          itemId: { equals: Number(variant.sku) },
          itemTimeStamp: {
            greaterThanOrEqual: formattedTimestamp,
          },
        },
      });

      // Count the number of ERP items retrieved for this variant
      const erpItemsCount = recentErpItems.length;
      totalErpItemsCount += erpItemsCount;

      logger.info(`Found ${erpItemsCount} ERP Items for Variant SKU ${variant.sku}`);
    }

    logger.info(`Total ERP Items found across all variants: ${totalErpItemsCount}`);
  } catch (error) {
    logger.error("Error processing Shopify Product Variants and ERP items: " + error.message);
  }
}

/**
 * Formats a Date object to a custom string format (YYYYMMDDHHmmss).
 * 
 * @param {Date} date - The date to be formatted.
 * @returns {string} The formatted date string.
 */
function formatDateToCustomString(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Fetches all Shopify Product Variants from the API.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with external services.
 * @param {Object} logger - Logger object to log information and errors.
 * @returns {Promise<Array|Object>} A promise that resolves with the fetched product variants or an error message.
 */
const getProductVariants = async (api, logger) => {
  logger.info("Fetching all product variants");

  const allRecords = [];

  try {
    let records = await api.shopifyProductVariant.findMany({
      first: 250,
      select: {
        id: true,
        title: true,
        sku: true,
        inventoryItemId: true,
        outletId: true,
        product: {
          id: true,
          title: true,
          images: {
            edges: {
              node: {
                source: true,
                alt: true,
              },
            },
          },
        },
      },
    });

    logger.info(`Initial fetch of product variants: ${JSON.stringify(records)}`);
    allRecords.push(...records);

    while (records.hasNextPage) {
      logger.info("Fetching next page of product variants");
      records = await records.nextPage();
      logger.info(`Fetched next page of product variants: ${JSON.stringify(records)}`);
      allRecords.push(...records);
    }

    logger.info(`All product variants fetched: ${JSON.stringify(allRecords)}`);
    return allRecords;
  } catch (error) {
    logger.error("Error fetching product variants: " + error.message);
    return { error: error.message };
  }
};