import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiOrderInfo" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "M7R946C8RZxf",
  fields: {
    comments: { type: "json", storageKey: "0Q11a9Bxv-m_" },
    deliveryPaymentType: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["cod", "paid", "pending"],
      storageKey: "-mmGE0GLAmXW",
    },
    emailNotification: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["sent", "notSent", "resent"],
      storageKey: "1s0PuRkAzynq",
    },
    erpOrderPush: {
      type: "boolean",
      default: false,
      storageKey: "iDqXS01fK91G",
    },
    orderId: { type: "number", storageKey: "W1LoPEyeA1gO" },
    orderReferenceId: { type: "string", storageKey: "fvH0NaC9NH5e" },
    orderTags: { type: "json", storageKey: "kmIn3uRdfAm3" },
    shippingMethod: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["storePickup", "delivery"],
      storageKey: "AoMbYuPED8Ew",
    },
    shippingMethodInfo: { type: "json", storageKey: "ivqYqdWD28E4" },
    smsNotification: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["sent", "notSent", "resent"],
      storageKey: "upK5i59kmJ11",
    },
    splitOrderIds: { type: "json", storageKey: "VBDsS_cmyK74" },
    splitStatus: { type: "boolean", storageKey: "_z2ZoqBAhyj9" },
    whatsAppNotification: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["sent", "notSent", "resent"],
      storageKey: "BAcYprPX1oxT",
    },
  },
};
