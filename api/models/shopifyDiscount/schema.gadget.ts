import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyDiscount" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Discount",
  fields: {
    codeCount: {
      type: "number",
      decimals: 0,
      storageKey:
        "ModelField-DataModel-Shopify-Discount-codeCount::FieldStorageEpoch-DataModel-Shopify-Discount-codeCount-initial",
    },
  },
  shopify: {
    fields: [
      "appDiscountType",
      "appliesOnOneTimePurchase",
      "appliesOnSubscription",
      "appliesOncePerCustomer",
      "asyncUsageCount",
      "codesCount",
      "combinesWith",
      "customerBuys",
      "customerGets",
      "destinationSelection",
      "discountClass",
      "discountId",
      "endsAt",
      "errorHistory",
      "hasTimelineComment",
      "maximumShippingPrice",
      "minimumRequirement",
      "recurringCycleLimit",
      "shareableUrls",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "shortSummary",
      "startsAt",
      "status",
      "summary",
      "title",
      "totalSales",
      "usageLimit",
      "usesPerOrderLimit",
    ],
  },
};
