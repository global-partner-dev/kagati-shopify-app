import { CancelShopifyOrderGlobalActionContext } from "gadget-server";

/**
 * @param {CancelShopifyOrderGlobalActionContext} context
 */
export async function run({ params, logger, api, connections }) {
  // Extracting the order ID from the parameters
  const id = params.id;
  logger.info({ id }, "Starting order cancellation process");

  try {
    const fulfilledOrder = await api.shopifyFulfillment.findMany({
      filter: {
        orderId: {
          equals: id
        }
      }
    });
    if (fulfilledOrder.length > 0 && fulfilledOrder[0].status === "success") {
      const mutation = `mutation fulfillmentCancel($id: ID!) {
        fulfillmentCancel(id: $id) {
          fulfillment {
            id
            status
            displayStatus
          }
          userErrors {
            field
            message
          }
        }
      }`

      const variables = {
        id: `gid://shopify/Fulfillment/${fulfilledOrder[0].id}`,
      }

      logger.info({ variables: variables }, "Cancelling fulfillment");
      const response = await api.shopifyRequest({
        query: mutation,
        variables: JSON.stringify(variables),
      });
      logger.info({ response: response }, "Fulfillment cancelled successfully");
    }

    // Cancel the order using Shopify's GraphQL API
    const mutation = `
        mutation orderCancel($notifyCustomer: Boolean, $orderId: ID!, $reason: OrderCancelReason!, $refund: Boolean!, $restock: Boolean!, $staffNote: String) {
          orderCancel(notifyCustomer: $notifyCustomer, orderId: $orderId, reason: $reason, refund: $refund, restock: $restock, staffNote: $staffNote) {
            job {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
    `;

    const variables = {
      orderId: `gid://shopify/Order/${id}`,
      notifyCustomer: false,
      reason: "CUSTOMER",
      refund: false,
      restock: true,
      staffNote: "Order cancelled via API"
    };

    const job = await api.enqueue(api.shopifyRequest, {
      query: mutation,
      variables: JSON.stringify(variables),
    });
    const response = await job.result();

    if (response.orderCancel.userErrors.length > 0) {
      logger.error({
        id,
        errors: response.orderCancel.userErrors
      }, "Error cancelling order");
      throw new Error("Failed to cancel order: " + JSON.stringify(response.orderCancel.userErrors));
    }

    logger.info({ response: response }, "Order cancelled successfully");

    return {
      success: true,
      orderId: id,
      jobId: response.orderCancel.job.id
    };

  } catch (error) {
    logger.error({ error, id }, "Error in order cancellation");
    throw error;
  }
}

// Define the parameter schema
export const params = {
  id: {
    type: "string",
  }
};
