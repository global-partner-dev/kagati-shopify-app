import { ErpProductSyncGlobalActionContext } from "gadget-server";
//import { handleErpProductUpdate } from "../helper/handleErpProductUpdate";

// Configuration for TruePOS API requests
const baseUrl = process.env.TruePOS_URL;
const authToken = process.env.TruePOS_AuthToken;
const limit = 10000; // Maximum number of items to fetch per API request
const headers = {
  'Content-Type': 'application/json',
  'X-Auth-Token': authToken,
};

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
 * Fetches and processes items data from the TruePOS API.
 * 
 * @param {ErpProductSyncGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @param {number} page - The page number of data to fetch.
 * @param {number} outletId - The ID of the outlet for which data is being fetched.
 * @returns {Promise<void>}
 */
async function fetchAndProcessItemsData(context, outletId, outletTimestamp) {
  const { api, logger } = context;
  logger.info(`Processing data for outletId ${outletId}`);

  // Construct the URL based on the timestamp or outletId
  if (specialTimeStamp > 0) {
    logger.info(specialTimeStamp, "specialTimeStamp");
    url = `${baseUrl}/items?q=itemTimeStamp>=${specialTimeStamp},outletId==${outletId}&fields=itemId,itemName,mrp,outletId,stock,itemTimeStamp&limit=${limit}`
  } else {
    url = `${baseUrl}/items?q=outletId==${outletId}&fields=itemId,itemName,mrp,outletId,stock,itemTimeStamp&limit=${limit}`;
  }
  logger.info({ url: url }, "url-------->")
  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error('Failed to fetch items');

    const data = await response.json();
    totalPages = data.total_pages;
    logger.info(data, "data");
    logger.info(totalPages, "totalPages");
    logger.info(`Data fetched for outletId ${outletId}, total ${data.items.length}`);

    // Process items in chunks to limit memory usage
    const chunkSize = 250;
    logger.info({ length: data.items.length }, "length---------->")
    for (let i = 0; i < data.items.length; i += chunkSize) {
      const chunk = data.items.slice(i, i + chunkSize);
      await processItemsData(chunk, api, logger, outletId);
      logger.info({ i: i }, "i---------->")
    }
  } catch (error) {
    logger.error(`Error fetching or processing data for outletId ${outletId}: ${error.message}`);
    createNotification(api, "Error Processing Item Data", `Error for outletId ${outletId}: ${error.message}`, false);
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
        logger.error(`Error fetching existing records for outletId ${stockEntry.outletId}: ${error.message}`);
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
      logger.info(`Processed items for page ${page} and outletId ${outletId}: ${itemsToCreate.length} created, ${itemsToUpdate.length} updated`);
      createNotification(api, "Item Processing Success", `Completed item creation and update for page ${page} and outletId ${outletId}`, true);
    })
    .catch((error) => {
      logger.error(`An error occurred during item creation or update for outletId ${outletId}: ${error.message}`);
    });
}

const processingOutlets = new Set();
let isRunning = false;

/**
 * Main function to run the entire ERP product synchronization process.
 * 
 * @param {ErpProductSyncGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the synchronization process is completed.
 */
export async function run(context) {
  const { api, logger } = context;
  let allPagesProcessedSuccessfully = true;

  // Add execution ID for tracking
  const executionId = new Date().toISOString();
  let stores;

  // Prevent multiple concurrent runs
  if (isRunning) {
    logger.warn(`[${executionId}] Sync already in progress, skipping this execution`);
    return;
  }
  
  isRunning = true;

  try {
    stores = await fetchAllStores(api, logger);
  } catch (error) {
    logger.error(`[${executionId}] Failed to fetch stores: ${error.message}`);
    isRunning = false;
    return;
  }
  stores.sort((a, b) => Number(a.erpStoreId) - Number(b.erpStoreId));

  for (const store of stores) {
    const { erpStoreId: outletId } = store;
    
    // Check if this outlet is already being processed
    if (processingOutlets.has(outletId)) {
      logger.warn(`[${executionId}] Outlet ${outletId} is already being processed, skipping`);
      continue;
    }
    
    try {
      processingOutlets.add(outletId);
      logger.info(`[${executionId}] Processing outlet ${outletId}`);
      
      let outletTimestamp = 0;
      try {
        outletTimestamp = await fetchLatestTimestampForOutlet(api, Number(outletId));
      } catch (error) {
        logger.error(`[${executionId}] Failed to fetch latest timestamp for outletId ${outletId}: ${error.message}`);
        continue;
      }
      
      await fetchAndProcessItemsData(context, outletId, outletTimestamp);
    } catch (error) {
      logger.error(`[${executionId}] An error occurred processing data for outletId ${outletId}: ${error.message}`);
      break;
    } finally {
      processingOutlets.delete(outletId);
    }
  }
  return true
}

async function fetchAllStores(api, logger) {
  let response = await api.khagatiStores.findMany({
    select: {
      erpStoreId: true
    },
    filter: {
      status: {
        in: ["Active"]
      }
    }
  });

  let allStores = [...response];

  while (response.hasNextPage) {
    response = await response.nextPage();
    allStores.push(...response);
  }
  return allStores;
}

/**
 * Fetches the latest timestamp for a specific outlet from the local database.
 * 
 * @param {object} api - API object for interacting with various data sources.
 * @param {number} outletId - The outlet ID for which to fetch the latest timestamp.
 * @returns {Promise<number>} - The latest timestamp or 0 if no timestamp exists.
 */
async function fetchLatestTimestampForOutlet(api, outletId) {
  const erpExistingItems = await api.erpItem.findMany({
    filter: {
      outletId: { equals: outletId }
    },
    sort: { itemTimeStamp: "Descending" },
    limit: 1
  });

  if (erpExistingItems.length > 0 && erpExistingItems[0].itemTimeStamp) {
    return erpExistingItems[0].itemTimeStamp;
  }
  return 0; // Default to 0 if no timestamp exists
}

/**
 * Action options configuration.
 * 
 * @type {Object} 
 * @property {Object} triggers - Configuration for triggering the action.
 * @property {Array} triggers.scheduler - Array of cron expressions to schedule the action. This action runs every 15 minutes.
//  */
export const options = {
  triggers: {
    scheduler: [{ cron: "*/15 * * * *" }], // Trigger the function every 15 minutes
  },
  timeoutMS: 900000
};