import { deleteRecord, ActionOptions, DeleteKhagatiShopifyProductInfoActionContext } from "gadget-server";

/**
 * @param { DeleteKhagatiShopifyProductInfoActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await preventCrossShopDataAccess(params, record);
  await deleteRecord(record);
};

/**
 * @param { DeleteKhagatiShopifyProductInfoActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here

  logger.info(params, "params in onSuccess khagatiShopifyProductInfo");
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
