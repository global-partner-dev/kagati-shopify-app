import { ErpProductSyncFullGlobalActionContext } from "gadget-server";
//import { handleErpProductUpdate } from "../helper/handleErpProductUpdate";

// Configuration for TruePOS API requests
const baseUrl = process.env.TruePOS_URL;
const authToken = process.env.TruePOS_AuthToken;
const limit = 10000; // Maximum number of items to fetch per API request
const headers = {
  'Content-Type': 'application/json',
  'X-Auth-Token': authToken,
};

// List of outlet IDs to process
const outletIds = [
  26311, 26314, 26867, 28450, 28451, 225, 311, 312, 314, 11526, 11527, 56963, 56965, 57636, 57637
];

let specialTimeStamp = 0; // Timestamp to fetch only recently updated items
let totalPages = 1; // Total pages of data to process from the API
let url; // URL for API request

/**
 * Creates a notification in the local system.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with external services.
 * @param {string} title - The title of the notification.
 * @param {string} markdownDetails - The details of the notification in markdown format.
 * @param {boolean} isSuccess - Boolean indicating if the notification is for a success or failure event.
 * @returns {Promise<void>}
 */
async function createNotification(api, title, markdownDetails, isSuccess) {
  try {
    await api.khagatiNotificationLog.create({
      notificationInfo: title,
      notificationDetails: {
        markdown: markdownDetails,
      },
      notificationViewStatus: false,
      logType: isSuccess ? 'info' : 'error',
    });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
}

/**
 * Fetches the latest timestamp from the local ERP system database to identify recently updated items.
 * 
 * @param {Object} api - The API object provided by the Gadget server to interact with the local ERP system.
 * @returns {Promise<number>} The latest timestamp or 0 if no timestamp is found.
 */
async function fetchLatestTimestamp(api) {
  const erpExistingItems = await api.erpItem.findMany({
    sort: { itemTimeStamp: "Descending" },
    limit: 1
  });

  if (erpExistingItems.length > 0 && erpExistingItems[0].itemTimeStamp) {
    return erpExistingItems[0].itemTimeStamp - 1;
  }
  return 0; // Default to 0 if no timestamp exists
}

/**
 * Fetches and processes items data from the TruePOS API.
 * 
 * @param {ErpProductSyncGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @param {number} page - The page number of data to fetch.
 * @param {number} outletId - The ID of the outlet for which data is being fetched.
 * @returns {Promise<void>}
 */
async function fetchAndProcessItemsData(context, page, outletId) {
  const { api, logger } = context;
  logger.info(`Processing page ${page} for outletId ${outletId}`);

  // Construct the URL based on the timestamp or outletId
  if (specialTimeStamp > 0) {
    logger.info(specialTimeStamp, "specialTimeStamp");
    url = `${baseUrl}/items?page=${page}&q=itemTimeStamp>>${specialTimeStamp}&fields=itemId,itemName,mrp,outletId,stock,itemTimeStamp&limit=${limit}`;
  } else {
    url = `${baseUrl}/items?page=${page}&q=outletId==${outletId}&fields=itemId,itemName,mrp,outletId,stock,itemTimeStamp&limit=${limit}`;
  }
logger.info({url: url}, "url=============>")
  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error('Full Sync Failed to fetch items');

    const data = await response.json();
    totalPages = data.total_pages;
    logger.info(data, "data");
    logger.info(totalPages, "totalPages");
    logger.info(`Data fetched for page ${page} and outletId ${outletId}, total ${data.items.length}`);

    // Process items in chunks to limit memory usage
    const chunkSize = 250;
      logger.info({length: data.items.length}, "length---------->")
    for (let i = 0; i < data.items.length; i += chunkSize) {
      const chunk = data.items.slice(i, i + chunkSize);
      await processItemsData(chunk, api, logger, page, outletId);
      logger.info({i: i}, "i---------->")
    }
  } catch (error) {
    logger.error(`Full Sync Error fetching or processing data on page ${page} for outletId ${outletId}: ${error.message}`);
    createNotification(api, "Full Sync Error Processing Item Data", `Error on page ${page} for outletId ${outletId}: ${error.message}`, false);
  }
}

