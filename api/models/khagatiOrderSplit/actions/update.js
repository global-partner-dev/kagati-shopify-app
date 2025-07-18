import { applyParams, save, ActionOptions, UpdateKhagatiOrderSplitActionContext } from "gadget-server";

/**
 * @param { UpdateKhagatiOrderSplitActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { UpdateKhagatiOrderSplitActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};
