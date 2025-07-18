import { ActionOptions, SettingsDeleteShopifyZonesGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify delivery zones deletion action.
 * 
 * This function connects to a Shopify shop using the provided shop ID, then deletes specific delivery zones from a specified delivery profile.
 * The function constructs and sends a GraphQL mutation to Shopify to delete the zones. The result of the mutation, including any user errors, is returned.
 * 
 * @async
 * @function run
 * @param {SettingsDeleteShopifyZonesGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action, including shop ID, delivery profile ID, and the zones to delete.
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
  const zonesToDelete = params.zonesToDelete;

  // GraphQL mutation to delete delivery zones in Shopify
  const response = await shopify.graphql(`
    mutation DeleteZones($id: ID!, $zonesToDelete: [ID!]!) {
      deliveryProfileUpdate(
        id: $id,
        profile: {
           zonesToDelete: $zonesToDelete
        }
      ) {
        userErrors {
          field
          message
        }
      }
    }
  `, {
    id: deliveryProfileId,
    zonesToDelete: zonesToDelete
  });

  return response;
};

/**
 * Parameters required for deleting Shopify delivery zones.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} shopId - The ID of the Shopify shop for which the delivery zones are being deleted.
 * @property {string} deliveryProfileId - The ID of the delivery profile from which the zones are being deleted.
 * @property {Array} zonesToDelete - The list of zone IDs to delete from the delivery profile.
 */
export const options = {};