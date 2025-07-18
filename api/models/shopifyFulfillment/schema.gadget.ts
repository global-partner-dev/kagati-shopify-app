import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyFulfillment" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Fulfillment",
  fields: {},
  shopify: {
    fields: [
      "fulfillmentEvents",
      "fulfillmentLineItems",
      "location",
      "name",
      "notifyCustomer",
      "order",
      "originAddress",
      "receipt",
      "service",
      "shipmentStatus",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "status",
      "trackingCompany",
      "trackingNumbers",
      "trackingUrls",
      "variantInventoryManagement",
    ],
  },
};
