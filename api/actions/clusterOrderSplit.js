import { ClusterOrderSplitGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the cluster order split process.
 * 
 * @param {ClusterOrderSplitGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the cluster order split process is completed.
 */
export async function run({ params, logger, api, connections }) {
  logger.info("Cluster Order Split");

  // Fetch the Shopify order details using the provided order ID
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

  // Prepare the base order request data
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

  // Create an entry in the local ERP system for the base order information
  await api.khagatiOrderInfo.create(orderRequestData);

  // Fetch the primary store details based on the shipping address pincode
  const pincode = await api.khagatiPinCode.findMany({
    select: {
      storeId: true,
      storeCode: true
    },
    filter: {
      pinCode: { equals: shopifyOrderRecord.shippingAddress.zip }
    }
  });

  const primaryStore = await api.khagatiStores.findMany({
    select: {
      erpStoreId: true,
      storeCode: true,
      storeName: true,
      storeCluster: true
    },
    filter: {
      erpStoreId: { equals: pincode[0].storeId },
      status: { in: ["Active"] }
    }
  });

  // Fetch details of all stores in the cluster
  const clusterStores = await api.khagatiStores.findMany({
    select: {
      erpStoreId: true,
      storeCode: true,
      storeName: true,
      storeCluster: true
    },
    filter: {
      storeCluster: { equals: primaryStore[0].storeCluster },
      status: { in: ["Active"] }
    }
  });

  // Check item availability across the stores in the cluster
  let storeItemsAvailability = await Promise.all(clusterStores.map(async store => {
    let storeItems = [];
    await Promise.all(shopifyOrderRecord.lineItems.edges.map(async item => {
      const erpStocks = await api.erpStock.findMany({
        select: { stock: true },
        filter: {
          AND: [
            { itemReferenceCode: { equals: item.node.sku } },
            { outletId: { equals: Number(store.erpStoreId) } }
          ]
        }
      });
      if (erpStocks.length > 0 && erpStocks[0].stock > 0) {
        storeItems.push({
          itemId: item.node.id,
          sku: item.node.sku,
          availableQuantity: Math.min(item.node.fulfillableQuantity, erpStocks[0].stock),
          storeId: store.erpStoreId
        });
      }
    }));
    return {
      storeId: store.erpStoreId,
      storeCode: store.storeCode,
      storeName: store.storeName,
      items: storeItems
    };
  }));

  // Sort stores by the total available quantity of items in descending order
  storeItemsAvailability.sort((a, b) => {
    const totalA = a.items.reduce((acc, item) => acc + item.availableQuantity, 0);
    const totalB = b.items.reduce((acc, item) => acc + item.availableQuantity, 0);
    return totalB - totalA;
  });

  // Initialize arrays for primary and backup store items
  let primaryStoreItems = [];
  let backStoreItems = [];

  // Allocate items to primary and backup stores based on availability
  await Promise.all(shopifyOrderRecord.lineItems.edges.map(async (item) => {
    const erpStocks = await api.erpStock.findMany({
      select: { stock: true },
      filter: {
        AND: [
          { itemReferenceCode: { equals: item.node.sku } },
          { outletId: { equals: Number(storeItemsAvailability[0].storeId) } }
        ]
      }
    });
    if (erpStocks[0].stock > item.node.fulfillableQuantity) {
      primaryStoreItems.push({
        id: item.node.id,
        quantity: item.node.fulfillableQuantity,
        itemReferenceCode: item.node.sku,
        outletId: Number(primaryStore[0].erpStoreId)
      });
    } else {
      const remainingQuantity = item.node.fulfillableQuantity - erpStocks[0].stock;
      primaryStoreItems.push({
        id: item.node.id,
        quantity: erpStocks[0].stock,
        itemReferenceCode: item.node.sku,
        outletId: Number(primaryStore[0].erpStoreId)
      });
      backStoreItems.push({
        id: item.node.id,
        quantity: remainingQuantity,
        itemReferenceCode: item.node.sku,
        outletId: Number(primaryStore[0].erpStoreId)
      });
    }
  }));

  logger.info(storeItemsAvailability, "storeItemsAvailability");

  // Prepare order distributions for each store based on item availability
  let orderDistributions = [];
  let remainingItems = shopifyOrderRecord.lineItems.edges.map(item => ({
    itemId: item.node.id,
    sku: item.node.sku,
    quantityNeeded: item.node.fulfillableQuantity,
  }));

  for (let store of storeItemsAvailability) {
    if (remainingItems.length === 0) break;  // Stop if all items are allocated

    let distribution = {
      storeName: store.storeName,
      splitId: `${shopifyOrderRecord.orderNumber}-${store.storeCode}`,
      orderNumber: shopifyOrderRecord.orderNumber,
      storeCode: store.storeCode,
      erpStoreId: store.storeId,
      orderReferenceId: shopifyOrderRecord.id,
      orderStatus: "new",
      lineItems: [],
    };

    for (let i = remainingItems.length - 1; i >= 0; i--) {
      const item = remainingItems[i];
      const erpStocks = await api.erpStock.findMany({
        select: { stock: true },
        filter: {
          AND: [
            { itemReferenceCode: { equals: item.sku } },
            { outletId: { equals: Number(store.storeId) } }
          ]
        }
      });

      if (erpStocks.length > 0 && erpStocks[0].stock > 0) {
        if (erpStocks[0].stock >= item.quantityNeeded) {
          distribution.lineItems.push({
            id: item.itemId,
            quantity: item.quantityNeeded,
            itemReferenceCode: item.sku,
            outletId: store.storeId
          });
          remainingItems.splice(i, 1);
        } else {
          distribution.lineItems.push({
            id: item.itemId,
            quantity: erpStocks[0].stock,
            itemReferenceCode: item.sku,
            outletId: store.storeId
          });
          item.quantityNeeded -= erpStocks[0].stock;
        }
      }
    }

    if (distribution.lineItems.length > 0) {
      orderDistributions.push(distribution);
    }
  }

  // Store the order distributions in the local ERP system
  await api.khagatiOrderSplit.bulkCreate(orderDistributions);

  // Trigger customer synchronization for the order
  await api.erpCustomerSync({
    orderId: params.orderId
  });
}

/**
 * Parameters for the Shopify cluster order split action.
 * 
 * @type {Object}
 * @property {string} orderId - The ID of the Shopify order to process.
 */
export const params = {
  orderId: {
    type: "string"
  },
};