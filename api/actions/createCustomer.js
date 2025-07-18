import { CreateCustomerGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the customer creation in Shopify.
 * 
 * @param {CreateCustomerGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as scope, logger, params, and connections.
 * @returns {Promise<void>} A promise that resolves when the customer creation process is completed.
 */
export async function run({ scope, logger, params, connections }) {
  try {
    // Log the parameters received for customer creation
    logger.info(JSON.parse(params.requestData), "Create customer params");

    // Establish a connection to the current Shopify store
    const shopify = connections.shopify.current;

    // Create the customer in Shopify using the provided request data
    const responseCustomerData = await shopify.customer.create(JSON.parse(params.requestData));

    // Log the response from Shopify
    logger.info({ responseCustomerData }, "Created new customer in Shopify");

    // Store the result in the scope for further use
    scope.result = responseCustomerData;
  } catch (error) {
    // Log any errors that occur during the customer creation process
    logger.error({ error }, "Error creating customer in Shopify");

    // Throw an error to indicate the failure of the customer creation process
    throw new Error(`Failed to create customer: ${error.message}`);
  }
}

/**
 * Parameters for the Shopify customer creation action.
 * 
 * @type {Object}
 * @property {string} requestData - The JSON string containing the customer data to be created in Shopify.
 */
export const params = {
  requestData: {
    type: "string"
  },
};