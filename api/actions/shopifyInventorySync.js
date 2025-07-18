// import { ActionOptions, ShopifyInventorySyncGlobalActionContext } from "gadget-server";

// /**
//  * Executes the Shopify inventory synchronization action.
//  * 
//  * This function retrieves inventory data from the Gadget API, processes the data, and updates Shopify metafields with the 
//  * inventory and out-of-stock (OOS) information. The action logs the result of each step, and includes commented-out code 
//  * for potential enhancements, such as bulk operations and JSONL uploads to Shopify.
//  * 
//  * @async
//  * @function run
//  * @param {ShopifyInventorySyncGlobalActionContext} context - The context object provided by Gadget Server.
//  * @param {object} context.logger - A logger object for recording informational and error messages during execution.
//  * @param {object} context.params - Parameters provided to the global action.
//  * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
//  * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
//  * 
//  * @returns {Promise<void>} A promise that resolves when the action completes.
//  * 
//  * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
//  */
// export async function run ({ logger, api }) {
//   const results = {
//     erpDataSync: false,
//     erpProductSync: false,
//     productVariantUpdate: false,
//     productVariantPriceUpdate: false,
//   };

//   try {
//     const erpDataSyncResponse = await api.erpDataSyncFull();
//     results.erpDataSync = erpDataSyncResponse.result;

//     if (results.erpDataSync) {
//       const erpProductSyncResponse = await api.erpProductSyncFull();
//       results.erpProductSync = erpProductSyncResponse.result;

//       if (results.erpProductSync) {
//         const productVariantUpdateResponse = await api.productVariantUpdateFileFinalFull();
//         results.productVariantUpdate = productVariantUpdateResponse.result;

//         if (results.productVariantUpdate) {
//           const productVariantPriceUpdateResponse = await api.productVariantPriceUpdateFileFinalFull();
//           results.productVariantPriceUpdate = productVariantPriceUpdateResponse.result;
//         }
//       }
//     }
//   } catch (error) {
//     logger.error(`An error occurred during the synchronization process: ${error.message}`);
//   }

//   return results;
// }

// /**
//  * @type {ActionOptions}
//  */

// export const options = {
//   // 10 minutes (600,000 milliseconds) for a really long action
//   timeoutMS: 900000,
// };