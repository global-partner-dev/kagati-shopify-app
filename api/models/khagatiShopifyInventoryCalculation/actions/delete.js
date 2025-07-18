import { deleteRecord, ActionOptions, DeleteKhagatiShopifyInventoryCalculationActionContext } from "gadget-server";

/**
 * @param { DeleteKhagatiShopifyInventoryCalculationActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteKhagatiShopifyInventoryCalculationActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
