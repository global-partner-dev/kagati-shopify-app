import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyShippingLine" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-ShippingLine",
  fields: {},
  shopify: {
    fields: [
      "carrierIdentifier",
      "code",
      "discountAllocations",
      "discountedPrice",
      "discountedPriceSet",
      "isRemoved",
      "order",
      "phone",
      "price",
      "priceSet",
      "requestedFulfillmentService",
      "shop",
      "source",
      "taxLines",
      "title",
    ],
  },
};
