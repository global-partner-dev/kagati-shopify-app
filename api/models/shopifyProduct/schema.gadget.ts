import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyProduct" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Product",
  fields: {
    estimateDelivery: {
      type: "string",
      shopifyMetafield: {
        privateMetafield: false,
        namespace: "kaghati",
        key: "estimateDelivery",
        metafieldType: "single_line_text_field",
        allowMultipleEntries: false,
      },
      storageKey: "7MTXjQOQEBgz",
    },
    oosPincodes: {
      type: "json",
      shopifyMetafield: {
        privateMetafield: false,
        namespace: "kaghati",
        key: "oosPincodes",
        metafieldType: "single_line_text_field",
        allowMultipleEntries: false,
      },
      storageKey: "ZG8-rLBdax3h",
    },
    publishedScope: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Product-published_scope::FieldStorageEpoch-DataModel-Shopify-Product-published_scope-initial",
    },
    storePrices: {
      type: "json",
      shopifyMetafield: {
        privateMetafield: false,
        namespace: "kaghati",
        key: "storePrices",
        metafieldType: "json",
        allowMultipleEntries: false,
      },
      storageKey: "RpTHYtVHyPMt",
    },
    storeStock: {
      type: "json",
      shopifyMetafield: {
        privateMetafield: false,
        namespace: "kaghati",
        key: "storeStock",
        metafieldType: "single_line_text_field",
        allowMultipleEntries: false,
      },
      storageKey: "cdsF3yOKyEei",
    },
  },
  shopify: {
    fields: [
      "body",
      "category",
      "compareAtPriceRange",
      "customCollections",
      "draftOrderLineItems",
      "featuredMedia",
      "handle",
      "hasVariantsThatRequiresComponents",
      "images",
      "media",
      "options",
      "orderLineItems",
      "productCategory",
      "productType",
      "publishedAt",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "status",
      "tags",
      "templateSuffix",
      "title",
      "variants",
      "vendor",
    ],
  },
};
