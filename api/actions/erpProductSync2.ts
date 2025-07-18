// import { ErpProductSyncGlobalActionContext } from "gadget-server";
// import { handleErpProductUpdate } from "../helper/handleErpProductUpdate";

// const baseUrl = process.env.TruePOS_URL;
// const authToken = process.env.TruePOS_AuthToken;
// const limit = 500; // Assuming a similar limit for API requests
// const headers = {
//   "Content-Type": "application/json",
//   "X-Auth-Token": authToken,
// };

// // List of outletIds
// const outletIds = [
//   26311, 26314, 26867, 28450, 28451, 225, 311, 312, 314, 11526, 11527, 56963,
//   56965, 57636, 57637,
// ];

// let specialTimeStamp = 0;
// let totalPages = 1;
// let itemsToUpdate = [];

// // A simplified function to create notifications
// async function createNotification(api, title, markdownDetails, isSuccess) {
//   try {
//     await api.khagatiNotificationLog.create({
//       notificationInfo: title,
//       notificationDetails: {
//         markdown: markdownDetails,
//       },
//       notificationViewStatus: false,
//       logType: isSuccess ? "info" : "error",
//     });
//   } catch (error) {
//     console.error("Failed to create notification:", error.message);
//   }
// }

// // Fetch the latest timestamp from the local database
// async function fetchLatestTimestamp(api) {
//   const erpExistingItems = await api.erpItem.findMany({
//     sort: { itemTimeStamp: "Descending" },
//     limit: 1,
//   });

//   if (erpExistingItems.length > 0 && erpExistingItems[0].itemTimeStamp) {
//     return erpExistingItems[0].itemTimeStamp;
//   }
//   return 0; // Default to 0 if no timestamp exists
// }

// // Fetch and process items data from the external API
// async function fetchAndProcessItemsData(context, page, outletId) {
//   const { api, logger } = context;
//   logger.info(`Processing page ${page} for outletId ${outletId}`);

//   let url = `${baseUrl}/items?page=${page}&q=outletId==${outletId}&fields=itemId,itemName,mrp,outletId,stock,itemTimeStamp&limit=${limit}`;

//   logger.info("before specialTimeStamp");

//   if (specialTimeStamp > 0) {
//     logger.info(specialTimeStamp, "specialTimeStamp");
//     url = `${baseUrl}/items?page=${page}&q=itemTimeStamp>>${specialTimeStamp}&fields=itemId,itemName,mrp,outletId,stock,itemTimeStamp`;
//   }

//   try {
//     const response = await fetch(url, { method: "GET", headers });
//     if (!response.ok) throw new Error("Failed to fetch items");

//     const data = await response.json();
//     totalPages = data.total_pages;
//     logger.info(
//       `Data fetched for page ${page} and outletId ${outletId} total ${data.items.length}`
//     );

//     // Process only a chunk of items at a time
//     const chunkSize = 150; // Reduce chunk size to limit memory usage
//     for (let i = 0; i < data.items.length; i += chunkSize) {
//       const chunk = data.items.slice(i, i + chunkSize);
//       await processItemsData(chunk, api, logger, page, outletId);
//     }
//   } catch (error) {
//     logger.error(
//       `Error fetching or processing data on page ${page} for outletId ${outletId}: ${error.message}`
//     );
//     createNotification(
//       api,
//       "Error Processing Item Data",
//       `Error on page ${page} for outletId ${outletId}: ${error.message}`,
//       false
//     );
//   }
// }

// // Process items data, determining whether to create or update records
// async function processItemsData(data, api, logger, page, outletId) {
//   let itemsToCreate = [];

//   for (let item of data) {
//     for (let stockInfo of item.stock) {
//       let processedItem = {
//         itemId: item.itemId,
//         itemName: item.itemName,
//         mrp: Number(stockInfo.mrp),
//         outletId: Number(stockInfo.outletId),
//         stock: Number(stockInfo.stock),
//         itemTimeStamp: item.itemTimeStamp, // Use current timestamp if null or undefined
//       };

//       let existingRecords = [];

//       try {
//         existingRecords = await api.erpItem.findMany({
//           filter: {
//             AND: [
//               { itemId: { equals: item.itemId } },
//               { outletId: { equals: stockInfo.outletId } },
//             ],
//           },
//         });
//       } catch (error) {
//         logger.error(
//           `Error fetching existing records for outletId ${stockInfo.outletId}: ${error.message}`
//         );
//       }

//       if (existingRecords && existingRecords.length > 0) {
//         existingRecords.forEach((existingRecord) => {
//           itemsToUpdate.push({
//             id: existingRecord.id,
//             ...processedItem,
//           });
//         });
//       } else {
//         itemsToCreate.push(processedItem);
//       }
//     }
//   }

//   const operations = [];

//   if (itemsToCreate.length > 0) {
//     operations.push(api.erpItem.bulkCreate(itemsToCreate));
//   }

//   if (itemsToUpdate.length > 0) {
//     operations.push(api.erpItem.bulkUpdate(itemsToUpdate));
//   }

//   await Promise.allSettled(operations)
//     .then(() => {
//       logger.info(
//         `Processed items for page ${page} and outletId ${outletId}: ${itemsToCreate.length} created, ${itemsToUpdate.length} updated`
//       );
//       createNotification(
//         api,
//         "Item Processing Success",
//         `Completed item creation and update for page ${page} and outletId ${outletId}`,
//         true
//       );
//     })
//     .catch((error) => {
//       logger.error(
//         `An error occurred during item creation or update for outletId ${outletId}: ${error.message}`
//       );
//     });
// }

// // Main function to run the entire process
// export async function run(context: ErpProductSyncGlobalActionContext) {
//   const { api, logger } = context;
//   let allPagesProcessedSuccessfully = true;

//   try {
//     specialTimeStamp = await fetchLatestTimestamp(api);
//   } catch (error) {
//     logger.error(`Failed to fetch latest timestamp: ${error.message}`);
//     allPagesProcessedSuccessfully = false;
//   }

//   for (let outletId of outletIds) {
//     for (let page = 1; page <= totalPages; page++) {
//       // Adjust totalPages as necessary
//       try {
//         await fetchAndProcessItemsData(context, page, outletId);
//       } catch (error) {
//         allPagesProcessedSuccessfully = false;
//         logger.error(
//           `An error occurred processing page ${page} for outletId ${outletId}: ${error.message}`
//         );
//         break;
//       }
//     }
//   }

//   if (allPagesProcessedSuccessfully) {
//     createNotification(
//       api,
//       "Item Processing Complete",
//       "All item data pages processed successfully for all outletIds.",
//       true
//     );
//   }
// }

// // export const options = {
// //   triggers: {
// //     scheduler: [{ cron: "*/15 * * * *" }], // Trigger the function every 15 minutes
// //   },
// // };

// export async function onSuccess(context: ErpProductSyncGlobalActionContext) {
//   const { logger } = context;

//   logger.info("post successfully created!");

//   await handleErpProductUpdate(context, itemsToUpdate);
// }
