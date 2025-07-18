import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";

import prisma from "./db.server";
console.log("here is shopify server file.....")
const shopify = shopifyApp({
  apiKey: "7fe7717b599914d6875bd71241b1c700",
  apiSecretKey: "ab40290a403d0f141fd1b74f1aef236e",
  apiVersion: "2024-10",
  scopes: [
    "read_customer_events",
    "read_locations",
    "read_price_rules",
    "read_product_listings",
    "write_content",
    "write_customers",
    "write_delivery_customizations",
    "write_discounts",
    "write_files",
    "write_fulfillments",
    "write_inventory",
    "write_merchant_managed_fulfillment_orders",
    "write_metaobject_definitions",
    "write_metaobjects",
    "write_orders",
    "write_draft_orders",
    "write_pixels",
    "write_products",
    "write_publications",
    "write_purchase_options",
    "write_reports",
    "write_returns",
    "write_script_tags",
    "write_shipping",
    "write_themes",
    "write_assigned_fulfillment_orders",
    "write_third_party_fulfillment_orders"
  ],
  appUrl: "https://kaghati-shopify-v4--development.gadget.app",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  customShopDomains: ["asv-gadget.myshopify.com"],
});

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
