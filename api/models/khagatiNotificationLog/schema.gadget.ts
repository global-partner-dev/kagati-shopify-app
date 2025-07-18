import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiNotificationLog" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "MbfK_OCJgfgT",
  fields: {
    logType: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["error", "info", "warn"],
      storageKey: "l7-9L2K0LL5f",
    },
    notificationDetails: {
      type: "richText",
      storageKey: "RT4PRfCBmuYa",
    },
    notificationInfo: { type: "string", storageKey: "gFZQyN28opAl" },
    notificationType: { type: "string", storageKey: "0XbNEO_BBep1" },
    notificationViewStatus: {
      type: "boolean",
      storageKey: "knoXIf0GV7Nx",
    },
    shop: { type: "string", storageKey: "Y4oHq_OOXIGY" },
  },
};
