import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "itemsByOutletId" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "pcskf8TgNxvu",
  fields: {
    itemId: { type: "number", storageKey: "TjJL2z1XA4N6" },
    itemName: { type: "string", storageKey: "W9K7VPuwh-mB" },
    mrp: { type: "number", storageKey: "7TgI7CQ2VJF_" },
    outletId: { type: "number", storageKey: "Cvc741oZbK35" },
    stock: { type: "number", storageKey: "70KHh7Jt3aIX" },
  },
};
