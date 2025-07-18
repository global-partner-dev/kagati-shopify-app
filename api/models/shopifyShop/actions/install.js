import { applyParams, save, ActionOptions, InstallShopifyShopActionContext } from "gadget-server";

/**
 * @param { InstallShopifyShopActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await save(record);
};

/**
 * @param { InstallShopifyShopActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
  const shopify = connections.shopify.current;

  const user = {
    name: 'John Doe',
    age: 30,
    isAdmin: true,
    courses: ['JavaScript', 'GraphQL', 'Node.js'],
  };

  const jsonString = JSON.stringify(user);

  shopify.metafield
  .create({
    key: 'inventory',
    value: jsonString,
    type: 'json',
    namespace: 'kaghati',
    owner_resource: 'shop',
  })
  .then(
    (metafield) => logger.info(metafield, ),
    (err) => logger.error(err)
  );
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};
