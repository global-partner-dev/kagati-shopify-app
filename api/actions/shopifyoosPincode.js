import { ActionOptions, ShopifyoosPincodeGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify out-of-stock pincodes synchronization action.
 * 
 * This function sends pincode data to Shopify by creating a metafield under the "oosPincodes" key in the "kaghati" namespace.
 * The function also includes commented-out code that demonstrates how store stock data might be uploaded to Shopify.
 * The operation's success or failure is logged.
 * 
 * @async
 * @function run
 * @param {ShopifyoosPincodeGlobalActionContext} context - The context object provided by Gadget Server.
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
  const shopify = connections.shopify.current;

  // Example data structure for OOS pincodes
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

  // Example commented-out code for creating a metafield in Shopify with store stock data
  // const response = await shopify.metafield.create(8985019646242,{
  //   key: 'storeStock',
  //   value: JSON.stringify(data),
  //   type: 'json',
  //   namespace: 'kaghati',
  //   owner_resource: 'product',
  // });

  // Create a metafield in Shopify with the OOS pincodes data
  const response = await connections.shopify.current?.metafield.create({
    key: "oosPincodes",
    namespace: 'kaghati',
    owner_resource: "product",
    owner_id: 8985019646242,
    type: "json",
    value: JSON.stringify([123, 124, 125]), // Example pincode values
  });

  if (response) {
    logger.info(response, "Meta Field Created!");
  } else {
    logger.info("Something error!");
  }
};

/** @type { ActionOptions } */
export const options = {};