import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "notificationCenter" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "ylXDBUunqYMe",
  fields: {
    event: { type: "string", storageKey: "4USuzjMqUFEa" },
    isTrigger: { type: "boolean", storageKey: "KDHgXAMgHYhr" },
    orderName: { type: "string", storageKey: "FQsQCZM8sx8z" },
    outletId: { type: "string", storageKey: "Wi7D0DPsdGch" },
    storeCode: { type: "string", storageKey: "LmX_Cy31qoDD" },
    storeName: { type: "string", storageKey: "A1jUCuvLkxcn" },
  },
};
