import { UpdateVariantGlobalActionContext } from "gadget-server";

/**
 * Updates a Shopify variant with new data provided in the request.
 * 
 * This function utilizes the Gadget framework to interact with Shopify's API 
 * and update a specific product variant based on the parameters received. 
 * The variant update is logged for both successful and unsuccessful attempts.
 *
 * @param {UpdateVariantGlobalActionContext} context - The context object provided by Gadget, containing params, logger, api, and connections.
 * @param {object} context.params - The parameters passed to the function.
 * @param {string} context.params.variantId - The ID of the Shopify variant to be updated.
 * @param {string} context.params.requestData - The JSON string containing the update data for the variant.
 * @param {object} context.logger - The logging utility provided by Gadget.
 * @param {object} context.api - The API interface for interacting with the Gadget framework.
 * @param {object} context.connections - The connections object containing external services, including Shopify.
 * 
 * @returns {Promise<void>} - This function does not return a value, but it logs the outcome of the update operation.
 * 
 * @throws {Error} - Throws an error if the variant update fails, including the error message for debugging purposes.
 */
export async function run({ params, logger, api, connections }) {
  try {
    // Log the incoming request data for the variant update
    logger.info(JSON.parse(params.requestData), "Update variant params");

    // Access the current Shopify connection
    const shopify = connections.shopify.current;

    // Perform the variant update using the Shopify API
    const responseVariantData = await shopify.variant.update(params.variantId, JSON.parse(params.requestData));

    // Log the successful update response
    logger.info({ responseVariantData }, "Updated new variant in Shopify");

    // Assign the result to the scope for further use
    scope.result = responseVariantData;
  } catch (error) {
    // Log the error and rethrow it for further handling
    logger.error({ error }, "Error updating variant in Shopify");
    throw new Error(`Failed to update variant: ${error.message}`);
  }
};

/**
 * Parameters required for the run function.
 * 
 * @type {object}
 * @property {string} variantId - The ID of the Shopify variant to be updated.
 * @property {string} requestData - The JSON string containing the update data for the variant.
 */
export const params = {
  variantId: {
    type: "string"
  },
  requestData: {
    type: "string"
  },
};