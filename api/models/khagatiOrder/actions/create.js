import { applyParams, save, ActionOptions, CreateKhagatiOrderActionContext } from "gadget-server";

/**
 * @param { CreateKhagatiOrderActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  logger.info({Paramssss : params}, "1 am here");
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateKhagatiOrderActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
  logger.info({ dataLog: params}, "orders paramas------>",)
  // params.khagatiOrder.customer.firstName
  // params.khagatiOrder.customer.phone
  // params.khagatiOrder.orderNumber
  // const cName = params.khagatiOrder.customer.firstName
  // const phoneNumber = params.khagatiOrder.customer.phone
  // const phoneNumber = "917397398839"
  // const tId = params.khagatiOrder.name
  // const responseKhagatiSMS = await api.khagatiSMS({ cName, phoneNumber, tId });
  // logger.info({responseKhagatiSMS : responseKhagatiSMS}, "------>responseKhagatiSMS");
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create"
};
