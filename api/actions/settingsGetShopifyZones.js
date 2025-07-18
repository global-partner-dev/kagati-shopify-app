import { ActionOptions, SettingsGetShopifyZonesGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify delivery zones retrieval action.
 * 
 * This function connects to a Shopify shop, retrieves delivery profiles using the Shopify GraphQL API, processes the retrieved data, 
 * and creates corresponding delivery profile records in the Gadget platform. The function logs the retrieved data and the results 
 * of the profile creation attempts, including any errors encountered during the process.
 * 
 * @async
 * @function run
 * @param {SettingsGetShopifyZonesGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves when the action completes.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  // Step 1: Setup Shopify Connection
  const shopifyShopData = await api.shopifyShop.findMany({});
  const shopifyShopId = shopifyShopData[0].id;
  logger.info(shopifyShopId, "shopifyShopId");
  const shopify = await connections.shopify.forShopId(`${shopifyShopId}`);
  logger.info(shopify);

  // Step 2: Fetch Delivery Profiles
  const data = await shopify.graphql(`
    {
      shop {
        name
      }
      deliveryProfiles(first: 10) {
        edges {
          node {
            id
            profileLocationGroups {
              locationGroup {
                id
                locations(first: 50) {
                  edges {
                    node {
                      name
                      address {
                        formatted
                      }
                    }
                  }
                }
              }
              locationGroupZones(first: 50) {
                edges {
                  node {
                    methodDefinitions(first: 10) {
                      edges {
                        node {
                          active
                          description
                          id
                          name
                          rateProvider {
                            ... on DeliveryRateDefinition {
                              id
                              price {
                                amount
                                currencyCode
                              }
                            }
                            ... on DeliveryParticipant {
                              id
                              adaptToNewServicesFlag
                              fixedFee {
                                amount
                                currencyCode
                              }
                              percentageOfRateFee
                            }
                          }
                        }
                      }
                    }
                    zone {
                      id
                      name
                      countries {
                        id
                        name
                        provinces {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
            locationsWithoutRatesCount
            name
            originLocationCount
            profileItems(first: 10) {
              pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
              }
              nodes {
                product {
                  id
                }
              }
            }
          }
        }
      }
    }
  `);

  // Step 3: Log and Process Data
  logger.info(data.deliveryProfiles, "profiles we got");

  // Step 4: Create Delivery Profile Instances
  for (const profileEdge of data.deliveryProfiles.edges) {
    const profile = profileEdge.node;
    const response = await api.kaghatiDeliveryProfiles.create({
      shopName: data.shop.name,
      deliveryProfileId: profile.id,
      profileName: profile.name,
      locationGroups: profile.profileLocationGroups,
      originLocationCount: profile.originLocationCount,
      locationsWithouRatesCount: profile.locationsWithoutRatesCount, // Corrected field name
      profileItems: profile.profileItems.nodes.map(node => node.product.id)
    });

    // Step 5: Log Success or Failure
    if (response.ok) {
      logger.info(`Delivery profile ${profile.id} created successfully`);
    } else {
      logger.error(`Failed to create delivery profile ${profile.id}`);
    }
  }
};

/** @type { ActionOptions } */
export const options = {};