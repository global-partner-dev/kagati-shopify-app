import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiSetting" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "JJLWEZKTNAyy",
  fields: {
    GID: { type: "number", storageKey: "H41wTuULZtvP" },
    description: { type: "richText", storageKey: "CpUCB2IBfkYP" },
    options: { type: "json", storageKey: "RclQ4ji6e0xU" },
    title: { type: "string", storageKey: "DZFVIZmNR7Ui" },
    type: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["text", "select"],
      storageKey: "7Q7ygWZORfBl",
    },
    value: { type: "string", storageKey: "3uWj60VONvf3" },
  },
};
