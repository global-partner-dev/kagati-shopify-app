/**
 * API Client Configuration
 * 
 * This code initializes and exports an instance of the `Client` class from the `@gadget-client/kaghati-shopify-v4` package. 
 * The client is configured to interact with the Gadget platform for the Kaghati Shopify application. The environment for the client 
 * is dynamically set based on the `environment` value provided in the global `gadgetConfig` object, which is typically configured 
 * during the application's initialization.
 * 
 * @module api
 * @requires @gadget-client/kaghati-shopify-v4
 * 
 * @param {object} gadgetConfig - The global configuration object available on the `window`. It contains settings for the Gadget client, including:
 *   - {string} environment: The environment in which the client should operate (e.g., "production", "development").
 * 
 * @returns {Client} A configured instance of the Gadget client for interacting with the Kaghati Shopify application's backend services.
 */

import { Client } from "@gadget-client/kaghati-shopify-v4";

export const api = new Client({ environment: window.gadgetConfig.environment });