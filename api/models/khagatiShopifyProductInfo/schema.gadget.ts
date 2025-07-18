import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiShopifyProductInfo" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "KoCg1l6MIxZp",
  fields: {
    estimateDelivery: { type: "string", storageKey: "W_jM3xwh-6lM" },
    itemId: { type: "string", storageKey: "YEOTQ2kVOof-" },
    newbyStatus: {
      type: "boolean",
      default: true,
      storageKey: "jEJuAgqIm0cZ",
    },
    productId: { type: "string", storageKey: "lrd7CQbodgO2" },
    shop: { type: "string", storageKey: "Dz50ZzmIWoBq" },
    shopifyCreatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "SFbyJb6fF7Xz",
    },
    shopifyUpdatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "mNcucaRH_WyK",
    },
  },
};
