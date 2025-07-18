import { applyParams, preventCrossShopDataAccess, save, ActionOptions, UpdateShopifyProductVariantActionContext } from "gadget-server";

/**
 * @param { UpdateShopifyProductVariantActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { UpdateShopifyProductVariantActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
  // await api.enqueue(api.shopifyProductVariant.forward, 
  //   {id: record.id}
  // );
  const khagatiShopifyProductVariantInfo = await api.khagatiShopifyProductVariantInfo.findFirst({
    select: {
      id: true,
    },
    filter: {
      productVariantId: { equals: record.id },
    }
  });

  const product = await api.shopifyProduct.findOne(record.productId, {
    select: { title: true }
  });
  const updateParams = {
    stock: record.inventoryQuantity,
    price: Number(record.price),
    itemId: record.sku,
    productTitle: product.title,
    productVariantId: record.id,
    inventoryItemId: record.inventoryItemId,
    outletId: record.outletId,
    productId: record.productId,
    shopifyCreatedAt: record.shopifyCreatedAt,
    shopifyUpdatedAt: record.shopifyUpdatedAt,
    shop: record.shopId,
  };
  // Enqueue the update action
  await api.enqueue(api.khagatiShopifyProductVariantInfo.update, {
    id: khagatiShopifyProductVariantInfo.id,
    stock: record.inventoryQuantity,
    price: Number(record.price),
    itemId: record.sku,
    productTitle: product.title,
    productVariantId: record.id,
    inventoryItemId: record.inventoryItemId,
    outletId: record.outletId,
    productId: record.productId,
    shopifyCreatedAt: record.shopifyCreatedAt,
    shopifyUpdatedAt: record.shopifyUpdatedAt,
    shop: record.shopId,
  });
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};