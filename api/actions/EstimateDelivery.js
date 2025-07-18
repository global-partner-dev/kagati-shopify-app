import { ActionOptions, EstimateDeliveryGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the metafield creation for estimated delivery in Shopify.
 * 
 * @param {EstimateDeliveryGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the metafield creation process is completed.
 */
export async function run({ params, logger, api, connections }) {
  // Establish connection to the current Shopify store
  const shopify = connections.shopify.current;

  if (shopify) {
    logger.info("Connected to Shopify successfully.");
  } else {
    logger.error("Failed to connect to Shopify.");
  }

  // Create a metafield for estimated delivery on a specific product
  const response = await shopify?.metafield.create({
    key: "estimateDelivery",
    namespace: 'kaghati',
    owner_resource: "product",
    owner_id: 7239565934636,  // Replace with actual product ID
    type: "string",
    value: "123",  // Replace with actual estimated delivery value
  });

  // Log the response or any error encountered during metafield creation
  if (response) {
    logger.info(response, "Metafield created successfully!");
  } else {
    logger.error("An error occurred during metafield creation.");
  }
};

/** 
 * Action options configuration.
 * 
 * @type {ActionOptions} 
 */
export const options = {};
