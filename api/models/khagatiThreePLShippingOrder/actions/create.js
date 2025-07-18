import { applyParams, save, ActionOptions, CreateKhagatiThreePLShippingOrderActionContext,preventCrossShopDataAccess } from "gadget-server";

/**
 * @param { CreateKhagatiThreePLShippingOrderActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  try{
    applyParams(params, record);
    
  }catch(error){
    logger.error(error.message);
  }
};

/**
 * @param { CreateKhagatiThreePLShippingOrderActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
// export const params = {
//   requestId: { type: "string", optional: true },
//   deliveryInstructions: { type: "object", optional: true },
//   pickupDetails: { type: "object", optional: true },
//   dropDetails: { type: "object", optional: true },
//   additionalComments: { type: "string", optional: true },
//   // Additional fields
//   address: { type: "string", optional: true },
//   createdAt: { type: "string", optional: true },
//   inventoryManagementVarient: { type: "string", optional: true },
//   name: { type: "string", optional: true },
//   service: { type: "string", optional: true },
//   shipmentStatus: { type: "string", optional: true },
//   shippingCompany: { type: "string", optional: true },
//   status: { type: "string", optional: true },
//   trackingNumbers: { type: "array", optional: true },
//   trackingUrls: { type: "array", optional: true },
//   updatedAt: { type: "string", optional: true }
// };
export const options = {
  actionType: "create"
};
