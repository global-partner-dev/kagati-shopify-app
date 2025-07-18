// import { AaaBulkUpdateHandlerGlobalActionContext } from "gadget-server";

// /**
//  * @param { BulkUpdateVariantsGlobalActionContext } context
//  */
// export async function run({
//   params,
//   logger,
//   api,
//   connections,
// }: AaaBulkUpdateHandlerGlobalActionContext) {
//   // Recieve list of variants to update { variantId: string, quantity: number }[]
//   const mockVariants = [
//     { variantId: "47842041332002", price: 100 },
//     // { variantId: "1", price: 11 },
//     // { variantId: "1", price: 12 },
//   ];

//   const mockInventory = [
//     {
//       inventoryItemId: "51023922561314",
//       locationId: "93812556066",
//       quantity: 1001,
//     },
//   ];

//   const shopId = "84445790498";

//   // Start updates as background tasks with a auto limits
//   // https://docs.gadget.dev/reference/gadget-server#enqueue-action-input-options

//   for (const variant of mockVariants) {
//     /** ######################################################
//      *  Background Variant Price Update (Single)
//      *  ######################################################
//      */
//     await api.enqueue(
//       api.aaaUpdateVariantsPrice,
//       {
//         shopId,
//         variantId: variant.variantId,
//         price: variant.price,
//       },
//       {
//         id: "background-update-variants-price" + new Date().toISOString(),
//         //priority: "HIGH"
//       }
//     );
//   }

//   for (const inventory of mockInventory) {
//     // Start a background task to update the variant inventory
//     await api.enqueue(
//       api.aaaUpdateVariantsInventory,
//       {
//         shopId,
//         inventoryData: mockInventory,
//       },
//       {
//         id: "background-update-variants-inventory" + new Date().toISOString(),
//         //priority: "HIGH"
//       }
//     );
//   }
// }
