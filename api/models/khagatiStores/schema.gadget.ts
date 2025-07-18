import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiStores" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "N1kUZ6ECoXyo",
  fields: {
    address: { type: "string", storageKey: "9XH5xneiRVUL" },
    city: { type: "string", storageKey: "rxwC2pVTT-9b" },
    email: { type: "email", storageKey: "jZrngktiSn6l" },
    erpStoreId: { type: "string", storageKey: "SF9HTRKukAJ9" },
    googleMap: { type: "url", storageKey: "aQgEo_n5U_pR" },
    isBackupWarehouse: {
      type: "boolean",
      storageKey: "j6OvhnqJEBSw",
    },
    lat: { type: "number", storageKey: "X0D77oCT9Cg4" },
    lng: { type: "number", storageKey: "UkjpxuEC6S9f" },
    localDelivery: { type: "json", storageKey: "dghYZ9tlGOTP" },
    mobNumber: { type: "string", storageKey: "lezmceWRZ3Re" },
    pinCode: { type: "string", storageKey: "vR9sJLXTf01t" },
    radius: {
      type: "json",
      default: { R1: 3, R2: 5, R3: 7, R4: 10, R5: 15 },
      storageKey: "sCqOCSpx5lAg",
    },
    selectBackupWarehouse: {
      type: "string",
      storageKey: "nC3Ji-JoxLsY",
    },
    state: { type: "string", storageKey: "kwbzforvQCWF" },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["Active", "Inactive"],
      storageKey: "Yfm_mvOS-FZr",
    },
    storeCluster: { type: "string", storageKey: "MdOMMP6ZxyPd" },
    storeCode: { type: "string", storageKey: "mZBLcQ7izs03" },
    storeName: { type: "string", storageKey: "8n1OhYg0N4LM" },
    storeTier: { type: "string", storageKey: "rcily9SrNT6R" },
  },
};
