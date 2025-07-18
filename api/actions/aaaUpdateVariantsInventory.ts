// import { AaaUpdateVariantsPriceGlobalActionContext } from "gadget-server";

// export const params = {
//   shopId: { type: "string" },
//   test: { type: "string" },
//   inventoryData: {
//     type: "array",
//     items: {
//       type: "object",
//       properties: {
//         inventoryItemId: { type: "string" },
//         locationId: { type: "string" },
//         quantity: { type: "number" },
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
//   logger.info("Running updateVariantsInventory");

//   const { shopId, inventoryData } = params;
//   logger.info(shopId,"shopId");
//   logger.info(inventoryData,"inventoryData");

//   await connections.shopify.setCurrentShop(shopId as string);
//   const shopify = connections.shopify.current;

//   if (!shopify) {
//     throw Error("Shopify connection not found");
//   }

//   logger.debug({ inventoryData }, "UpdateVariantsInventory inventoryData");

//   // Create a bulk update mutation
//   const setQuantities = inventoryData.map((inventory) => ({
//     inventoryItemId: `gid://shopify/InventoryItem/${inventory.inventoryItemId}`,
//     locationId: `gid://shopify/Location/${inventory.locationId}`,
//     quantity: inventory.quantity,
//   }));

//   logger.debug({ setQuantities }, "UpdateVariantsInventory setQuantities");

//   const mutation = `#graphql
//     mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
//       inventorySetOnHandQuantities(input: $input) {
//         userErrors {
//           field
//           message
//         }
//         inventoryAdjustmentGroup {
//           createdAt
//           reason
//           changes {
//             name
//             delta
//           }
//         }
//       }
//     }
//   `;

//   const variables = {
//     input: {
//       reason: "correction",
//       setQuantities: setQuantities,
//     },
//   };

//   logger.debug(
//     { mutation, mutationJson: JSON.stringify(mutation) },
//     "UpdateVariantsInventory mutation"
//   );

//   try {
//     const response = await shopify.graphql(mutation, variables);

//     logger.info(
//       `Inventory update setQuantities update response: ${JSON.stringify(
//         response
//       )}`
//     );
//   } catch (error) {
//     logger.error(
//       "Error performing inventory update setQuantities: " + error.message
//     );
//   }
// }
