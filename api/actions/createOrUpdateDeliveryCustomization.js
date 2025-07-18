import { ActionOptions, SettingsCreateOrUpdateDeliveryCustomizationGlobalActionContext } from "gadget-server";

export const params = {
  id: {
    type: "string",
    required: false,
  },
  functionId: {
    type: "string",
    required: true,
  },
  pincode: {
    type: "string",
    required: true,
  },
  deliveryType: {
    type: "string",
    required: true,
  },
};

/**
 * Main function to create or update a delivery customization in Shopify.
 * 
 * @param {SettingsCreateOrUpdateDeliveryCustomizationGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as api, logger, params, and connections.
 * @returns {Promise<Object>} A promise that resolves with the result of the operation, including any user errors.
 */
export async function run(context) {
  const { api, logger, params, connections } = context;
  const { id, functionId, pincode, deliveryType } = params;

  try {
    // Authenticate and get the Shopify connection for the specific shop
    const shopify = await connections.shopify.current; // Replace with your actual Shop ID

    // Prepare the input for the delivery customization
    const deliveryCustomizationInput = {
      functionId,
      title: `Delivery option for ${pincode}`,
      enabled: true,
      metafields: [
        {
          namespace: "customNamespace",
          key: "delivery-options",
          type: "json",
          value: JSON.stringify({ pincode, deliveryType }),
        },
      ],
    };

    let mutation;
    let variables;

    if (id !== "new") {
      // Mutation to update an existing delivery customization
      mutation = `
        mutation updateDeliveryCustomization($id: ID!, $input: DeliveryCustomizationInput!) {
          deliveryCustomizationUpdate(id: $id, deliveryCustomization: $input) {
            deliveryCustomization {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      variables = { id: `gid://shopify/DeliveryCustomization/${id}`, input: deliveryCustomizationInput };
    } else {
      // Mutation to create a new delivery customization
      mutation = `
        mutation deliveryCustomizationCreate($deliveryCustomization: DeliveryCustomizationInput!) {
          deliveryCustomizationCreate(deliveryCustomization: $deliveryCustomization) {
            deliveryCustomization {
              id
              title
              enabled
              metafields {
                namespace
                key
                value
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      variables = { deliveryCustomization: deliveryCustomizationInput };
    }

    // Execute the GraphQL mutation
    const response = await shopify.graphql(mutation, variables);
    const responseData = await response.json();

    // Handle potential GraphQL errors
    if (responseData.errors) {
      logger.error("GraphQL error", responseData.errors);
      return { userErrors: responseData.errors };
    }

    // Handle user errors in the response
    const userErrors = responseData.data.deliveryCustomizationUpdate?.userErrors || responseData.data.deliveryCustomizationCreate?.userErrors;

    if (userErrors && userErrors.length > 0) {
      logger.error("User errors", userErrors);
      return { userErrors };
    }

    logger.info("Delivery customization created/updated successfully");
    return { success: true };

  } catch (error) {
    // Log any errors that occur during the process
    logger.error("Error creating/updating delivery customization", {
      message: error.message,
      stack: error.stack,
      context: error.context || {},
    });
    return { userErrors: [{ message: "An unexpected error occurred" }] };
  }
}

/**
 * Action options configuration.
 * 
 * @type {ActionOptions} 
 */
export const options = {};