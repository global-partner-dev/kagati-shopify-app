import { preventCrossShopDataAccess, deleteRecord, ActionOptions, DeleteShopifyProductActionContext } from "gadget-server";

/**
 * @param { DeleteShopifyProductActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await preventCrossShopDataAccess(params, record);
  await deleteRecord(record);
};

/**
 * @param { DeleteShopifyProductActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
  logger.info(record, "record");

  // api.khagatiShopifyProductInfo.delete({
  //   productId: record.id
  // })
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
  triggers: { api: true },
};
