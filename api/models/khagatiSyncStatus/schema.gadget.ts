import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiSyncStatus" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "I3dNjKFzhJpZ",
  fields: {
    isSyncing: { type: "boolean", storageKey: "U02zecx2bXZz" },
    lastSyncCompletedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "PXkcc6j2bjD8",
    },
    lastSyncStartedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "M85NtarXDxm1",
    },
    overallStatus: { type: "string", storageKey: "3qzbMc6exwrr" },
    syncTypes: { type: "json", storageKey: "tMi7ev4G4zps" },
    userDismissedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "05WFS2FIt2f5",
    },
  },
};
