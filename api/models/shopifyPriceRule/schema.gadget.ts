import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyPriceRule" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-PriceRule",
  fields: {},
  shopify: {
    fields: [
      "allocationLimit",
      "allocationMethod",
      "customerSegmentPrerequisiteIds",
      "customerSelection",
      "discountCodes",
      "endsAt",
      "entitledCollectionIds",
      "entitledCountryIds",
      "entitledProductIds",
      "entitledVariantIds",
      "oncePerCustomer",
      "prerequisiteCollectionIds",
      "prerequisiteCustomerIds",
      "prerequisiteProductIds",
      "prerequisiteQuantityRange",
      "prerequisiteShippingPriceRange",
      "prerequisiteSubtotalRange",
      "prerequisiteToEntitlementPurchase",
      "prerequisiteToEntitlementQuantityRatio",
      "prerequisiteVariants",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "startsAt",
      "targetSelection",
      "targetType",
      "title",
      "usageLimit",
      "value",
      "valueType",
    ],
  },
};
