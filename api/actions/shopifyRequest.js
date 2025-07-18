import { ActionOptions } from "gadget-server";

/**
 * Makes a Shopify request using the provided GraphQL query and variables.
 * Expects:
 *   params.query: string (GraphQL query)
 *   params.variables: object (GraphQL variables)
 */
export async function run({ params, logger, connections }) {
  // Destructure the incoming parameters
  const { query, variables } = params;
  const requestBody = JSON.parse(variables)
  if (!query) {
    logger.error("No query provided to shopifyRequestAction");
    return {
      error: "No query provided"
    };
  }

  // Set the current Shopify shop (adjust the shop ID as needed for your environment)
  await connections.shopify.setCurrentShop("59823030316");
  const shopify = connections.shopify.current;

  // Call the helper function
  try {
    const response = await shopify.graphql(query, requestBody);
    // logger.info({ response: response }, "Shopify request successful");
    return response;
  } catch (error) {
    logger.error(`Error making Shopify request: ${error.message}`);
    // Return the error so the caller can handle it
    return {
      error: error.message
    };
  }
}
export const params = {
  query : {
    type: "string"
  },
  variables: {
    type: "string"
  }
}
export const options = {
  actionType: "custom",
  triggers: {
    api: true, // so this can be called from an API request
  },
};