import { applyParams, preventCrossShopDataAccess, save, ActionOptions, CreateShopifyOrderActionContext } from "gadget-server";

/**
 * @param { CreateShopifyOrderActionContext } context
 */

export async function run({ params, record, logger, api, connections, trigger }) {
  try {
    logger.info({ params }, "params----- in shopifyorder create");
    logger.info({ record }, "record----- in shopifyorder create");
    logger.info({ trigger }, "trigger----- in shopifyorder create");

    // Check if this is a risk assessment webhook
    const isRiskAssessmentWebhook = trigger?.type === "shopify_webhook" && 
      trigger?.topic === "orders/risk_assessment_changed";

    applyParams(params, record);
    await preventCrossShopDataAccess(params, record);
    
    const existingDraftOrder = await api.shopifyDraftOrder.findMany({
      select: { orderId: true },
      filter: { orderId: { equals: String(record.id) } }
    });

    if (existingDraftOrder.length > 0) {
      logger.info("Draft order already exists");
      // Execute both API calls in parallel since they don't depend on each other
      await Promise.all([
        api.khagatiOrderUpdate({ id: record.id }),
        api.khagatiOrderSplitUpdate({ id: record.id })
      ]);
    } else {
      logger.info("Draft order does not exist");
      
      if (isRiskAssessmentWebhook && (!record.id || !record.noteAttributes)) {
        record.needsDelayedProcessing = true;
      }
      
      await save(record);

      if (record.needsDelayedProcessing) {
        const orderId = params.id || record.id;
        await api.enqueue(
          api.shopifyOrder.processDelayedOrder,
          { orderId },
          { 
            retries: { retryCount: 3, initialInterval: 5 * 60 * 1000 },
            queue: "delayed-order-processing"
          }
        );
        logger.info("Enqueued delayed order processing");
        return;
      }
    }

    
  } catch (error) {
    logger.error({ error }, "Error in run function");
    throw error;
  }
}

/**
 * @param { CreateShopifyOrderActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  
  // Skip processing if this order needs delayed processing
  if (record.needsDelayedProcessing) {
    logger.info("Skipping immediate processing for order that needs delayed processing");
    return;
  }

  if (!record.id) {
    logger.error("Record does not have an id");
    return;
  }

  try {
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
        id: record.id                                 
      });
      await api.khagatiOrderSplitUpdate({
        id: record.id
      });
      logger.info("Updated existing order successfully");
    } else {
      await api.createOrder({
        requestData: JSON.stringify(record)
      });

      await api.orderSplitMethod({ 
        orderId: record.id,
        orderType: record.noteAttributes?.length ? findNoteAttributeValue(record.noteAttributes, "_outletId") : "",
      });
      logger.info("Created new split order successfully");

      // Notification Center
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
          outletId: record.noteAttributes?.length ? findNoteAttributeValue(record.noteAttributes, "_outletId") : "",
          orderName: record.name,
          storeName: record.noteAttributes?.length ? findNoteAttributeValue(record.noteAttributes, "_storeName") : "",
          storeCode: record.noteAttributes?.length ? findNoteAttributeValue(record.noteAttributes, "_storeCode") : ""
        })
        setTimeout(async () => {
          result = await api.notificationCenter.update(orderNotification[0].id, {
            isTrigger: false
          });
          logger.info("Updated notification trigger to false after 5 seconds");
        }, 500);
      } else {
        result = await api.notificationCenter.create({
          event: "orderCreated",
          isTrigger: true,
          outletId: record.noteAttributes?.length ? findNoteAttributeValue(record.noteAttributes, "_outletId") : "",
          orderName: record.name,
          storeName: record.noteAttributes?.length ? findNoteAttributeValue(record.noteAttributes, "_storeName") : "",
          storeCode: record.noteAttributes?.length ? findNoteAttributeValue(record.noteAttributes, "_storeCode") : ""
        })
        setTimeout(async () => {
          result = await api.notificationCenter.update(result.id, {
            isTrigger: false
          });
          logger.info("Updated notification trigger to false after 5 seconds");
        }, 500);
      }
    }

  } catch (error) {
    logger.error({ error }, "Error in onSuccess function");
    throw error; // Re-throw to ensure errors are properly handled
  }
}

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};