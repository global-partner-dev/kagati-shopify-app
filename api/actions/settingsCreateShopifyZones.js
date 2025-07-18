import { ActionOptions, SettingsCreateShopifyZonesGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify delivery zones creation action.
 * 
 * This function connects to a Shopify shop using the provided shop ID, then creates new delivery zones within a specified location group in a delivery profile.
 * The function constructs and sends a GraphQL mutation to Shopify to create the zones. The result of the mutation, including any user errors, is returned.
 * 
 * @async
 * @function run
 * @param {SettingsCreateShopifyZonesGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action, including shop ID, delivery profile ID, location group ID, and the zones to create.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<object>} A promise that resolves to the response from the Shopify GraphQL API, including any user errors.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  // Retrieve the Shopify connection for the specific shop
  const shopify = await connections.shopify.forShopId(params.shopId);

  const deliveryProfileId = params.deliveryProfileId;
  const locationGroupId = params.locationGroupId;

  const zonesToCreate = params.zonesToCreate;

  // GraphQL mutation to add new delivery zones in Shopify
  const response = await shopify.graphql(`
    mutation AddZones($id: ID!, $locationGroupId: ID!, $zonesToCreate: [DeliveryLocationGroupZoneInput!]!) {
      deliveryProfileUpdate(
        id: $id,
        profile: {
          locationGroupsToUpdate: [
            {
              id: $locationGroupId
              zonesToCreate: $zonesToCreate
            }
          ]
        }
      ) {
        profile {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    id: deliveryProfileId,
    locationGroupId: locationGroupId,
    zonesToCreate: zonesToCreate
  });

  return response;
};

/**
 * Parameters required for creating Shopify delivery zones.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} shopId - The ID of the Shopify shop for which the delivery zones are being created.
 * @property {string} deliveryProfileId - The ID of the delivery profile where the new zones will be created.
 * @property {string} locationGroupId - The ID of the location group within the delivery profile where the zones will be added.
 * @property {Array} zonesToCreate - The list of zones to create within the location group.
 */
export const options = {};