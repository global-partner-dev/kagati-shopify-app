import { ActionOptions } from "gadget-server";
import { subMinutes } from "date-fns";

// Format date to YYYYMMDDHHmmss string
const formatDateToCustomString = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Combined function to sync both price and inventory updates
 */
export async function run({ params, logger, api, connections }) {
  try {
    // Initialize
    const now = new Date();
    const formattedTimestamp = formatDateToCustomString(subMinutes(now, 20));
    await connections.shopify.setCurrentShop("59823030316");
    const shopify = connections.shopify.current;
    const shopId = connections.shopify.currentShop.id;

    // Get latest ERP items
    const erpItems = await getERPItems(api, "20250114124608");
    logger.info(`Found ${erpItems.length} ERP items to process`);

    // Process in batches
    const batchSize = 50;
    let processedCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < erpItems.length; i += batchSize) {
      const batch = erpItems.slice(i, i + batchSize);
      const variantsToUpdate = [];
      const khagatiUpdates = [];

      // Process each item in batch
      for (const erpItem of batch) {
        if (!erpItem.outletId || !erpItem.itemId) {
          invalidCount++;
          continue;
        }

        // Find corresponding Shopify variant
        const variantInfo = await api.khagatiShopifyProductVariantInfo.findMany({
          first: 1,
          select: {
            id: true,
            productVariantId: true,
            productId: true,
            inventoryItemId: true
          },
          filter: {
            outletId: { equals: Number(erpItem.outletId) },
            itemId: { equals: String(erpItem.itemId) },
            shop: { equals: shopId }
          }
        });

        if (variantInfo.length) {
          const variant = variantInfo[0];
          variantsToUpdate.push({
            id: variant.productVariantId,
            price: erpItem.mrp,
            productId: variant.productId,
            inventoryQuantity: erpItem.stock,
            inventoryItemId: `gid://shopify/InventoryItem/${variant.inventoryItemId}`,
            locationId: `gid://shopify/Location/${await getDefaultLocationId(api, variant.inventoryItemId, logger)}`
          });

          khagatiUpdates.push({
            id: variant.id,
            isNewProduct: false
          });
          processedCount++;
        }
      }

      // Perform bulk update
      if (variantsToUpdate.length > 0) {
        const response = await performBulkUpdate(api, shopify, variantsToUpdate, logger);
        return response;
        // Update Khagati records
        const jobs = await api.enqueue(
          api.khagatiShopifyProductVariantInfo.bulkUpdate,
          khagatiUpdates,
          { queue: { name: "variant-sync" } }
        );

        const results = await Promise.all(jobs.map(job => job.result()));
        logger.info({ results }, "Khagati updates completed");
      }
    }

    // Log summary
    logger.info({
      processedCount,
      invalidCount,
      totalERPItems: erpItems.length
    }, "Sync completed");

    return true;

  } catch (error) {
    logger.error("Sync failed:", error);
    throw error;
  }
}

/**
 * Get ERP items that need updating
 */
async function getERPItems(api, timestamp) {
  const items = await api.erpItem.findMany({
    select: {
      id: true,
      mrp: true, 
      stock: true,
      outletId: true,
      itemId: true
    },
    filter: {
      itemTimeStamp: {
        greaterThanOrEqual: timestamp
      }
    }
  });

  return items;
}

/**
 * Get default location ID for inventory
 */
async function getDefaultLocationId(api, inventoryItemId, logger) {
  try {
    const levels = await api.shopifyInventoryLevel.findMany({
      select: { locationId: true },
      filter: {
        inventoryItemId: { equals: inventoryItemId }
      }
    });
    return levels[0]?.locationId;
  } catch (error) {
    logger.error("Error getting location ID:", error);
    return null;
  }
}

/**
 * Perform bulk variant update
 */
async function performBulkUpdate(api, shopify, variantsData, logger) {
  // Group variants by product ID for bulk updates
  logger.info(`Performing bulk MRP update for all product IDs`);
  const groupedVariants = new Map();
  variantsData.forEach(variant => {
    const { productId } = variant;
    if (!groupedVariants.has(productId)) {
      groupedVariants.set(productId, []);
    }
    groupedVariants.get(productId).push(variant);
  });

  const mutation = `#graphql
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        product {
          id
        }
        productVariants {
          id
          compareAtPrice
          inventoryItem {
            id
            inventoryLevels(first: 1) {
              edges {
                node {
                  quantities(names: ["available"]) {
                    name
                    quantity
                  }
                  location {
                    id
                  }
                }
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

  // Process each product's variants
  for (const [productId, variants] of groupedVariants.entries()) {
    try {
      const variables = {
        productId: `gid://shopify/Product/${productId}`,
        variants: variants.map(variant => ({
          id: `gid://shopify/ProductVariant/${variant.id}`,
          compareAtPrice: `${variant.price}`
          // Remove the invalid fields that were causing the error
        }))
      };

      // Create separate inventory adjustment mutation
      for (const variant of variants) {
        // Adjust inventory levels separately using the Admin API
        const response = await shopify.inventoryLevel.set({
          inventory_item_id: variant.inventoryItemId.split('/').pop(),
          location_id: variant.locationId.split('/').pop(),
          available: variant.inventoryQuantity
        });
      }

      const job = await api.enqueue(api.shopifyRequest, {
        query: mutation,
        variables: JSON.stringify(variables)
      });

      const response = await job.result();
      return response;
      logger.info({ productId, response }, "Bulk update completed");

    } catch (error) {
      logger.error({ productId, error }, "Bulk update failed");
    }
  }
}

// export const options = {
//   triggers: {
//     scheduler: [{ cron: "*/15 * * * *" }]
//   },
//   timeoutMS: 900000 // 15 minutes
// };