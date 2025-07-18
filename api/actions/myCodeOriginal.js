import { ProductVariantUpdateFileFinalGlobalActionContext } from "gadget-server";
import { subHours } from "date-fns";

function getFormattedTimestampInIST(date) {
  const istOffset = 5.5 * 60 * 60 * 1000; 
  const istDate = new Date(date.getTime() + istOffset);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0'); 
  const day = String(istDate.getDate()).padStart(2, '0');
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const seconds = String(istDate.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

const RATE_LIMIT = 100; // 100 points per second
let pointsConsumed = 0;
let lastRequestTime = Date.now();

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const shopifyRequest = async (shopify, query, logger, points = 1) => {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastRequestTime;

  if (elapsedTime < 1000) {
    pointsConsumed += points;
    if (pointsConsumed > RATE_LIMIT) {
      const waitTime = 1000 - elapsedTime; // Time to wait until 1 second has passed
      logger.info(`Rate limit exceeded. Waiting for ${waitTime} ms`);
      await delay(waitTime);
      pointsConsumed = points; // Reset points after waiting
      lastRequestTime = Date.now(); // Reset the timer
    }
  } else {
    // Reset the points and timer if more than 1 second has passed
    pointsConsumed = points;
    lastRequestTime = currentTime;
  }

  try {
    const response = await shopify.graphql(query);
    return response;
  } catch (error) {
    if (error.response && error.response.status === 429) { // Rate limit exceeded
      const retryAfter = parseInt(error.response.headers['retry-after']) || 1000;
      logger.warn(`Rate limit exceeded. Retrying after ${retryAfter} ms`);
      await delay(retryAfter);
      return shopifyRequest(shopify, query, logger, points); // Retry request
    }
    throw error;
  }
};

export async function run({ params, logger, api, connections }) {
  const now = new Date();
  const oneHourAgo = subHours(now, 1);
  const formattedTimestampInIST = getFormattedTimestampInIST(oneHourAgo);
  logger.info(formattedTimestampInIST, "Formatted Timestamp in IST");

  const shopify = connections.shopify.current;
  const shopifyShopId = connections.shopify.currentShopId;

  const productsVariants = await getProductVariants(api, logger);

  let invalidRecordsCount = 0; 
  let totalErpRecordsCount = 0;

  for (const record of productsVariants) {
    const data = await shopifyRequest(shopify, `
      query MyQuery {
        productVariant(id: "gid://shopify/ProductVariant/${record.id}") {
          metafield(key: "outletid", namespace: "kaghati") {
            value
          }
        }
      }
    `, logger, 1);
    logger.info(`Fetched metafield data: ${JSON.stringify(data)}`);

    const storeCode = data?.productVariant?.metafield?.value;

    if (!storeCode || !record.sku) {
      logger.warn(`Invalid storeCode or sku for record: ${JSON.stringify(record)}`);
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
        outletId: { equals: Number(storeCode) },
        itemId: { equals: Number(record.sku) },
      },
    });
    logger.info(`Fetched MRP and stock data: ${JSON.stringify(findMrpStock)}`);

    totalErpRecordsCount += findMrpStock.length;
    logger.info(`Total ERP records found so far: ${totalErpRecordsCount}`);

    if (findMrpStock.length) {
      const mrp = findMrpStock[0].mrp;
      logger.info(`MRP: ${mrp}`);

      if (mrp == null || mrp === '') {
        logger.warn(`MRP is null or blank for record: ${JSON.stringify(record)}`);
        continue;
      }

      await performSinglePriceUpdate(shopify, { variantId: record.id, price: mrp }, logger);

      const locationId = await getLocationId(api, record.inventoryItemId, logger);
      logger.info(`Fetched location ID: ${locationId}`);

      if (locationId) {
        await performSingleInventoryUpdate(shopify, {
          inventoryItemId: record.inventoryItemId,
          locationId: locationId,
          quantity: findMrpStock[0].stock,
        }, logger);
      }
    }
  }

  logger.info(`Number of records with invalid storeCode or sku: ${invalidRecordsCount}`);
  return productsVariants;
}

const performSinglePriceUpdate = async (shopify, { variantId, price }, logger) => {
  logger.info(`Performing single price update for variantId: ${variantId}, price: ${price}`);
  const mutation = `
    mutation {
      productVariantUpdate(input: { id: "gid://shopify/ProductVariant/${variantId}", price: ${price} }) {
        productVariant {
          id
          price
        }
        userErrors {
          message
          field
        }
      }
    }
  `;

  try {
    const response = await shopifyRequest(shopify, mutation, logger, 1);
    logger.info(`Single price update response: ${JSON.stringify(response)}`);
  } catch (error) {
    logger.error("Error performing single price update: " + error.message);
  }
}

const performSingleInventoryUpdate = async (shopify, { inventoryItemId, locationId, quantity }, logger) => {
  logger.info(`Performing single inventory update for inventoryItemId: ${inventoryItemId}, locationId: ${locationId}, quantity: ${quantity}`);
  const mutation = `
    mutation {
      inventorySetOnHandQuantities(input: {
        reason: "correction",
        setQuantities: [
          {
            inventoryItemId: "gid://shopify/InventoryItem/${inventoryItemId}",
            locationId: "gid://shopify/Location/${locationId}",
            quantity: ${quantity}
          }
        ]
      }) {
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

  try {
    const response = await shopifyRequest(shopify, mutation, logger, 1);
    logger.info(`Single inventory update response: ${JSON.stringify(response)}`);
  } catch (error) {
    logger.error("Error performing single inventory update: " + error.message);
  }
}

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
        storeCode: true,
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
}

const getLocationId = async (api, inventoryItemId, logger) => {
  logger.info(`Fetching location ID for inventoryItemId: ${inventoryItemId}`);

  try {
    const locationData = await api.shopifyInventoryLevel.findMany({
      select: {
        locationId: true,
      },
      filter: {
        inventoryItemId: { equals: inventoryItemId },
      },
    });

    logger.info(`Fetched location data: ${JSON.stringify(locationData)}`);
    return locationData.length ? locationData[0].locationId : null;
  } catch (error) {
    logger.error("Error fetching location ID: " + error.message);
    return null;
  }
}
