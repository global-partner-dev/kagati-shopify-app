import { applyParams, preventCrossShopDataAccess, save, ActionOptions, UpdateShopifyOrderActionContext } from "gadget-server";

/**
 * @param { UpdateShopifyOrderActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { UpdateShopifyOrderActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  if (!record.id) {
    logger.error("Record does not have an id");
    return;
  }
    
  await api.khagatiOrderUpdate({
    id: record.id                                 
  });
  await api.khagatiOrderSplitUpdate({
    id: record.id
  });

};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};
