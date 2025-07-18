import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiOrderSplit" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DM9pVOqMyDTx",
  fields: {
    cancellation: { type: "json", storageKey: "BvVOqCED-2h5" },
    cancelledAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "vbUGteQGDYph",
    },
    closedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "F3kk-AzKO4fW",
    },
    erpOrderPush: {
      type: "boolean",
      default: false,
      storageKey: "dVEnE4nFbi2w",
    },
    erpPreviousStoreId: {
      type: "string",
      storageKey: "73oqfM-h0PnZ",
    },
    erpStoreId: { type: "string", storageKey: "gvX4fbhUjYAb" },
    fulfillments: { type: "string", storageKey: "_8cDlfJY2wu8" },
    lineItems: { type: "json", storageKey: "6_xaf2GNOBbq" },
    onHoldComment: {
      type: "string",
      default: "",
      storageKey: "pKlEHtbe9XtC",
    },
    onHoldStatus: { type: "string", storageKey: "0nKK_BbXXu3K" },
    orderNumber: { type: "number", storageKey: "715XnKyBQ2XL" },
    orderReferenceId: { type: "string", storageKey: "9Gft2JuwYiUq" },
    orderStatus: { type: "string", storageKey: "qVxXfTOBFkT8" },
    processedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "rrggXZcVSLmY",
    },
    reAssignStatus: {
      type: "boolean",
      default: false,
      storageKey: "M4qH3QiDmjOb",
    },
    riderContact: { type: "string", storageKey: "8bpL0p54kCoo" },
    riderName: { type: "string", storageKey: "RXryRUwgxRx_" },
    shop: { type: "string", storageKey: "Aknh_D3ZlQ7j" },
    splitId: { type: "string", storageKey: "N0bSSAfDsbK4" },
    storeCode: { type: "string", storageKey: "QVqIRE-tKDnW" },
    storeName: { type: "string", storageKey: "5xoaddIQcrax" },
    timeStamp: { type: "json", storageKey: "fZSj5zde127n" },
    tplMessage: {
      type: "json",
      default: { status: "", msg: "" },
      storageKey: "8dwxqgUfDBQS",
    },
    tplPayoutPrice: { type: "number", storageKey: "3s269lqUEznC" },
    tplPayoutTax: { type: "number", storageKey: "4p6biH5sz4KD" },
    tplPayoutTotal: { type: "number", storageKey: "KzB7QT_vckjr" },
    tplStatus: { type: "boolean", storageKey: "ipM_Asoy3Kz_" },
    tplStatusCode: { type: "string", storageKey: "kg6cqSpEqQsW" },
    tplTaskId: { type: "string", storageKey: "qiqWSmE5rkba" },
  },
};
