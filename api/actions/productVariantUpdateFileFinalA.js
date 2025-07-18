import { ProductVariantPriceUpdateFileFinalGlobalActionContext } from "gadget-server";
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

export async function run({ params, logger, api, connections }) {
  const now = new Date();
  const oneHourAgo = subMinutes(now, 20);
  const formattedTimestamp = formatDateToCustomString(oneHourAgo);
  logger.info(formattedTimestamp, "Formatted Timestamp");

  // const erpExistingItems = await api.erpItem.findMany({
  //   sort: { itemTimeStamp: "Ascending" },
  //   limit: 1
  // });
  // return erpExistingItems[0].itemTimeStamp;
  // const latestTimestamp = erpExistingItems[0].itemTimeStamp;
  await connections.shopify.setCurrentShop("59823030316");
  const shopify = connections.shopify.current;
  const shopId = connections.shopify.currentShop.id;

  const productsVariants = await getProductVariants(api, logger, shopId);
  const batchSize = 50; // Define batch size
  let invalidRecordsCount = 0;
  
  for (let i = 0; i < productsVariants.length; i += batchSize) {
    const batch = productsVariants.slice(i, i + batchSize);
    const variantsData = [];

    for (const record of batch) {
      if (!record.outletId || !record.sku) {
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
          outletId: { equals: Number(record.outletId) },
          itemId: { equals: Number(record.sku) },
          // itemTimeStamp: {
          //   greaterThanOrEqual: formattedTimestamp,
          // },
        },
      });
      
      // const findMrpStock = await api.erpItem.findMany({
      //   select: {
      //     id: true,
      //     mrp: true,
      //     stock: true,
      //   },
      //   filter: {
          // outletId: { equals: Number(record.outletId) },
          // itemId: { equals: Number(record.itemId) },
      //     itemTimeStamp: {
      //       greaterThanOrEqual: formattedTimestamp,
      //     },
      //   },
      // });

      if (findMrpStock.length) {
        variantsData.push({
          id: record.id,
          price: findMrpStock[0].mrp,
          productId: record.productId,
        });
      }
    }
    // Perform bulk MRP update for the current batch
    if (variantsData.length > 0) {
      await performBulkMrpUpdate(api, shopify, variantsData, logger);
    }
  }
  logger.info(`Number of records with invalid outletId or sku: ${invalidRecordsCount}`);
}

const performBulkMrpUpdate = async (api, shopify, variantsData, logger) => {
  logger.info(`Performing bulk MRP update for all product IDs`);
  const groupedVariants = new Map();

  variantsData.forEach(variant => {
    const { productId } = variant;
    if (!groupedVariants.has(productId)) {
      groupedVariants.set(productId, []);
    }
    groupedVariants.get(productId).push(variant);
  });

  for (const [productId, variants] of groupedVariants.entries()) {
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
        compareAtPrice: `${variant.price}`,
      })),
    };

    try {
      const job = await api.enqueue(api.shopifyRequest, {
        query: mutation,
        variables: JSON.stringify(variables),
      });
      const response = await job.result();
      logger.info({ response: JSON.stringify(response) }, `Bulk update response for product ID ${productId}:`);
    } catch (error) {
      logger.error(`Error performing bulk update for product ID ${productId}: ${error.message}`);
    }
  }
};

const getProductVariants = async (api, logger, shopId) => {
  const allRecords = [];

  try {
    // let records = await api.erpItem.findMany({
    //   select: {
    //     id: true,
    //     mrp: true,
    //     stock: true,
    //     outletId: true,
    //     itemId: true
    //   },
    //   filter: {
    //     itemTimeStamp: {
    //       greaterThanOrEqual: formattedTimestamp,
    //     },
    //   },
    // });
    let records = await api.shopifyProductVariant.findMany({
      first: 250,
      select: {
        id: true,
        compareAtPrice: true,
        outletId: true,
        sku: true,
        inventoryItemId: true,
        productId: true
      },
      filter: {
        shop: { equals: shopId }
      }
    });

    // Filter records where compareAtPrice is null
    const recordsA = records.filter(record => record.compareAtPrice === null);

    allRecords.push(...recordsA);

    while (records.hasNextPage) {
      records = await records.nextPage();
      // Filter null compareAtPrice from next page records too
      const nextPageRecordsA = records.filter(record => record.compareAtPrice === null);
      allRecords.push(...nextPageRecordsA);
    }

    return allRecords;
  } catch (error) {
    logger.error("Error fetching product variants: " + error.message);
    return { error: error.message };
  }
};

export const options = {
  // triggers: {
  //   scheduler: [{ cron: "*/3 * * * *" }], // Trigger the function every 15 minutes
  // },
  timeoutMS: 900000 // 15 minutes for long actions
};