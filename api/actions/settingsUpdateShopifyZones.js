import { ActionOptions, SettingsUpdateShopifyZonesGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify delivery zones update action.
 * 
 * This function connects to a Shopify shop using the provided shop ID, then updates the delivery zones for a specified delivery profile.
 * The function constructs and sends a GraphQL mutation to Shopify to update the location groups and zones. The result of the mutation, 
 * including any user errors, is returned.
 * 
 * @async
 * @function run
 * @param {SettingsUpdateShopifyZonesGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action, including shop ID, delivery profile ID, location group ID, and zones to update.
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
  const zonesToUpdate = params.zonesToUpdate;

  // GraphQL mutation to update delivery zones in Shopify
  const response = await shopify.graphql(`
    mutation UpdateZones($id: ID!, $locationGroupId: ID!, $zonesToUpdate: [DeliveryLocationGroupZoneInput!]!) {
      deliveryProfileUpdate(
        id: $id,
        profile: {
          locationGroupsToUpdate: [
            {
              id: $locationGroupId
              zonesToUpdate: $zonesToUpdate
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
    zonesToUpdate: zonesToUpdate
  });

  return response;
};

/**
 * Parameters required for updating Shopify delivery zones.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} shopId - The ID of the Shopify shop for which the delivery zones are being updated.
 * @property {string} deliveryProfileId - The ID of the delivery profile to update in Shopify.
 * @property {string} locationGroupId - The ID of the location group within the delivery profile to update.
 * @property {Array} zonesToUpdate - The list of zones to update within the location group.
 */
export const options = {};