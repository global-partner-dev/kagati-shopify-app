// import { AaaUpdateVariantsPriceGlobalActionContext } from "gadget-server";

// export const params = {
//   shopId: { type: "string" },
//   variantId: { type: "string" },
//   price: { type: "number" },
//   variant: {
//     type: "object",
//     properties: {
//       variantId: { type: "string" },
//       price: { type: "number" },
//     },
//   },
//   variants: {
//     type: "array",
//     items: {
//       type: "object",
//       properties: {
//         variantId: { type: "string" },
//         price: { type: "number" },
//       },
//     },
//   },
// };

// /**
//  * @param { BulkUpdateVariantsGlobalActionContext } context
//  */
// export async function run({
//   params,
//   logger,
//   api,
//   connections,
// }: AaaUpdateVariantsPriceGlobalActionContext) {
//   // Recieve list of variants to update { variantId: string, quantity: number }[]
//   logger.info("Running updateVariantsPrice");

//   const { shopId, variantId, price } = params;

//   await connections.shopify.setCurrentShop(shopId as string);
//   const shopify = connections.shopify.current;

//   if (!shopify) {
//     throw Error("Shopify connection not found");
//   }

//   // Create a bulk update mutation

//   const mutation = `
//     mutation {
//       productVariantUpdate(input: { id: "gid://shopify/ProductVariant/${variantId}", price: ${price} }) {
//         productVariant {
//           id
//           price
//         }
//         userErrors {
//           message
//           field
//         }
//       }
//     }
//   `;

//   try {
//     const response = await shopify.graphql(mutation);

//     logger.info(`Single price update response: ${JSON.stringify(response)}`);
//   } catch (error) {
//     logger.error("Error performing single price update: " + error.message);
//   }
// }

// const performSinglePriceUpdate = async (
//   shopify,
//   { variantId, price },
//   logger
// ) => {
//   logger.info(
//     `Performing single price update for variantId: ${variantId}, price: ${price}`
//   );
//   const mutation = `
//     mutation {
//       productVariantUpdate(input: { id: "gid://shopify/ProductVariant/${variantId}", price: ${price} }) {
//         productVariant {
//           id
//           price
//         }
//         userErrors {
//           message
//           field
//         }
//       }
//     }
//   `;

//   try {
//     const response = await shopifyRequest(shopify, mutation, logger, 1);
//     logger.info(`Single price update response: ${JSON.stringify(response)}`);
//   } catch (error) {
//     logger.error("Error performing single price update: " + error.message);
//   }
// };
