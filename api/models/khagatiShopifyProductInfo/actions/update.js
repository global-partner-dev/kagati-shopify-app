import { applyParams, save, ActionOptions, UpdateKhagatiShopifyProductInfoActionContext } from "gadget-server";

/**
 * @param { UpdateKhagatiShopifyProductInfoActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { UpdateKhagatiShopifyProductInfoActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here

  const estimate = params.khagatiShopifyProductInfo.estimateDelivery || "111";
  const pid = params.khagatiShopifyProductInfo.productId

  logger.info(estimate);
  logger.info(pid)

  // await api.shopifyEstimateDelivery({
  //   estimateDelivery:estimate,
  //   productId:pid
  // });
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update"
};
