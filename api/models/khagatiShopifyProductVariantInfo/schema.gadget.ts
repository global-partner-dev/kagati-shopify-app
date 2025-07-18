import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiShopifyProductVariantInfo" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "xwdxmjpkbNnP",
  fields: {
    inventoryItemId: { type: "string", storageKey: "JoSh-KN2BBUb" },
    isNewProduct: {
      type: "boolean",
      default: true,
      storageKey: "_7hJdbiSzmiU",
    },
    itemId: { type: "string", storageKey: "uEkl1UavPnA5" },
    outletId: { type: "number", storageKey: "epoBIK3l4-tT" },
    price: { type: "number", storageKey: "2h22_1rtYI7S" },
    productId: { type: "string", storageKey: "OWSmb3wINNRs" },
    productTitle: { type: "string", storageKey: "N6kyA3ucpD3E" },
    productVariantId: { type: "string", storageKey: "wR5YS7P4oK04" },
    shop: { type: "string", storageKey: "U7Yb5TDBA2su" },
    shopifyCreatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "nhw4Y2aWx8Bf",
    },
    shopifyUpdatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "a08iCBuV9Ty_",
    },
    stock: { type: "number", storageKey: "9RYDEnBe0T2m" },
  },
};
