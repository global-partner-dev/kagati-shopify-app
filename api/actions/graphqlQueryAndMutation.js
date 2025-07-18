import { GraphqlQueryAndMutationGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the Shopify GraphQL query and mutation.
 * 
 * @param {GraphqlQueryAndMutationGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the operation is completed.
 */
export async function run({ params, logger, api, connections }) {
  // Step 1: Setup Shopify Connection
  // Fetch the Shopify shop data and extract the shop ID
  const shopifyShopData = await api.shopifyShop.findMany({});
  const shopifyShopId = shopifyShopData[0].id;
  
  // Log the retrieved Shopify shop ID
  logger.info(shopifyShopId, "shopifyShopId");

  // Establish a connection to Shopify using the shop ID
  const shopify = await connections.shopify.forShopId(`${shopifyShopId}`);

  // Step 2: Fetch Shopify Functions (Commented out as an example)
  /*
  const functionData = await shopify.graphql(`
    query {
      shopifyFunctions(first: 25) {
        nodes {
          app {
            title
          }
          apiType
          title
          id
        }
      }
    }
  `);

  // Log the fetched data
  logger.info(functionData, "Fetched Shopify Functions");
  */

  // Step 3: Use Provided Function ID in a Mutation (Commented out as an example)
  /*
  const functionId = "b004efc4-a3b3-464a-9717-cec3f40b0e5c"; // The functionId provided by you
  const mutationResponse = await shopify.graphql(`
    mutation {
      cartTransformCreate(
        functionId: "${functionId}",
        blockOnFailure: false
      ) {
        cartTransform {
          id
          functionId
        }
        userErrors {
          field
          message
        }
      }
    }
  `);

  // Log the mutation response
  logger.info(mutationResponse, "Mutation Response");
  */
};

/** 
 * Action options configuration.
 * 
 * @type {ActionOptions} 
 */
export const options = {};
