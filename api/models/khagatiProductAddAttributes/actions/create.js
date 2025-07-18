import { applyParams, save, ActionOptions, CreateKhagatiProductAddAttributesActionContext } from "gadget-server";

/**
 * @param { CreateKhagatiProductAddAttributesActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateKhagatiProductAddAttributesActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create"
};
