import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiNotificationTemplate" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "HlIHiMTuGvHY",
  fields: {
    data: { type: "richText", storageKey: "LbDydvefYcWD" },
    name: { type: "string", storageKey: "a3fr3toFRzra" },
    shop: { type: "string", storageKey: "h8d-6jOT5YC5" },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["active", "draft", "archieved"],
      storageKey: "g0PUfoZzonWw",
    },
    type: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["sms", "email", "whatsapp", "other"],
      storageKey: "e8QsjhUa9QZU",
    },
  },
};
