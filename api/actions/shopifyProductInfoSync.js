import { ActionOptions, ShopifyProductInfoSyncGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify product information synchronization action.
 * 
 * This function creates a metafield in Shopify under the "storeStock" key in the "kaghati" namespace, storing product and stock data.
 * The action also includes commented-out code that demonstrates how product descriptions and titles might be updated in Shopify.
 * The operation is logged, and any errors encountered during the process are handled appropriately.
 * 
 * @async
 * @function run
 * @param {ShopifyProductInfoSyncGlobalActionContext} context - The context object provided by Gadget Server.
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

  // Example code for establishing a Shopify connection for a specific shop
  // const shopify = connections.shopify.forShopId("84445790498");
  // if (!shopify) {
  //   logger.error("Shopify connection is not established.");
  //   return;
  // }
  // Example code for updating a product description in Shopify
  // const newProductDescription = "Test";
  // if (shopify && newProductDescription) {
  //   await shopify.product.update(parseInt("8985018794274"));
  //   logger.info({ newProductDescription }, `Updating product id with new description`);
  // }

  // Example code for updating a product's title in Shopify
  // const product = await shopify.product.update(8985019646242, {
  //   title: "testing",
  // });
  // logger.info({ product }, "created new product in shopify");

  const shopify = connections.shopify.current;

  const data = [
    {
      "outletId": 314,
      "product": [
        {
          "hybridStock": 164,
          "productId": "8985018794274",
          "variantId": "47842040447266"
        },
        {
          "hybridStock": 110,
          "productId": "8985019154722",
          "variantId": "47842041987362"
        }
      ]
    }
  ];

  // Uncommented code for creating a metafield in Shopify with store stock data
  // const response = await shopify.metafield.create(8985019646242,{
  //   key: 'storeStock',
  //   value: JSON.stringify(data),
  //   type: 'json',
  //   namespace: 'kaghati',
  //   owner_resource: 'product',
  // });

  // Create a metafield in Shopify with the store stock data
  const response = await connections.shopify.current?.metafield.create({
    key: "storeStock",
    namespace: 'kaghati',
    owner_resource: "product",
    owner_id: 8985019646242,
    type: "json",
    value: JSON.stringify(data),
  });

  if (response) {
    logger.info(response, "Meta Field Created!");
  } else {
    logger.info("Something error!");
  }
}

// Helper functions and logic from the previous steps need to be defined here as well
// Including fetchMetafieldIds, getModelMetafieldSchema, buildRESTMetafieldsPayload

/** @type { ActionOptions } */
// Uncommented code for defining parameters for the action
// export const params = {
//   title: {
//     type: "string"
//   }
// };

export const options = {};