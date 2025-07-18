import { ActionOptions, ShopifyProductoosPincodesGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify product out of stock pincodes update action.
 * 
 * This function sends product and stock data (including outlet IDs and hybrid stock levels) to Shopify by creating a metafield 
 * under the "oosPincodes" key in the "kaghati" namespace. The operation is logged, and errors are handled appropriately.
 * Additional commented-out code is included for potential future use.
 * 
 * @async
 * @function run
 * @param {ShopifyProductoosPincodesGlobalActionContext} context - The context object provided by Gadget Server.
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
  // Your logic goes here

  // Uncommented code for future use:
  // const estimateDelivery = params.oosPincodes;
  // logger.info(`estimateDelivery ${oosPincodes}`);
  // const productId = params.productId;
  // logger.info(`productId ${productId}`);

  // const shopify = connections.shopify.forShopId("84445790498");
  // if (!shopify) {
  //   logger.error("Shopify connection is not established.");
  //   return;
  // }
  // const newProductDescription = "Test";

  // if (shopify && newProductDescription) {
  //   await shopify.product.update(parseInt("8985018794274"));
  //   logger.info({ newProductDescription }, `Updating product id with new description`);
  // }

  // const product = await shopify.product.update(8985019646242, {
  //   title: "testing",
  // });
  // logger.info({ product }, "created new product in shopify");

  const shopify = connections.shopify.current;

  const oosPincodes = [
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

  // Uncommented code for creating metafield in Shopify
  // const response = await shopify.metafield.create(8985019646242,{
  //   key: 'storeStock',
  //   value: JSON.stringify(data),
  //   type: 'json',
  //   namespace: 'kaghati',
  //   owner_resource: 'product',
  // });

  // Create a metafield in Shopify with the out-of-stock pincodes data
  const response = await connections.shopify.current?.metafield.create({
    key: "oosPincodes",
    namespace: 'kaghati',
    owner_resource: "product",
    owner_id: 8985019646242,
    type: "json",
    value: oosPincodes,
  });

  if (response) {
    logger.info(response, "Meta Field Created!");
  } else {
    logger.info("Something error!");
  }
};

/** @type { ActionOptions } */
// Uncommented code for defining parameters for the action
// export const params = {
//   oosPincodes: {
//     type: "json"
//   },
//   productId: {
//     type: "string"
//   }
// };
export const options = {};