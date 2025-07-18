import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCustomerAddress" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-CustomerAddress",
  fields: {},
  shopify: {
    fields: [
      "address1",
      "address2",
      "city",
      "company",
      "country",
      "countryCode",
      "countryName",
      "firstName",
      "lastName",
      "name",
      "phone",
      "province",
      "provinceCode",
      "shop",
      "shopifyCustomer",
      "zipCode",
    ],
  },
};