/**
 * Processes item data, determining whether to create new records or update existing ones in the ERP system.
 * 
 * @param {Array} data - The array of item data to process.
 * @param {Object} api - The API object provided by the Gadget server to interact with the local ERP system.
 * @param {Object} logger - Logger object to log information and errors.
 * @param {number} page - The page number of data being processed.
 * @param {number} outletId - The ID of the outlet for which data is being processed.
 * @returns {Promise<void>}
 */
async function processItemsData(data, api, logger, page, outletId) {
  let itemsToCreate = [];
  let itemsToUpdate = [];

  for (let item of data) {
    for (let stockEntry of item.stock) {
      // Process each stock entry individually
      let processedItem = {
        itemId: item.itemId,
        itemName: item.itemName,
        mrp: Number(stockEntry.mrp),
        outletId: Number(stockEntry.outletId),
        stock: Number(stockEntry.stock),
        itemTimeStamp: String(stockEntry.itemTimeStamp),
      };

      let existingRecords = [];

      try {
        existingRecords = await api.erpItem.findMany({
          filter: {
            AND: [
              { itemId: { equals: item.itemId } },
              { outletId: { equals: stockEntry.outletId } }
            ]
          }
        });
      } catch (error) {
        logger.error(`Full Sync Error fetching existing records for outletId ${stockEntry.outletId}: ${error.message}`);
      }

      if (existingRecords && existingRecords.length > 0) {
        existingRecords.forEach(existingRecord => {
          itemsToUpdate.push({
            id: existingRecord.id,
            ...processedItem
          });
        });
      } else {
        itemsToCreate.push(processedItem);
      }
    }
  }

  const operations = [];

  if (itemsToCreate.length > 0) {
    operations.push(api.erpItem.bulkCreate(itemsToCreate));
  }

  if (itemsToUpdate.length > 0) {
    operations.push(api.erpItem.bulkUpdate(itemsToUpdate));
  }

  await Promise.allSettled(operations)
    .then(() => {
      logger.info(`Full Sync Processed items for page ${page} and outletId ${outletId}: ${itemsToCreate.length} created, ${itemsToUpdate.length} updated`);
      createNotification(api, "Full Sync Item Processing Success", `Completed item creation and update for page ${page} and outletId ${outletId}`, true);
    })
    .catch((error) => {
      logger.error(`Full Sync An error occurred during item creation or update for outletId ${outletId}: ${error.message}`);
    });
}

/**
 * Main function to run the entire ERP product synchronization process.
 * 
 * @param {ErpProductSyncGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the synchronization process is completed.
 */
export async function run(context) {
  const { api, logger } = context;
  let allPagesProcessedSuccessfully = true;

  try {
    specialTimeStamp = await fetchLatestTimestamp(api);
  } catch (error) {
    logger.error(`Failed to fetch latest timestamp: ${error.message}`);
    allPagesProcessedSuccessfully = false;
  }

  // for (let outletId of outletIds) {
    for (let page = 1; page <= totalPages; page++) {
      try {
        await fetchAndProcessItemsData(context, page, "225");
      } catch (error) {
        allPagesProcessedSuccessfully = false;
        logger.error(`Full Sync An error occurred processing page ${page} for outletId ${outletId}: ${error.message}`);
        break;
      }
    }
  // }
logger.info({totalPages: totalPages}, "totalPages------>>")
  if (allPagesProcessedSuccessfully) {
    createNotification(api, "Full Sync Item Processing Complete", "All item data pages processed successfully for all outletIds.", true);
  }
  return {result: allPagesProcessedSuccessfully}
}

export const options = { timeoutMS: 900000, triggers: {} };