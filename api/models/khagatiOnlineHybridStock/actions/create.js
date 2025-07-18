import { applyParams, save, ActionOptions, CreateKhagatiOnlineHybridStockActionContext } from "gadget-server";




/**
 * @param { CreateKhagatiOnlineHybridStockActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
}

/**
 * @param { CreateKhagatiOnlineHybridStockActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  
// Extract variantId and stock from params or record
const variantId = params.variantId || record.variantId;
const stock = params.khagatiOnlineHybridStock.primaryStock || record.primaryStock;

const shopifyProductVariant = await api.shopifyProductVariant.findMany({
  select: {
    id: true,
    inventoryItem: {
      id: true
    }
  },
  filter: {
    id: { equals: variantId }
  }
});

 if (!shopifyProductVariant.length) {
    logger.info(`No Shopify product variant found for variant ID: ${variantId}`);
    return;
  }
  logger.info(`Shopify product variant data: ${JSON.stringify(shopifyProductVariant)}`);

  if (!shopifyProductVariant[0].inventoryItem.length) {
    logger.info(`No inventory item found for variant ID: ${variantId}`);
    return;
  }

const shopifyInventoryItemId = shopifyProductVariant[0].inventoryItem.id;

// Fetch locationId using variantId (assuming inventoryItemId is same as variantId here)
const locationId = await getLocationId(api, variantId, logger);

if (!locationId) {
  logger.warn(`No location ID found for variant ID: ${variantId}`);
  return;
}

// Prepare inventory data for the update
const responseUpdate = await api.singleShopifyVariantUpdate({
  inventoryItemId: shopifyInventoryItemId,
  quantity: stock,                    
  locationId: locationId  })
}


const getLocationId = async (api, inventoryItemId, logger) => {
logger.info(`Fetching location ID for inventoryItemId: ${inventoryItemId}`);

try {
  const locationData = await api.shopifyLocation.findMany({
    select: {
      id: true
    }
  });

  logger.info(`Fetched location data: ${JSON.stringify(locationData)}`);
  return locationData.length ? locationData[0].id : null;
} catch (error) {
  logger.error("Error fetching location ID: " + error.message);
  return null;
}
};




  

  


/** @type { ActionOptions } */
export const options = {
  actionType: "create"
};
