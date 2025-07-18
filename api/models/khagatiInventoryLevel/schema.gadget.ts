import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiInventoryLevel" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "M5ZhJvV_CzK5",
  fields: {
    available: { type: "number", storageKey: "r4QpvFmbvKYy" },
    inventoryItem: { type: "string", storageKey: "9c2wF4lJbMLx" },
    location: { type: "string", storageKey: "rgWOzEowP9bn" },
    productId: { type: "string", storageKey: "vuTMZxOUiT4q" },
    shop: { type: "string", storageKey: "BE3cmQelhbyg" },
    shopifyUpdatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "-JFxvF3VDouM",
    },
    sku: { type: "string", storageKey: "lydEBxYr0q_L" },
    storeCode: { type: "string", storageKey: "imspt2o6FVd7" },
    storeInventory: { type: "json", storageKey: "UShfcLEy87jV" },
    variantId: { type: "string", storageKey: "744N7PcJkjBy" },
  },
};
