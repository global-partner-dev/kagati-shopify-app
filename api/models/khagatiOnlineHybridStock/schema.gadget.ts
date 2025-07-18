import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiOnlineHybridStock" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "PWAdtsdRfy9r",
  fields: {
    backUpStock: { type: "number", storageKey: "8BW6XVwpSzAp" },
    bufferStock: { type: "number", storageKey: "0ml30_uwBdZk" },
    erpStock: { type: "number", storageKey: "eYzILFhwGJ8W" },
    hybridStock: { type: "number", storageKey: "j4Zw_GjEAGZB" },
    mrp: { type: "string", storageKey: "qr1mlvq5lRRy" },
    onlineStock: { type: "number", storageKey: "E-1jLl7REZZZ" },
    outletId: { type: "number", storageKey: "veyCjOr_-aFG" },
    primaryStock: { type: "number", storageKey: "9qB1-SWtsojc" },
    productId: { type: "string", storageKey: "5GbbM0DWSiSA" },
    productImage: { type: "string", storageKey: "oyDu8e1k5P5_" },
    productTitle: { type: "string", storageKey: "jbLjY5nSQwiZ" },
    sku: { type: "string", storageKey: "stApl1Mf7ti3" },
    thresholdStock: { type: "number", storageKey: "SqigUEFjODwN" },
    variantId: { type: "string", storageKey: "1_0Km20anBC8" },
    variantTitle: { type: "string", storageKey: "xg75q_jzxIpQ" },
  },
};
