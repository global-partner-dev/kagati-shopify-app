import { PrimaryWithBackupOrderSplitGlobalActionContext } from "gadget-server";

/**
 * Executes the Primary With Backup Order Split action.
 * 
 * This function retrieves order details from Shopify, checks stock availability at both primary and backup stores,
 * and splits the order items accordingly. It creates order records for each store, updates the ERP system, and logs the entire process.
 * 
 * @async
 * @function run
 * @param {PrimaryWithBackupOrderSplitGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action, including the Shopify order ID.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves when the order splitting and synchronization are complete.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  // Log the start of the process
  logger.info("Primary With Backup Order Split");

  // Fetch Shopify order details using the order ID
  const shopifyOrderRecord = await api.shopifyOrder.findOne(params.orderId, {
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
            fulfillableQuantity: true,
          }
        },
      },
      shippingAddress: true,
    }
  });

  // Prepare order data for creating order info
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

  // Create order info record
  await api.khagatiOrderInfo.create(orderRequestData);

  // Fetch the store ID and code based on the shipping address pincode
  const pincode = await api.khagatiPinCode.findMany({
    select: {
      storeId: true,
      storeCode: true
    },
    filter: {
      pinCode: { equals: shopifyOrderRecord.shippingAddress.zip }
    }
  });

  // Fetch primary store details
  const store = await api.khagatiStores.findMany({
    select: {
      erpStoreId: true,
      storeCode: true,
      storeName: true,
      selectBackupWarehouse: true,
    },
    filter: { erpStoreId: { equals: pincode[0].storeId } }
  });

  // Fetch backup store details
  const backUpStore = await api.khagatiStores.findMany({
    select: {
      erpStoreId: true,
      storeCode: true,
      storeName: true,
    },
    filter: {
      erpStoreId: { equals: store[0].selectBackupWarehouse },
    }
  });

  let primaryStoreItems = [];
  let backStoreItems = [];

  // Iterate through each line item in the Shopify order
  await Promise.all(shopifyOrderRecord.lineItems.edges.map(async (item) => {
    // Fetch ERP stock data for the item
    const erpStocks = await api.erpStock.findMany({
      select: { stock: true },
      filter: {
        AND: [
          { itemReferenceCode: { equals: item.node.sku } },
          { outletId: { equals: Number(pincode[0].storeId) } }
        ]
      }
    });

    // Check if the primary store has sufficient stock
    if (erpStocks[0].stock > item.node.fulfillableQuantity) {
      primaryStoreItems.push({
        id: item.node.id,
        quantity: item.node.fulfillableQuantity,
        itemReferenceCode: item.node.sku,
        outletId: Number(store[0].erpStoreId)
      });
    } else {
      // Calculate remaining quantity for the backup store
      const remainingQuantity = item.node.fulfillableQuantity - erpStocks[0].stock;
      primaryStoreItems.push({
        id: item.node.id,
        quantity: erpStocks[0].stock,
        itemReferenceCode: item.node.sku,
        outletId: Number(store[0].erpStoreId)
      });
      backStoreItems.push({
        id: item.node.id,
        quantity: remainingQuantity,
        itemReferenceCode: item.node.sku,
        outletId: Number(backUpStore[0].erpStoreId)
      });
    }
  }));

  let result = [];

  // Create primary store order split
  if (primaryStoreItems.length) {
    result.push({
      lineItems: primaryStoreItems,
      splitId: `${shopifyOrderRecord.orderNumber}-${store[0].storeCode}`,
      orderNumber: shopifyOrderRecord.orderNumber,
      storeCode: store[0].storeCode,
      storeName: store[0].storeName,
      erpStoreId: store[0].erpStoreId,
      orderReferenceId: shopifyOrderRecord.id,
      orderStatus: "new",
    });
  }

  // Create backup store order split
  if (backStoreItems.length) {
    result.push({
      lineItems: backStoreItems,
      splitId: `${shopifyOrderRecord.orderNumber}-${backUpStore[0].storeCode}`,
      orderNumber: shopifyOrderRecord.orderNumber,
      storeCode: backUpStore[0].storeCode,
      storeName: backUpStore[0].storeName,
      erpStoreId: store[0].erpStoreId,
      orderReferenceId: shopifyOrderRecord.id,
      orderStatus: "new",
    });
  }

  // Bulk create order splits
  await api.khagatiOrderSplit.bulkCreate(result);

  // Synchronize customer data with ERP system
  await api.erpCustomerSync({
    orderId: params.orderId
  });
}

/**
 * Parameters required for the Primary With Backup Order Split action.
 *
 * @constant
 * @type {object}
 * @property {string} orderId - The ID of the Shopify order that needs to be split.
 */
export const params = {
  orderId: {
    type: "string"
  },
};