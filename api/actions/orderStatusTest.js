import { OrderStatusTestGlobalActionContext } from "gadget-server";

/**
 * Function to execute the global action for fetching and logging the status of a specific Shopify order.
 * 
 * This function is designed to be used as a global action within the Gadget server environment. 
 * It connects to a Shopify store using credentials and options provided via the Gadget connections, 
 * retrieves the status of a specific order by its order number, and logs relevant information about the order.
 * 
 * @param {OrderStatusTestGlobalActionContext} context - The context object containing parameters and resources
 * for executing the global action. The context includes:
 * 
 * @param {Object} context.params - Parameters passed to the global action. This typically includes the order number (`orderNumber`)
 * for which the status needs to be fetched.
 * 
 * @param {Object} context.logger - Logger object that can be used to log information, warnings, errors, etc.,
 * during the execution of the action.
 * 
 * @param {Object} context.api - API object that provides methods for interacting with the Gadget server's backend services,
 * if needed.
 * 
 * @param {Object} context.connections - Connections object that provides access to external services or databases.
 * In this case, it includes a connection to Shopify.
 * 
 * @returns {Promise<Object>} - The function is asynchronous and returns a Promise that resolves to an object 
 * containing the order status URL and the Shopify shop ID.
 * 
 * @example
 * // Example usage of the run function:
 * const result = await run({
 *   params: { orderNumber: 12345 },
 *   logger: console,
 *   api: gadgetApi,
 *   connections: { shopify: shopifyConnection }
 * });
 * 
 * console.log(result.response); // Logs the order status URL
 * console.log(result.shopId);   // Logs the Shopify shop ID
 */
export async function run({ params, logger, api, connections }) {
  // Step 1: Setup Shopify Connection
  const shopify = connections.shopify.current;
  logger.info(shopify, "shopify");
  
  const baseUrl = `https://${shopify.baseUrl.hostname}`;
  const apiVersion = shopify.options.apiVersion;
  const accessToken = shopify.options.accessToken;
  
  logger.info(baseUrl, "baseUrl");
  logger.info(apiVersion, "apiVersion");
  logger.info(accessToken, "accessToken");

  const shopifyShopId = connections.shopify.currentShopId;

  // Step 2: Define the order number you want to fetch
  const orderNumber = params.orderNumber; // Assuming `orderNumber` is passed in `params`
  
  // Construct the URL to fetch the order by its order number
  const fullUrl = `${baseUrl}/admin/api/${apiVersion}/orders.json`;

  // Setup request options with headers for authentication
  const requestOptions = {
    method: 'GET',
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json"
    }
  };

  // Make the API call using fetch
  const response = await fetch(fullUrl, requestOptions);

  if (!response.ok) {
    throw new Error(`Failed to fetch order: ${response.statusText}`);
  }

  const ordersResponse = await response.json();
  const order = ordersResponse.orders[0]; // Get the first (and likely only) order

  // Log the order status URL
  logger.info(order,"fetchedOrder");
  const orderStatusUrl = order.order_status_url;
  logger.info(orderStatusUrl, "Order Status URL");

  // Return the order status URL and shop ID
  return { response: orderStatusUrl, shopId: shopifyShopId };
};

/** @type { ActionOptions } */
export const options = {};