import { deleteRecord, ActionOptions, DeleteKhagatiThreePLShippingOrderActionContext } from "gadget-server";

/**
 * @param { DeleteKhagatiThreePLShippingOrderActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteKhagatiThreePLShippingOrderActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete"
};
