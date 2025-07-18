import { deleteRecord, ActionOptions, DeleteErpStockActionContext } from "gadget-server";

/**
 * @param { DeleteErpStockActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteErpStockActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
