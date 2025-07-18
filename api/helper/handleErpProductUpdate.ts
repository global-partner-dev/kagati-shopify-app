// import { ErpProductSyncGlobalActionContext } from "gadget-server";

// const mockUpdate = [
//   {
//     itemId: 1397,
//     itemName: "WAHL Oatmeal Shampoo 710ml",
//     mrp: 850,
//     outletId: 225,
//     stock: 7,
//   },
// ];

// export const handleErpProductUpdate = async (
//   context: ErpProductSyncGlobalActionContext,
//   itemsToUpdate2: Array<{
//     itemId: number;
//     outletId: number;
//     stock: number;
//   }>
// ) => {
  
//   const { api, logger } = context;
//   logger.info("Handler function is running");
//   logger.info("point3");
//   logger.info(JSON.stringify(itemsToUpdate2), "itemsToUpdate in handler");
//   logger.info("point4");

//   const skuList = Array.from(new Set(itemsToUpdate2.map((item) => String(item.itemId))));
//   logger.info(`${skuList} skuList`);
//   logger.info("point5");

//   const productsVariantsToUpdate = await api.shopifyProductVariant.findMany({
//     filter: { sku: { in: skuList } },
//     select: {
//       inventoryItem: {
//         id: true,
//         locations: {
//           edges: {
//             node: {
//               id: true,
//             },
//           },
//         },
//       },
//       sku: true,
//       outletId: true,
//       id: true,
//     },
//   });

//   logger.info("point6");
//   logger.info(`${JSON.stringify(productsVariantsToUpdate)} productsVariantsToUpdate`);

//   const shopId = "64696254601";

//   const inventoryData = productsVariantsToUpdate.map((productVariant) => {
//     const variantOutletId = productVariant.outletId;
//     const variantSku = productVariant.sku;

//     logger.info("point7");

//     const itemToUpdate = itemsToUpdate2.find(
//       (item) => String(item.itemId) === variantSku && item.outletId === variantOutletId
//     );

//     logger.info("point8");
//     logger.info(`${itemToUpdate} itemToUpdate in handler`);
//     logger.info("point9");

//     if (!itemToUpdate) {
//       logger.error(
//         `Item not found for SKU: ${variantSku} & OutletId: ${variantOutletId}`
//       );
//       return null;
//     } else {
//       logger.info("point10");
//       logger.info(`${itemToUpdate} this item found to be updated in handler`);
//       return {
//         inventoryItemId: productVariant.inventoryItem?.id,
//         locationId: productVariant.inventoryItem?.locations.edges[0].node.id,
//         quantity: itemToUpdate?.stock,
//       };
//     }
//   }).filter(Boolean); // Filter out null entries

//   logger.info("point11");

//   logger.info(inventoryData, "Inventory Data before sending");

//   await api.enqueue(
//     api.aaaUpdateVariantsInventory,
//     {
//       shopId,
//       inventoryData,
//     },
//     {
//       id: "background-update-variants-inventory" + new Date().toISOString(),
//     }
//   );
// };
