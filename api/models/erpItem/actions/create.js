import { applyParams, save, ActionOptions, CreateErpItemActionContext } from "gadget-server";

/**
 * @param { CreateErpItemActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateErpItemActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
  
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create"
};
