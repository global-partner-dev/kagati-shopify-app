import { deleteRecord, ActionOptions, DeleteKaghatiDeliveryProfilesActionContext } from "gadget-server";

/**
 * @param { DeleteKaghatiDeliveryProfilesActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteKaghatiDeliveryProfilesActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
