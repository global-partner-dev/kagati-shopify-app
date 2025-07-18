import { preventCrossShopDataAccess, deleteRecord, ActionOptions, DeleteShopifyProductVariantActionContext } from "gadget-server";

/**
 * @param { DeleteShopifyProductVariantActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await preventCrossShopDataAccess(params, record);
  await deleteRecord(record);
};

/**
 * @param { DeleteShopifyProductVariantActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
  try{
    const khagatiShopifyProductVariantInfoId = await api.khagatiShopifyProductVariantInfo.findMany({
      select: {
        id: true,
      },
      filter: {
        productVariantId: { equals: record.id },
      }
    })
    logger.info({khagatiShopifyProductVariantInfoId: khagatiShopifyProductVariantInfoId[0].id}, "update khagatiShopifyProductVariantInfoId------->>")
    const id = khagatiShopifyProductVariantInfoId[0].id
    logger.info({record: record}, "record in shopifyProductVariant model")
    const response = await api.khagatiShopifyProductVariantInfo.delete(id)
  }catch(error){
    return error
  }
  logger.info({status: true}, " delete successs") 
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
  triggers: { api: true },
};
