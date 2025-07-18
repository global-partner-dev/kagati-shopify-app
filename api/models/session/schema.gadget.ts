import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "session" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "ol6Cw5Qfko0C",
  fields: {
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "KsbjKhEX_QSC",
    },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "WyalgJwqXF4U",
    },
  },
  shopify: { fields: ["shop", "shopifySID"] },
};
