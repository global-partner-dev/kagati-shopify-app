import { UpdateProductGlobalActionContext } from "gadget-server";

/**
 * Updates a product in Shopify using the provided product ID and request data.
 * 
 * @async
 * @function run
 * @param {UpdateProductGlobalActionContext} context - The context object provided by Gadget, containing scope, params, logger, and connections.
 * @param {Object} context.scope - The scope object used to store the result of the operation.
 * @param {Object} context.params - The parameters passed to the action, including `productId` and `requestData`.
 * @param {string} context.params.productId - The ID of the product to update in Shopify.
 * @param {string} context.params.requestData - A JSON string containing the product data to update in Shopify.
 * @param {Object} context.logger - The logger object used for logging information and errors during execution.
 * @param {Object} context.connections - The connections object containing the Shopify connection details.
 * 
 * @throws {Error} Throws an error if the product update operation fails.
 * 
 * @returns {Promise<void>} - The function does not return a value but sets `scope.result` to the updated product data.
 */
export async function run({ scope, params, logger, connections }) {
  try {
    const responseKhagatiSMS = await api.khagatiSMS({ cName, phoneNumber, tId });
    logger.info(responseKhagatiSMS, "Update product params");
    logger.info(JSON.parse(params.requestData), "Update product params");
    const shopify = connections.shopify.current;
    const responseProductData = await shopify.product.update(params.productId, JSON.parse(params.requestData));
    logger.info({ responseProductData }, "Updated new product in shopify");
    scope.result = responseProductData;
  } catch (error) {
    logger.error({ error }, "Error updating product in Shopify");
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

/**
 * The parameters required to update a product in Shopify.
 * 
 * @type {Object}
 * @property {string} productId - The ID of the product to update in Shopify.
 * @property {string} requestData - A JSON string containing the product data to update in Shopify.
 */
export const params = {
  productId: {
    type: "string"
  },
  requestData: {
    type: "string"
  },
};