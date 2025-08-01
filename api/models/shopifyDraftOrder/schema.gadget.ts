import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyDraftOrder" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-DraftOrder",
  fields: {},
  shopify: {
    fields: [
      "acceptAutomaticDiscounts",
      "allowDiscountCodesInCheckout",
      "appliedDiscount",
      "billingAddress",
      "billingAddressMatchesShippingAddress",
      "completedAt",
      "currency",
      "customer",
      "defaultCursor",
      "discountCodes",
      "email",
      "hasTimelineComment",
      "invoiceEmailTemplateSubject",
      "invoiceSentAt",
      "invoiceUrl",
      "legacyResourceId",
      "lineItems",
      "lineItemsSubtotalPrice",
      "marketName",
      "marketRegionCountryCode",
      "name",
      "note",
      "noteAttributes",
      "order",
      "paymentTerms",
      "phone",
      "platformDiscounts",
      "poNumber",
      "presentmentCurrencyCode",
      "ready",
      "reserveInventoryUntil",
      "shippingAddress",
      "shippingLine",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "status",
      "subtotalPrice",
      "subtotalPriceSet",
      "tags",
      "taxExempt",
      "taxExemptions",
      "taxLines",
      "taxesIncluded",
      "totalDiscountsSet",
      "totalLineItemsPriceSet",
      "totalPrice",
      "totalPriceSet",
      "totalQuantityOfLineItems",
      "totalShippingPriceSet",
      "totalTax",
      "totalTaxSet",
      "totalWeight",
      "transformerFingerprint",
      "visibleToCustomer",
      "warnings",
    ],
  },
};
