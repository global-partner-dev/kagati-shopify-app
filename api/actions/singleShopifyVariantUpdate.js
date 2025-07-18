import { SingleShopifyVariantUpdateGlobalActionContext } from "gadget-server";

/**
 * @param { SingleShopifyVariantUpdateGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  // Establish the current Shopify connection
  await connections.shopify.setCurrentShop("59823030316");
  const shopify = connections.shopify.current;

  // Use parameters for inventory update
  const inventoryItemId = params.inventoryItemId; // The ID of the inventory item to update
  const locationId = params.locationId; // The ID of the location where inventory is updated
  const quantity = params.quantity; // The quantity to set for the inventory item

  // Log the base URL and the access token for verification
  logger.info(`Shopify Base URL: ${shopify.baseUrl.hostname}`);
  logger.info(`Shopify Access Token: ${shopify.baseHeaders["X-Shopify-Access-Token"]}`);
  logger.info(`Shopify API Version: ${shopify.options.apiVersion}`);

  // Perform the Shopify REST API request to update inventory using fetch
  const success = await updateSingleInventoryRecordREST(shopify, inventoryItemId, locationId, quantity, logger);

  if (success) {
    logger.info(`Successfully updated inventory for item ${inventoryItemId} at location ${locationId} with quantity ${quantity}.`);
  } else {
    logger.error(`Failed to update inventory for item ${inventoryItemId} at location ${locationId}.`);
  }
};

/**
 * Function to perform Shopify REST API call for a single on-hand quantity update using fetch
 * 
 * @param {object} shopify - The Shopify connection object.
 * @param {string} inventoryItemId - The ID of the inventory item to update.
 * @param {string} locationId - The ID of the location where inventory is updated.
 * @param {number} quantity - The quantity to set for the inventory item.
 * @param {object} logger - Logger object to record logs.
 * 
 * @returns {Promise<boolean>} - True if the record was updated successfully, otherwise false.
 */
const updateSingleInventoryRecordREST = async (shopify, inventoryItemId, locationId, quantity, logger) => {
  try {
    // Construct the URL dynamically using the baseUrl and apiVersion
    const url = `https://${shopify.baseUrl.hostname}/admin/api/${shopify.options.apiVersion}/inventory_levels/set.json`;

    // Log the full URL to ensure it is correct
    logger.info(`Full URL for inventory update: ${url}`);

    // Headers required for the request
    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": shopify.baseHeaders["X-Shopify-Access-Token"], // Access token from the base headers
    };

    // Log the headers to ensure they are correctly set
    logger.info(`Request Headers: ${JSON.stringify(headers)}`);

    // Request body with the inventory details
    const body = JSON.stringify({
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available: quantity,
    });

    // Make the request using fetch
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    // Parse the response JSON
    const data = await response.json();

    logger.info(`Inventory update response: ${JSON.stringify(data)}`);

    // Check if the response indicates a successful update
    return response.ok;
  } catch (error) {
    logger.error("Error performing inventory update via REST API: " + error.message);
    return false;
  }
};

export const params = {
  inventoryItemId: {
    type: "string",
    description: "The ID of the inventory item to update.",
  },
  locationId: {
    type: "string",
    description: "The ID of the location where inventory is updated.",
  },
  quantity: {
    type: "number",
    description: "The quantity to set for the inventory item.",
  },
};
