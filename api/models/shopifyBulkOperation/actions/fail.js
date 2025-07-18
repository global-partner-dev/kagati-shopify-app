import { applyParams, preventCrossShopDataAccess, finishBulkOperation, save, ActionOptions, FailShopifyBulkOperationActionContext } from "gadget-server";

/**
 * @param { FailShopifyBulkOperationActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await finishBulkOperation(record);
  await save(record);
};

/**
 * @param { FailShopifyBulkOperationActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};
