import { deleteRecord, ActionOptions, DeleteKhagatiProductAddAttributesActionContext } from "gadget-server";

/**
 * @param { DeleteKhagatiProductAddAttributesActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteKhagatiProductAddAttributesActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
