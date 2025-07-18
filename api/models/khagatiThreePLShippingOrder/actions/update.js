import { applyParams, save, ActionOptions, UpdateKhagatiThreePLShippingOrderActionContext } from "gadget-server";

/**
 * @param { UpdateKhagatiThreePLShippingOrderActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { UpdateKhagatiThreePLShippingOrderActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update"
};
