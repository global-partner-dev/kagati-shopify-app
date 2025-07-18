import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "OAHC89lXQ-GV",
  fields: {
    email: {
      type: "email",
      validations: { required: true },
      storageKey: "5tpVfjbcuvqR",
    },
    firstName: { type: "string", storageKey: "SupwuhSwomvF" },
    googleImageUrl: { type: "url", storageKey: "fnU_Us2TJCqf" },
    googleProfileId: { type: "string", storageKey: "qB3gDLNWQGE8" },
    lastName: { type: "string", storageKey: "CncR9-i_1_rE" },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "68RQrR3x5aYb",
    },
    password: { type: "encryptedString", storageKey: "u5OYG2m_U0b-" },
    roleName: { type: "string", storageKey: "8B3Ct2oTxSZQ" },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "E7_Q66Xs08oA",
    },
    status: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["Active", "Inactive"],
      storageKey: "wDErY4rYZyZw",
    },
    storeAccess: { type: "json", storageKey: "UuWbpwjNTBUD" },
    storeModuleAccess: { type: "json", storageKey: "0dLFuhXBGbEJ" },
  },
};
