import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "erpProductData" model, go to https://kaghati-shopify-v4.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "D4TE_XAgWeaX",
  fields: {
    appliesOnline: { type: "number", storageKey: "vrRRikg8Hq8l" },
    box: { type: "string", storageKey: "uud8OPw43xKk" },
    breadth: { type: "number", storageKey: "ASwZRiUU-8tw" },
    decimalsAllowed: { type: "number", storageKey: "tAzMyeuha2HE" },
    description: { type: "string", storageKey: "6bqova2AbpG9" },
    detailedDescription: {
      type: "richText",
      storageKey: "yvUuTFNwCT7I",
    },
    foodType: { type: "number", storageKey: "2Rtly07sPDq1" },
    fulfilmentMode: { type: "string", storageKey: "5g4sROJVuUdN" },
    height: { type: "number", storageKey: "iDUKyyT0KZAb" },
    iBarU: { type: "number", storageKey: "tFoobWKmF73o" },
    imageUrl: { type: "string", storageKey: "cqAwH4IzGSy0" },
    isCancellable: { type: "string", storageKey: "0qUV_UfG0Nji" },
    isReturnable: { type: "string", storageKey: "wenqszczj_vL" },
    itemId: { type: "number", storageKey: "4s9tO5IOhCyW" },
    itemName: { type: "string", storageKey: "9SlyRrdM_30Q" },
    itemProductTaxType: {
      type: "string",
      storageKey: "t7SNiQT7wOSd",
    },
    itemProductType: { type: "number", storageKey: "3YhLdA6COcxS" },
    itemTaxType: { type: "string", storageKey: "h4vdgVVzrerZ" },
    length: { type: "number", storageKey: "AIbcZ3fk9vMj" },
    manufacturer: { type: "string", storageKey: "TeCzi0tu6zWE" },
    packedConfirmation: {
      type: "string",
      storageKey: "v7qR9engWCWn",
    },
    rack: { type: "string", storageKey: "yBhaq_0lAMgK" },
    returnPeriod: { type: "number", storageKey: "VEATEvP5EAMk" },
    shortName: { type: "string", storageKey: "hU4mBUgwVYeH" },
    status: { type: "string", storageKey: "OOdtlOsqIEhp" },
    stock: { type: "json", storageKey: "DfxHR-6RSE4-" },
    taxId: { type: "number", storageKey: "ZwKscwIwgecX" },
    weight: { type: "number", storageKey: "9J-9O7zb-EDr" },
    weightGrams: { type: "number", storageKey: "26Ipy_NO876w" },
    width: { type: "number", storageKey: "EN1-MKx15azJ" },
  },
};
