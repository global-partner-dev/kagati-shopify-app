import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "orderLogs" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "VFIe78TH1X2v",
  fields: {
    content: { type: "json", storageKey: "hxxlbLszANqU" },
    notification: { type: "string", storageKey: "NtNP4pf3EOUa" },
    notificationStatus: {
      type: "boolean",
      storageKey: "0XXIpcnl8YDE",
    },
    orderId: { type: "string", storageKey: "N7cy3i8nGjFe" },
    orderSplitId: { type: "string", storageKey: "MpedBCr9rezI" },
    referenceId: { type: "string", storageKey: "UnpzCIGU-lPC" },
    source: { type: "string", storageKey: "-gl6Qe2bD0Uu" },
    userId: { type: "string", storageKey: "kELKjTOmt7zS" },
  },
};
