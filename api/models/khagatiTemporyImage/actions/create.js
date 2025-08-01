import { applyParams, save, ActionOptions, CreateKhagatiTemporyImageActionContext } from "gadget-server";

/**
 * @param { CreateKhagatiTemporyImageActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateKhagatiTemporyImageActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create"
};
