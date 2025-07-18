import { CreateProductGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the product creation in Shopify.
 * 
 * @param {CreateProductGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as scope, logger, params, and connections.
 * @returns {Promise<void>} A promise that resolves when the product creation process is completed.
 */
export async function run({ scope, logger, params, connections }) {
  try {
    // Log the parameters received for product creation
    logger.info(params, "Create product params");

    // Establish a connection to the current Shopify store
    const shopify = connections.shopify.current;

    // Create the product in Shopify using the provided request data
    const responseProductData = await shopify.product.create(JSON.parse(params.requestData));

    // Log the response from Shopify
    logger.info({ responseProductData }, "Created new product in Shopify");

    // Store the result in the scope for further use
    scope.result = responseProductData;
  } catch (error) {
    // Log any errors that occur during the product creation process
    logger.error({ error }, "Error creating product in Shopify");

    // Throw an error to indicate the failure of the product creation process
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

/**
 * Parameters for the Shopify product creation action.
 * 
 * @type {Object}
 * @property {string} requestData - The JSON string containing the product data to be created in Shopify.
 */
export const params = {
  requestData: {
    type: "string"
  },
};