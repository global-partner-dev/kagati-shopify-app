import { deleteRecord, ActionOptions, DeleteKhagatiSettingActionContext } from "gadget-server";

/**
 * @param { DeleteKhagatiSettingActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteKhagatiSettingActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
