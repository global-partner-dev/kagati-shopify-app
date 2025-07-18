import { applyParams, preventCrossShopDataAccess, save, ActionOptions, UpdateShopifyProductActionContext } from "gadget-server";

/**
 * @param { UpdateShopifyProductActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { UpdateShopifyProductActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here

// logger.info(record);
  // const khagatiShopifyProductInfoId = await api.khagatiShopifyProductInfo.findMany({
  //   select: {
  //     id: true,
  //   },
  //   filter: {
  //     productId: { equals: record.id },
  //   }
  // })
  // logger.info({khagatiShopifyProductInfoId: khagatiShopifyProductInfoId[0].id}, "khagatiShopifyProductInfoId------->>")
  //  const khagatiProductInfo = api.khagatiShopifyProductInfo.update(khagatiShopifyProductInfoId[0].id, {
  //   productId:record.id,
  //   // oosPincodes:record.oosPincodes,
  //   // estimateDelivery:record.estimateDelivery
  // })
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};
