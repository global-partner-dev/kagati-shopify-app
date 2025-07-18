import { deleteRecord, ActionOptions, DeleteItemsByOutletIdActionContext } from "gadget-server";

/**
 * @param { DeleteItemsByOutletIdActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteItemsByOutletIdActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
