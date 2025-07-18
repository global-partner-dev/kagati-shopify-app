import { applyParams, save, ActionOptions, UpdateShopifyCartActionContext } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

/**
 * @param { UpdateShopifyCartActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  logger.info({parms: params}, "PA----------------------------------------->")
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { UpdateShopifyCartActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = { actionType: "update" };
