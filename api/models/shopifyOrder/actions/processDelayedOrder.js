import { ActionOptions, ProcessDelayedOrderActionContext } from "gadget-server";

/**
 * @param { ProcessDelayedOrderActionContext } context
 */
export async function run({ params, record, logger, api, trigger, connections }) {
  try {
    // Verify that the order has the required data
    if (!record.id || !record.noteAttributes) {
      logger.error({ record }, "Order data is still incomplete, skipping processing");
      return;
    }

    const findNoteAttributeValue = (attributes, attributeName) => {
      const attribute = attributes.find(attr => attr.name === attributeName);
      return attribute ? attribute.value : null;
    };

    const existingDraftOrder = await api.shopifyDraftOrder.findMany({
      select: { orderId: true },
      filter: { orderId: { equals: String(record.id) } }
    });

    if (existingDraftOrder.length > 0) {
      await api.khagatiOrderUpdate({
        id: existingDraftOrder[0].orderId                                 
      });
      await api.khagatiOrderSplitUpdate({
        id: existingDraftOrder[0].orderId
      });
      logger.info("Updated existing delayed order successfully");
    } else {
      await api.createOrder({
        requestData: JSON.stringify(record)
      });

      await api.orderSplitMethod({ 
        orderId: record.id,
        orderType: record.noteAttributes?.length ? findNoteAttributeValue(record.noteAttributes, "_outletId") : "",
      });
      logger.info("Created new delayed split order successfully");
    }

  } catch (error) {
    logger.error({ error }, "Error processing delayed order");
    throw error;
  }
}

/** @type { ActionOptions } */
export const options = {
  actionType: "custom",
  triggers: { api: true },
  params: {
    id: { type: "string" }, // Changed from orderId to id to match params used in run()
  },
};
