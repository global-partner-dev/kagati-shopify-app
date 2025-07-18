import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyDraftOrderLineItem" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-DraftOrderLineItem",
  fields: {},
  shopify: {
    fields: [
      "appliedDiscount",
      "approximateDiscountedUnitPriceSet",
      "bundleComponents",
      "custom",
      "customAttributes",
      "customAttributesV2",
      "discountedTotalSet",
      "draftOrder",
      "fulfillmentService",
      "fulfillmentServiceHandle",
      "giftCard",
      "name",
      "originalTotalSet",
      "originalUnitPriceSet",
      "originalUnitPriceWithCurrency",
      "price",
      "product",
      "properties",
      "quantity",
      "requiresShipping",
      "shop",
      "sku",
      "taxLines",
      "taxable",
      "title",
      "totalDiscountSet",
      "uuid",
      "variant",
      "variantTitle",
      "vendor",
      "weight",
    ],
  },
};
