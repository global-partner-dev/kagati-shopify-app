import { applyParams, save, ActionOptions, CreateKhagatiShopifyProductInfoActionContext } from "gadget-server";

/**
 * @param { CreateKhagatiShopifyProductInfoActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateKhagatiShopifyProductInfoActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  const estimate = params.khagatiShopifyProductInfo.estimateDelivery || "111";
  const pid = params.khagatiShopifyProductInfo.productId

  logger.info(estimate);
  logger.info(pid)

  // await api.EstimateDelivery({
  //   estimateDelivery:estimate,
  //   productId:pid
  // });
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create"
};
