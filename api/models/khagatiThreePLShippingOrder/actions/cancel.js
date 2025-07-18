import { applyParams, save, ActionOptions, CancelKhagatiThreePLShippingOrderActionContext,preventCrossShopDataAccess } from "gadget-server";

/**
 * @param { CancelKhagatiThreePLShippingOrderActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  

  try{
applyParams(params, record);
    await preventCrossShopDataAccess(params,record)
    const porterApiURL = process.env.Porter_Api_URL
    const porterApiKey = process.env.Porter_Api_key
    const porterOrderCancelURL = `${porterApiURL}v1/orders/${params.id}/cancel`;
    logger.info(params);
    


    const response = await fetch(porterOrderCancelURL,{
      method:"POST",
      headers: {
            'x-api-key': porterApiKey,
            'Content-Type': 'application/json'
        }
    })

  }catch(error){
    logger.error(`error:${error}`)
  }
};

/**
 * @param { CancelKhagatiThreePLShippingOrderActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update"
};
