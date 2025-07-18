import { applyParams, save, ActionOptions, UpdateKhagatiNotificationTemplateActionContext } from "gadget-server";

/**
 * @param { UpdateKhagatiNotificationTemplateActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { UpdateKhagatiNotificationTemplateActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update"
};
