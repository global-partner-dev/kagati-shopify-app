import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyFulfillmentEvent" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-FulfillmentEvent",
  fields: {},
  shopify: {
    fields: [
      "address1",
      "city",
      "country",
      "estimatedDeliveryAt",
      "fulfillment",
      "happenedAt",
      "latitude",
      "longitude",
      "message",
      "order",
      "province",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "status",
      "zipCode",
    ],
  },
};
