export const run = async ({ params, api, connections, logger }) => {
    // Get Shopify client
    await connections.shopify.setCurrentShop("59823030316");
    const shopify = connections.shopify.current;
    if (!shopify) {
      throw new Error("Missing Shopify connection");
    }
    try {
      // Get refundable line items first
      const orderResult = await shopify.graphql(`
        query getOrder($id: ID!) {
          order(id: $id) {
            id
            lineItems(first: 50) {
              nodes {
                id
                refundableQuantity
              }
            }
          }
        }
      `, {
        id: `gid://shopify/Order/${params.id}`
      });
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
        orderId: `gid://shopify/Order/${params.id}`
      });
      const originalTransaction = orderTransactionQuery.order.transactions.find(
        (node) => (node.kind === "SALE" || node.kind === "CAPTURE") && node.status === "SUCCESS"
      );
      
      if (!originalTransaction) {
        throw new Error("No valid original transaction found for refund");
      }
      const originalTransactionId = originalTransaction.id;
      const originalTransactionGateway = originalTransaction.gateway;
      // Create refund for all refundable items
      const refundLineItems = orderResult.order.lineItems.nodes
        .filter(item => item.refundableQuantity > 0)
        .map(item => ({
          lineItemId: item.id,
          quantity: item.refundableQuantity
        }));
      // Calculate suggested refund
      const suggestedRefundResult = await shopify.graphql(`
        query suggestedRefund($orderId: ID!, $refundLineItems: [RefundLineItemInput!]!) {
          order(id: $orderId) {
            suggestedRefund(refundLineItems: $refundLineItems) {
              subtotalSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      `, {
        orderId: `gid://shopify/Order/${params.id}`,
        refundLineItems
      });
      // Create the refund directly without cancellation
      const refundResult = await shopify.graphql(`
        mutation refundCreate($input: RefundInput!) {
          refundCreate(input: $input) {
            userErrors {
              field
              message
            }
            refund {
              id
            }
          }
        }
      `, {
        input: {
          orderId: `gid://shopify/Order/${params.id}`,
          refundLineItems,
          currency: suggestedRefundResult.order.suggestedRefund.subtotalSet.shopMoney.currencyCode,
          note: "Order canceled",
          shipping: {
            fullRefund: true
          },
          notify: true,
          transactions: [{
            orderId: `gid://shopify/Order/${params.id}`,  
            amount: suggestedRefundResult.order.suggestedRefund.subtotalSet.shopMoney.amount,
            gateway: originalTransactionGateway,
            kind: "REFUND",
            parentId: originalTransactionId
          }]
        }
      });

      if (refundResult.refundCreate?.userErrors?.length > 0) {
        throw new Error(`Failed to create refund: ${refundResult.refundCreate.userErrors[0].message}`);
      }
      const khagatiOrder = await api.khagatiOrder.findFirst({
        select: {
          id: true
        },
        filter: {
          orderId: { equals: params.id }
        }
      });
      if (khagatiOrder) {
        await api.khagatiOrder.update(khagatiOrder.id, {
          financialStatus: 'refunded',
          // onHoldStatus: 'closed'
        });
      }
      logger.info({
        orderId: `gid://shopify/Order/${params.id}`,
        refundId: refundResult?.refundCreate?.refund?.id
      }, "Successfully processed refund");
      return refundResult;
    } catch (error) {
      logger.error({ error, orderId: `gid://shopify/Order/${params.id}` }, "Failed to process refund");
      throw error;
    }
  };
  
  export const params = {
    id: {
      type: "string"
    }
  };