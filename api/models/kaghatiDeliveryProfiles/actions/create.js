import { applyParams, save, ActionOptions, CreateKaghatiDeliveryProfilesActionContext } from "gadget-server";

/**
 * @param { CreateKaghatiDeliveryProfilesActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  // logger.info("params", params);
  // logger.info("record", record);


  
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateKaghatiDeliveryProfilesActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  const { kaghatiDeliveryProfiles } = params;
  logger.info(params, "params in success");
  logger.info(kaghatiDeliveryProfiles);

  if (!kaghatiDeliveryProfiles) {
    logger.error("No delivery profile data found in params");
    throw new Error("No delivery profile data found in params");
  }

 const shopifyShopData = await api.shopifyShop.findMany({});
  const shopifyShopId = shopifyShopData[0].id;
  logger.info(shopifyShopId,"shopifyShopId");
  const shopify = await connections.shopify.forShopId(`${shopifyShopId}`);
  logger.info(shopify,"shopify");

  try {
    const response = await shopify.graphql(`
      mutation createDeliveryProfile($profile: DeliveryProfileInput!) {
        deliveryProfileCreate(profile: $profile) {
          profile {
            id
            name
            profileLocationGroups {
              locationGroup {
                id
                locations(first: 5) {
                  nodes {
                    name
                    address {
                      country
                    }
                  }
                }
              }
              locationGroupZones(first: 1) {
                edges {
                  node {
                    zone {
                      id
                      name
                      countries {
                        code {
                          restOfWorld
                        }
                      }
                    }
                    methodDefinitions(first: 1) {
                      edges {
                        node {
                          id
                          name
                          rateProvider {
                            __typename
                            ... on DeliveryRateDefinition {
                              price {
                                amount
                                currencyCode
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      profile: {
        sellingPlanGroupsToAssociate: ["gid://shopify/SellingPlanGroup/1"],
        name: kaghatiDeliveryProfiles.profileName,
        locationGroupsToCreate: [
          {
            locations: ["gid://shopify/Location/93812556066"], 
            zonesToCreate: [
              {
                name: "All Countries",
                countries: { restOfWorld: true },
                methodDefinitionsToCreate: [
                  {
                    rateDefinition: {
                      price: {
                        amount: 0,
                        currencyCode: "CAD"
                      }
                    },
                    name: "Free Shipping"
                  }
                ]
              }
            ]
          }
        ]
      }
    });

    if (response.deliveryProfileCreate.userErrors.length) {
      logger.error(response.deliveryProfileCreate.userErrors,"Shopify API errors");
      throw new Error("Failed to create delivery profile in Shopify");
    }

    logger.info(response.deliveryProfileCreate.profile.id,"Profile created in Shopify");
    const deliveryProfileId = response.deliveryProfileCreate.profile.id
    record.deliveryProfileId = deliveryProfileId;
await save(record);
    
  } catch (error) {
    logger.error(error,"Error creating profile in Shopify");
    throw error;
  }
}


/** @type { ActionOptions } */
export const options = {
  actionType: "create"
};
