import { applyParams, preventCrossShopDataAccess, save, ActionOptions, CreateShopifyFulfillmentServiceActionContext } from "gadget-server";

/**
 * @param { CreateShopifyFulfillmentServiceActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { CreateShopifyFulfillmentServiceActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};
