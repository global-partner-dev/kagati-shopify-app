import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "erpItem" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "pq_IDFquAWsh",
  fields: {
    appliesOnline: { type: "number", storageKey: "UO88r7Qiyr_q" },
    box: { type: "string", storageKey: "1z6rWEUwe9e2" },
    breadth: { type: "number", storageKey: "tR2T_9sLar23" },
    decimalsAllowed: { type: "number", storageKey: "3UsTS-M18gJ4" },
    description: { type: "string", storageKey: "fhV8KKOmFJvv" },
    detailedDescription: {
      type: "string",
      storageKey: "YPV2FaWoQllJ",
    },
    foodType: { type: "number", storageKey: "O5WZYltng9Mc" },
    fulfilmentMode: { type: "string", storageKey: "55N1NkqQ2Xoe" },
    height: { type: "number", storageKey: "CK226aW2UsGV" },
    iBarU: { type: "number", storageKey: "PIFvhhzbOt28" },
    imageUrl: { type: "string", storageKey: "MOgYW8HHdmtZ" },
    isCancellable: { type: "string", storageKey: "ZbPJb6uwRefl" },
    isReturnable: { type: "string", storageKey: "bDyFM93GmRyH" },
    itemId: { type: "number", storageKey: "-Fx6XHzzrX4V" },
    itemName: { type: "string", storageKey: "JDM_3YqTVxwg" },
    itemProductTaxType: {
      type: "string",
      storageKey: "TFPBydNUL8QN",
    },
    itemProductType: { type: "number", storageKey: "Odc_0gC_1L5q" },
    itemTaxType: { type: "string", storageKey: "0HlD6TGsG-aR" },
    itemTimeStamp: {
      type: "string",
      default: "20240804102601",
      storageKey: "xgeMEUPAPfzz",
    },
    length: { type: "number", storageKey: "EOyQcHFm0hZr" },
    manufacturer: { type: "string", storageKey: "I6aX2I2FzfnM" },
    mrp: { type: "number", storageKey: "ZA4FBQBxfzrM" },
    outletId: { type: "number", storageKey: "NaDXp-VPDlpE" },
    packedConfirmation: {
      type: "string",
      storageKey: "QzbT1bu55eSX",
    },
    rack: { type: "string", storageKey: "Jcvi4fwDnV6k" },
    returnPeriod: { type: "number", storageKey: "7qVryzJ5JDFj" },
    shortName: { type: "string", storageKey: "jRxCSsFSCkio" },
    status: { type: "string", storageKey: "3JZyHUEtENDF" },
    stock: { type: "number", storageKey: "z_zMB2JuIyBx" },
    taxId: { type: "number", storageKey: "-vypBQ9Bo4zg" },
    weight: { type: "number", storageKey: "x6RmdTUc22Wj" },
    weightGrams: { type: "number", storageKey: "G7iopcIZHAvY" },
    width: { type: "number", storageKey: "2NHDL4hTni6c" },
  },
};
