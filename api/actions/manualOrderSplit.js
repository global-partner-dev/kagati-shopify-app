import { ManualOrderSplitGlobalActionContext } from "gadget-server";

/**
 * Function to execute the global action for manually splitting an order.
 * 
 * This function is designed to handle the manual splitting of an order in the Gadget server environment.
 * It retrieves the Shopify order details, prepares the order data, and then splits the order based on the provided
 * order type. The split information is then recorded, and the order is synced with the ERP system.
 * 
 * @param {ManualOrderSplitGlobalActionContext} context - The context object containing parameters and resources
 * for executing the global action. The context includes:
 * 
 * @param {Object} context.params - Parameters passed to the global action. This typically includes:
 *  - `orderId`: The ID of the Shopify order that needs to be split.
 *  - `orderType`: The type of split to apply to the order, typically corresponding to an ERP store ID.
 * 
 * @param {Object} context.logger - Logger object used to log information, warnings, errors, etc., during the execution
 * of the action.
 * 
 * @param {Object} context.api - API object that provides methods for interacting with the Gadget server's backend services,
 * including retrieving Shopify order details, creating order information records, and syncing data with the ERP system.
 * 
 * @param {Object} context.connections - Connections object that can be used to interact with other services or databases
 * connected to the Gadget server.
 * 
 * @returns {Promise<void>} - The function is asynchronous and returns a Promise. The function's logic handles
 * any asynchronous operations, such as API calls and database operations, within its implementation.
 * 
 * @example
 * // Example usage of the run function:
 * await run({
 *   params: { orderId: "12345", orderType: "someOrderType" },
 *   logger: console,
 *   api: gadgetApi,
 *   connections: someDatabaseConnection
 * });
 */
export async function run({ params, logger, api, connections }) {
  logger.info("i am here manual order");


  const orderId=String(params.orderId);
  // Fetch the Shopify order details using the provided orderId
  const shopifyOrderRecord = await api.shopifyOrder.findOne(orderId, {
    select: {
      id: true,
      orderNumber: true,
      financialStatus: true,
      tags: true,
      lineItems: {
        edges: {
          node: {
            id: true,
            sku: true,
            quantity: true,
          }
        },
      },
      shippingAddress: true,
    }
  });

  // Prepare the order request data
  const orderRequestData = {
    orderId: shopifyOrderRecord.orderNumber,
    orderReferenceId: shopifyOrderRecord.id,
    deliveryPaymentType: shopifyOrderRecord.financialStatus,
    orderTags: shopifyOrderRecord.tags,
    comments: ["Order created successfully"],
    smsNotification: "notSent",
    emailNotification: "notSent",
    whatsAppNotification: "notSent",
  };

  // Create the order information record in khagatiOrderInfo
  await api.khagatiOrderInfo.create(orderRequestData);

  // Fetch the store details based on the provided orderType
  const store = await api.khagatiStores.findMany({
    select: {
      erpStoreId: true,
      storeCode: true,
      storeName: true,
      selectBackupWarehouse: true,
    },
    filter: { erpStoreId: { equals: params.orderType } }
  });

  let primaryStoreItems = [];

  // Process each line item in the Shopify order
  await Promise.all(shopifyOrderRecord.lineItems.edges.map(async (item) => {
    primaryStoreItems.push({
      id: item.node.id,
      quantity: item.node.quantity,
      itemReferenceCode: item.node.sku,
      outletId: Number(store[0].erpStoreId)
    });
  }));

  let result = [];
  const currentTimeStamp=Date.now();
  const timeStamp={
    new: currentTimeStamp
  }

  // If there are items to split, prepare the split order data
  if (primaryStoreItems && primaryStoreItems.length > 0) {
    result.push({
      lineItems: primaryStoreItems,
      splitId: `${shopifyOrderRecord.orderNumber}-${store[0].storeCode}`,
      orderNumber: shopifyOrderRecord.orderNumber,
      storeCode: store[0].storeCode,
      storeName: store[0].storeName,
      erpStoreId: store[0].erpStoreId,
      orderReferenceId: shopifyOrderRecord.id,
      orderStatus: "new",
      timeStamp:timeStamp
    });
  }

  logger.info(result, "result");

  // Create the order split records in khagatiOrderSplit
  await api.khagatiOrderSplit.bulkCreate(result);

  // Sync the order with the ERP system
  await api.erpCustomerSync({
    orderId: params.orderId
  });
};

/**
 * Parameters for the manual order split global action.
 * 
 * @type {Object}
 */
export const params = {
  orderId: {
    type: "string",
    description: "The ID of the Shopify order to be split.",
  },
  orderType: {
    type: "string",
    description: "The type of split to apply to the order, typically corresponding to an ERP store ID.",
  }
};