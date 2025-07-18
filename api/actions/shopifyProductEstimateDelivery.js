import { ActionOptions, ShopifyProductEstimateDeliveryGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify product estimate delivery action.
 * 
 * This function creates a metafield in Shopify under the "estimateDelivery" key in the "kaghati" namespace. 
 * The function includes commented-out code that could be used for logging, parsing input parameters, and 
 * dynamically determining the owner ID and delivery value. The action logs the result of the operation 
 * and any errors that occur.
 * 
 * @async
 * @function run
 * @param {ShopifyProductEstimateDeliveryGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action, which could include estimate delivery and product ID.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * 
 * @returns {Promise<void>} A promise that resolves when the action completes.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, api, connections , logger}) {
  
  const shopify = connections.shopify.current;
  
  // Example code for parsing and logging input parameters
  // const data = parseInt(params.estimateDelivery);
  // logger.info(data);
  // logger.info(typeof(data));
  // const pid = parseInt(params.productId);
  // logger.info(pid);
  // logger.info(typeof(pid));

  // Example code for creating a metafield in Shopify with dynamic input
  // const response = await connections.shopify.current?.metafield.create({
  //     key: "estimateDelivery",
  //     namespace: 'kaghati',
  //     owner_resource: "product",
  //     owner_id: pid,  // Use parsed product ID
  //     type: "string",
  //     value: data.toString(),  // Use parsed estimate delivery value
  // });

  // Hardcoded example of creating a metafield in Shopify
  const response = await shopify.metafield.create({
      key: "estimateDelivery",
      namespace: 'kaghati',
      owner_resource: "product",
      owner_id: 8985019646242,  // Hardcoded product ID
      type: "single_line_text_field",
      value: "1234"  // Hardcoded delivery estimate value
  });

  if (response) {
    logger.info(response, "Meta Field Created!");
  } else {
    logger.info("Something error!");
  }
};

/** @type { ActionOptions } */
export const params = {
  // Uncommented example of defining parameters for the action
  // estimateDelivery: {
  //   type: "string"
  // },
  // productId: {
  //   type: "string"
  // }
};