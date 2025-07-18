import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyPaymentSchedule" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-PaymentSchedule",
  fields: {},
  shopify: {
    fields: [
      "amount",
      "completedAt",
      "currency",
      "dueAt",
      "expectedPaymentMethod",
      "issuedAt",
      "paymentTerms",
      "shop",
    ],
  },
};
