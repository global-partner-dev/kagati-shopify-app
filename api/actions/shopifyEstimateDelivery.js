import { ActionOptions, ShopifyEstimateDeliveryGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify estimate delivery action.
 * 
 * This function takes input parameters, logs them, and uses the Shopify API to create a metafield for the estimated delivery time.
 * The function also includes commented-out code for future enhancements, such as updating product descriptions and handling store stock data.
 * The success or failure of the metafield creation is logged.
 * 
 * @async
 * @function run
 * @param {ShopifyEstimateDeliveryGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action, including estimate delivery and product ID.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves when the action completes.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  // Log the estimate delivery and product ID parameters
  const estimate = params.estimateDelivery;
  logger.info(`estimateDelivery ${estimate}`);
  logger.info(`estimateDelivery type: ${typeof(estimate)}`);
  const pid = parseInt(params.productId);
  logger.info(`productId ${pid}`);
  
  // Example commented-out code for establishing a Shopify connection and updating product information
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

  // Example commented-out data for handling store stock
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

  // Example commented-out code for creating a metafield with store stock data
  // const response = await shopify.metafield.create(8985019646242,{
  //   key: 'storeStock',
  //   value: JSON.stringify(data),
  //   type: 'json',
  //   namespace: 'kaghati',
  //   owner_resource: 'product',
  // });

  // Create a metafield in Shopify with the estimated delivery data
  const response = await connections.shopify.current?.metafield.create({
    key: "estimateDelivery",
    namespace: 'kaghati',
    owner_resource: "product",
    owner_id: 8985019646242,
    type: "string",
    value: "123", // Hardcoded estimate delivery value for demonstration
  });

  if (response) {
    logger.info(response, "Meta Field Created!");
  } else {
    logger.info("Something error!");
  }
};

/**
 * Parameters required for estimating delivery for a Shopify product.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} estimateDelivery - The estimated delivery time to be stored in Shopify.
 * @property {string} productId - The ID of the Shopify product for which the estimated delivery time is being set.
 */
export const params = {
  estimateDelivery: {
    type: "string"
  },
  productId: {
    type: "string"
  }
};

export const options = {};