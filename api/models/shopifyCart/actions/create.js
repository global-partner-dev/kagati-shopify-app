import { applyParams, save, ActionOptions, CreateShopifyCartActionContext } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

/**
 * @param { CreateShopifyCartActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);

  logger.info({PPPAAA: params}, "PPPAAA-----------------")
  logger.info({RRRRCCC: record}, "RRRRCCC----------------------")
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { CreateShopifyCartActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = { actionType: "create" };
