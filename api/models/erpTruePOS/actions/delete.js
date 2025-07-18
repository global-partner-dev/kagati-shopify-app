import { deleteRecord, ActionOptions, DeleteErpTruePOSActionContext } from "gadget-server";

/**
 * @param { DeleteErpTruePOSActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteErpTruePOSActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
