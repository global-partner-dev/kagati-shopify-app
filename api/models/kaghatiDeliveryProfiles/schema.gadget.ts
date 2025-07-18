import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "kaghatiDeliveryProfiles" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "yUg07yKzvqec",
  fields: {
    deliveryProfileId: { type: "string", storageKey: "pvKBqDjOYLUF" },
    locationGroups: { type: "json", storageKey: "rGHu3AnNUM2f" },
    locationsWithouRatesCount: {
      type: "number",
      storageKey: "MGeek9lIC48l",
    },
    originLocationCount: {
      type: "number",
      storageKey: "Xpl_k7MARK6Q",
    },
    profileItems: { type: "json", storageKey: "exLkUr9xu12e" },
    profileName: { type: "string", storageKey: "hzqp9U5UGNBo" },
    shopName: { type: "string", storageKey: "IULRiVC9MvR0" },
  },
};
