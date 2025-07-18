import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyComment" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Comment",
  fields: {},
  shopify: {
    fields: [
      "article",
      "author",
      "blog",
      "body",
      "bodyHtml",
      "email",
      "ip",
      "publishedAt",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "status",
      "userAgent",
    ],
  },
};
