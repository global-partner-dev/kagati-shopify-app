import { applyParams, save, ActionOptions } from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  logger.info({params: params}, "---------->>>>>params-pass-date")
  // applyParams(params, record);
  // await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};
export const params = {
  email: {
    type: "string"
  },
  password: {
    type: "string"
  }
}

