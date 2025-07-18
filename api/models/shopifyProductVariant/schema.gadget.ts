import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyProductVariant" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-ProductVariant",
  fields: {
    fulfillmentService: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-ProductVariant-fulfillment_service::FieldStorageEpoch-DataModel-Shopify-ProductVariant-fulfillment_service-initial",
    },
    gqlId: { type: "string", storageKey: "ALNTWxiWnUsM" },
    grams: {
      type: "number",
      storageKey:
        "ModelField-DataModel-Shopify-ProductVariant-grams::FieldStorageEpoch-DataModel-Shopify-ProductVariant-grams-initial",
    },
    inventoryManagement: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-ProductVariant-inventory_management::FieldStorageEpoch-DataModel-Shopify-ProductVariant-inventory_management-initial",
    },
    inventoryQuantityAdjustment: {
      type: "number",
      storageKey:
        "ModelField-DataModel-Shopify-ProductVariant-inventory_quantity_adjustment::FieldStorageEpoch-DataModel-Shopify-ProductVariant-inventory_quantity_adjustment-initial",
    },
    oldInventoryQuantity: {
      type: "number",
      storageKey:
        "ModelField-DataModel-Shopify-ProductVariant-old_inventory_quantity::FieldStorageEpoch-DataModel-Shopify-ProductVariant-old_inventory_quantity-initial",
    },
    outletId: {
      type: "number",
      shopifyMetafield: {
        privateMetafield: false,
        namespace: "kaghati",
        key: "outletid",
        metafieldType: "number_integer",
        allowMultipleEntries: false,
      },
      storageKey: "0zC-l04AYWqC",
    },
    requiresShipping: {
      type: "boolean",
      storageKey:
        "ModelField-DataModel-Shopify-ProductVariant-requires_shipping::FieldStorageEpoch-DataModel-Shopify-ProductVariant-requires_shipping-initial",
    },
    storeCode: {
      type: "json",
      shopifyMetafield: {
        privateMetafield: false,
        namespace: "kaghati",
        key: "storeCode",
        metafieldType: "json",
        allowMultipleEntries: false,
      },
      storageKey: "YLT0byZFwwk_",
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
      storageKey: "q7QmoNZP_Qgy",
    },
    weight: {
      type: "number",
      storageKey:
        "ModelField-DataModel-Shopify-ProductVariant-weight::FieldStorageEpoch-DataModel-Shopify-ProductVariant-weight-initial",
    },
    weightUnit: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-ProductVariant-weight_unit::FieldStorageEpoch-DataModel-Shopify-ProductVariant-weight_unit-initial",
    },
  },
  shopify: {
    fields: [
      "barcode",
      "compareAtPrice",
      "draftOrderLineItems",
      "fulfillmentOrderLineItem",
      "inventoryItem",
      "inventoryPolicy",
      "inventoryQuantity",
      "media",
      "option1",
      "option2",
      "option3",
      "orderLineItems",
      "position",
      "presentmentPrices",
      "price",
      "product",
      "productImage",
      "selectedOptions",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "sku",
      "taxCode",
      "taxable",
      "title",
    ],
  },
};
