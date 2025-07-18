import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "khagatiOrderLineItem" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "8i2vqVgusHMR",
  fields: {
    attributedStaffs: { type: "json", storageKey: "zEakUrPEaoWf" },
    discountAllocations: { type: "json", storageKey: "zngxnqUazFvw" },
    duties: { type: "string", storageKey: "lgSisu8VHswu" },
    fulfillmentLineItems: {
      type: "string",
      storageKey: "hCaPFopLFLQR",
    },
    fulfillmentOrderLineItems: {
      type: "string",
      storageKey: "d8mkO6nL9zEy",
    },
    giftCard: { type: "boolean", storageKey: "hrkiS_pna2mo" },
    name: { type: "string", storageKey: "3put93LlknKV" },
    order: { type: "string", storageKey: "aNcYlSJBeCTN" },
    originLocation: { type: "string", storageKey: "t-0mGQT26jwl" },
    price: { type: "string", storageKey: "ZQs3DFgM9NhJ" },
    priceSet: { type: "json", storageKey: "VtDoL8mEeY6w" },
    product: { type: "string", storageKey: "zn4QNL3O0_xa" },
    properties: { type: "json", storageKey: "03s6Fl3SEUIr" },
    quantity: { type: "number", storageKey: "TFiN0Y26WO5m" },
    refunds: { type: "string", storageKey: "jxtR8UXhnLqn" },
    requiresShipping: { type: "string", storageKey: "zHEhg0Hq6r7T" },
    shop: { type: "string", storageKey: "oZWYG-U4JCCB" },
    shopifyCreatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "fqvYy46ZgbvS",
    },
    shopifyUpdatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "bEV3_AgkmhNg",
    },
    sku: { type: "string", storageKey: "K6L7ZZAeNeU7" },
    taxLines: { type: "json", storageKey: "5-35UA6JzO9V" },
    taxable: { type: "boolean", storageKey: "XUbr61mOaJdY" },
    title: { type: "string", storageKey: "OzFD6b2cyHWi" },
    totalDiscount: { type: "string", storageKey: "d5MEm_WY5C-L" },
    totalDiscountSet: { type: "json", storageKey: "jp3k-3u06VOk" },
    variant: { type: "string", storageKey: "Sln2hf0j8mnl" },
    variantTitle: { type: "string", storageKey: "Shs0uz2HMUEC" },
    vendor: { type: "string", storageKey: "JOwk86jcQDxp" },
  },
};
