import { applyParams, save, ActionOptions, CreateKhagatiOrderInfoActionContext } from "gadget-server";

/**
 * @param { CreateKhagatiOrderInfoActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateKhagatiOrderInfoActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  if (!record.orderReferenceId) {
    logger.error("Record does not have an orderId. Cannot call Khagati Order Split.");
    return;
  }

  try {
    const { id, orderNumber, lineItems } = await api.shopifyOrder.findOne(record.orderReferenceId, {
      select: {
        id: true,
        orderNumber: true,
        lineItems: {
          edges: { node: { id: true } },
        },
      },
    });

    logger.info(id, orderNumber, lineItems)

    const stores = await api.khagatiStores.findMany(
      {
        select: {
          storeCode: true,
          storeName: true
        }
      }
    );

    logger.info(stores, "stores")

    const lineItemIDs = lineItems.edges.map(edge => edge.node.id);

    let result = [];

    if (lineItemIDs.length === 1) {
      result.push({
        lineItems: lineItemIDs,
        splitId: `${orderNumber}-${stores[0].storeCode}`,
        orderNumber: orderNumber,
        storeCode: stores[0].storeCode,
        storeName: stores[0].storeName,
        orderReferenceId: id,
        orderStatus: "new"
      });
    } else {
      const splitPoint = Math.ceil(lineItemIDs.length / 2);
      result = stores.slice(0, 2).map((store, index) => ({
        lineItems: index === 0 ? lineItemIDs.slice(0, splitPoint) : lineItemIDs.slice(splitPoint),
        splitId: `${orderNumber}-${store.storeCode}`,
        orderNumber: orderNumber,
        storeCode: store.storeCode,
        storeName: stores.storeName,
        orderReferenceId: id,
        orderStatus: "new"
      }));
    }

    await api.khagatiOrderSplit.bulkCreate(result);

    logger.info("Khagati Order Split called successfully.");
  } catch (error) {
    logger.error({ error }, "Error calling Khagati Order Split");
  }
}

/** @type { ActionOptions } */
export const options = {
  actionType: "create"
};
