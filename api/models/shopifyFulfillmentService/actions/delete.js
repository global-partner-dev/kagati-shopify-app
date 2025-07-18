import { preventCrossShopDataAccess, deleteRecord, ActionOptions, DeleteShopifyFulfillmentServiceActionContext } from "gadget-server";

/**
 * @param { DeleteShopifyFulfillmentServiceActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await preventCrossShopDataAccess(params, record);
  await deleteRecord(record);
};

/**
 * @param { DeleteShopifyFulfillmentServiceActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
  triggers: { api: true },
};
