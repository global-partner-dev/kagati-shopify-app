import { applyParams, preventCrossShopDataAccess, save, ActionOptions, CreateShopifyProductVariantActionContext } from "gadget-server";

/**
 * @param { CreateShopifyProductVariantActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { CreateShopifyProductVariantActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
    const product = await api.shopifyProduct.findOne(record.productId, {
      select: {
        title: true,
      },
    });
  
    await api.internal.khagatiShopifyProductVariantInfo.create({
      stock: record.inventoryQuantity,
      productTitle: product.title,
      productVariantId: record.id,
      inventoryItemId: record.inventoryItemId,
      outletId: record.outletId,
      itemId: record.sku,
      productId: record.productId,
      shopifyCreatedAt: record.shopifyCreatedAt,
      shopifyUpdatedAt: record.shopifyUpdatedAt,
      shop: record.shopId
    })
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};
