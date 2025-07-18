import { applyParams, save, ActionOptions, TrackKhagatiThreePLShippingOrderActionContext,preventCrossShopDataAccess } from "gadget-server";

/**
 * @param { TrackKhagatiThreePLShippingOrderActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  try{

applyParams(params, record);
    await preventCrossShopDataAccess(params,record)
    const porterApiURL = process.env.Porter_Api_URL
    const porterApiKey = process.env.Porter_Api_key
    const porterOrderTrackURL = `${porterApiURL}v1.1/orders/${params.id}`;
    logger.info(params);


const response = await fetch(porterOrderTrackURL,{
      method:"POST",
      headers: {
            'x-api-key': porterApiKey,
            'Content-Type': 'application/json'
        }
    })
    

  }catch(error){
    logger.error(`error:${error.message}`)
  }
};

/**
 * @param { TrackKhagatiThreePLShippingOrderActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update"
};
