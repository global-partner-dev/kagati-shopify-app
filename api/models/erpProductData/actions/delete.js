import { deleteRecord, ActionOptions, DeleteErpProductDataActionContext } from "gadget-server";

/**
 * @param { DeleteErpProductDataActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteErpProductDataActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
