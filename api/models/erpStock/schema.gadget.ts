import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "erpStock" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "tRTt5A2fQIKM",
  fields: {
    appliesOnline: { type: "number", storageKey: "RUwsRO_F02Q7" },
    bufferStock: { type: "number", storageKey: "vDIqYhio44IW" },
    costPriceWithoutTax: {
      type: "number",
      storageKey: "UHDX2rtkEc6q",
    },
    discount: { type: "number", storageKey: "1kAFLdsXcK8e" },
    freeQty: { type: "string", storageKey: "ePZGH90BXwQF" },
    hsnCode: { type: "string", storageKey: "ALWe2Z4bFXjd" },
    itemEANcode: { type: "string", storageKey: "twEub2NcNK08" },
    itemReferenceCode: { type: "string", storageKey: "qLD4iMMkiFoC" },
    itemTimeStamp: { type: "number", storageKey: "Fv88Pe8VuZq9" },
    mrp: { type: "number", storageKey: "NqMBjNIHbMMN" },
    originalPrice: { type: "number", storageKey: "EuLuDcta8GD9" },
    others: { type: "richText", storageKey: "oVLu8YJiovpN" },
    outletId: { type: "number", storageKey: "41LQeX4Vw15N" },
    packing: { type: "string", storageKey: "2X5PNv053PoF" },
    purchasePrice: { type: "number", storageKey: "0wOEt-fxzPAz" },
    recommended: { type: "boolean", storageKey: "wK124RHc5bNN" },
    salePrice: { type: "number", storageKey: "MdUAjthV5cg_" },
    specialPrice: { type: "number", storageKey: "HsiFx7TYDM0o" },
    stock: { type: "number", storageKey: "stDY0IuOjI_E" },
    supplierName: { type: "string", storageKey: "71icCbOsQQyr" },
    taxPercentage: { type: "number", storageKey: "cNcVkZG-nljU" },
    variantName: { type: "string", storageKey: "RwLzxSXX57RV" },
  },
};
