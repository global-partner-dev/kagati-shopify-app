/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  // Your logic goes here
  const shopifyOrderId = params.id
  const shopifyOrderRecord = await api.shopifyOrder.findOne(shopifyOrderId, {
    select: {
      _all: true,
      customer: {
        _all: true
      },
      lineItems: {
        edges: {
          node: {
            _all: true
          }
        }
      }
    }
  });
  return shopifyOrderRecord
};
export const params = {
  id: {
    type: "string"
  },
};
export const options = { triggers: { api: true } }

