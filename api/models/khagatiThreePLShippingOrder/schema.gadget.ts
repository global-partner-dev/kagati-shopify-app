import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiThreePLShippingOrder" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "488GRM0-AzeD",
  fields: {
    additional_comments: {
      type: "string",
      storageKey: "zfvlubqikLlR",
    },
    address: { type: "json", storageKey: "WzebcShTfKV5" },
    delivery_instructions: {
      type: "json",
      storageKey: "ccAUsOqGciPe",
    },
    drop_details: { type: "json", storageKey: "iz4LLXG26bOh" },
    inventoryManagementVariant: {
      type: "string",
      storageKey: "YkVhe0ubZ-VV",
    },
    location: { type: "string", storageKey: "It_My2pUJgBi" },
    name: { type: "string", storageKey: "sWMCTUQIyTz2" },
    order: { type: "string", storageKey: "RRYuSrPje1lP" },
    orderId: { type: "string", storageKey: "bnZFBnn_T6V8" },
    order_timings: { type: "json", storageKey: "plUy5FYp25Hs" },
    partner_info: {
      type: "json",
      default: {
        name: "",
        vehicle_number: "",
        vehicle_type: "",
        mobile: { country_code: "", mobileNumber: "" },
        location: { log: 0, lat: 0 },
      },
      storageKey: "qGkgkldfs53t",
    },
    pickup_details: { type: "json", storageKey: "QUbBLcEY4JOn" },
    request_id: { type: "string", storageKey: "IAHMYWCY056e" },
    service: { type: "string", storageKey: "iwb1wG5NGo8m" },
    shipmentStatus: { type: "string", storageKey: "0ucEyIsCCLrg" },
    shippingCompany: { type: "string", storageKey: "zrjvovuKBIRU" },
    shop: { type: "string", storageKey: "r5Eo9c9lFgT7" },
    splitId: { type: "string", storageKey: "tBecq6ch_MXK" },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["open", "accepted", "live", "ended", "cancelled"],
      storageKey: "izk1DEEhIeQx",
    },
    trackingNumbers: { type: "json", storageKey: "NpOrBu_sZb6X" },
    trackingUrls: { type: "json", storageKey: "HXAcxDNCkpFQ" },
  },
};
