import { ActionOptions, ShopifyProductStoreStockGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify product store stock update action.
 * 
 * This function creates a metafield in Shopify that stores stock information for specific product variants. 
 * The stock data, including the outlet ID and hybrid stock levels, is provided in JSON format and is stored 
 * under the "storeStock" key in the "kaghati" namespace.
 * 
 * @async
 * @function run
 * @param {ShopifyProductStoreStockGlobalActionContext} context - The context object provided by Gadget Server.
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

  // Create a metafield in Shopify with the stock data
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
    logger.info("Something went wrong while creating the metafield!");
  }
};

/** 
 * Action options for the Shopify product store stock update action.
 *
 * @constant
 * @type {ActionOptions}
 */
export const options = {};
