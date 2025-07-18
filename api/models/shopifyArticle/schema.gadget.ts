import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyArticle" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Article",
  fields: {},
  shopify: {
    fields: [
      "author",
      "blog",
      "body",
      "comments",
      "handle",
      "image",
      "published",
      "publishedAt",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "summary",
      "tags",
      "templateSuffix",
      "title",
    ],
  },
};
