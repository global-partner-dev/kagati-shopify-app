import { ActionOptions, GlobalActionContext } from "gadget-server";

/**
 * @param { GlobalActionContext } context
 */
const paymentMode = (paymentGateway) => {
  switch (paymentGateway) {
      case "PhonePe PG":
          return "PhonePe"
      case "manual":
          return "Manual"
  
      default:
          break;
  }
}
export async function run({ params, logger, api, connections }) {
  await connections.shopify.setCurrentShop("59823030316");
  let shopify = connections.shopify.current;
  // Add your action logic here
  const orderTransactionQuery = await shopify.graphql(`
    query getOrderTransactions($orderId: ID!) {
      order(id: $orderId) {
        transactions {
          id
          gateway
          kind
          status
          amount
          processedAt
        }
      }
    }
  `, {
    orderId: `gid://shopify/Order/5683218645036`
  });
  const originalTransaction = orderTransactionQuery.order.transactions.find(
    (node) => (node.kind === "SALE" || node.kind === "CAPTURE") && node.status === "SUCCESS"
  );

const paymentModeType = paymentMode(originalTransaction.gateway)
return paymentModeType;
  return originalTransaction
  let result;
    const orderNotification = await api.notificationCenter.findMany({
      filter: {
        event: { equals: "orderCreated" }
      },
      select: {
        id: true
      }
    })

    if (orderNotification.length > 0) {
      result = await api.notificationCenter.update(orderNotification[0].id, {
        isTrigger: true,
        outletId: params.outletId,
        orderName: params.name,
        storeName: params.storeName,
        storeCode: params.storeCode
      })
      setTimeout(async () => {
        result = await api.notificationCenter.update(orderNotification[0].id, {
          isTrigger: false
        });
        logger.info("Updated notification trigger to false after 5 seconds");
      }, 1000);
    } else {
      result = await api.notificationCenter.create({
        event: "orderCreated",
        isTrigger: true,
        outletId: params.outletId,
        orderName: params.name,
        storeName: params.storeName,
        storeCode: params.storeCode
      })
      setTimeout(async () => {
        result = await api.notificationCenter.update(result.id, {
          isTrigger: false
        });
        logger.info("Updated notification trigger to false after 5 seconds");
      }, 1000);
    }
  // const khagatiOrderSplitId = await api.khagatiOrderSplit.findMany({
  //   select: {
  //     id: true
  //   },
  //   filter: {
  //     orderReferenceId: { equals: params.id }
  //   }
  // });
  // return khagatiOrderSplitId[0].id
  // if (existingDraftOrder.length > 0) {
  //   return existingDraftOrder[0].orderId;
  // }
  // return "not exists";
};


export const params = {
    name: {
        type: "string",
    },
    outletId: {
        type: "string",
    },
    storeName: {
        type: "string",
    },
    storeCode: {
        type: "string",
    },
};


