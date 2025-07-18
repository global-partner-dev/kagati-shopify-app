import { ErpDataSyncFullGlobalActionContext } from "gadget-server";
import { subHours, subMinutes } from "date-fns";

const baseUrl = process.env.TruePOS_URL;
const authToken = process.env.TruePOS_AuthToken;
const limit = 500; // Maximum number of records to fetch per API request
const headers = {
  'Content-Type': 'application/json',
  'X-Auth-Token': authToken,
};

let totalPages = 1; // Total number of pages to process
let url; // URL for API requests

const formatDateToCustomString = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
/**
 * Creates a notification in the local system to log the success or failure of data processing.
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
      notificationDetails: { markdown: markdownDetails },
      notificationViewStatus: false,
      logType: isSuccess ? 'info' : 'error',
    });
  } catch (error) {
    console.error(`Failed to create notification: ${error.message}`);
  }
}

/**
 * Fetches and processes stock data from the TruePOS API for a specific page.
 * 
 * @param {Object} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @param {number} page - The page number of data to fetch from the TruePOS API.
 * @returns {Promise<void>} A promise that resolves when the stock data for the specified page is fetched and processed.
 */
async function fetchAndProcessStockData(context, page) {
  const { api, logger } = context;
  logger.info(`Processing page ${page}`, "page");

  // Retrieve the latest timestamp from the ERP system to fetch only recent data
  const now = new Date();
  const oneHourAgo = subMinutes(now, 15);
  const formattedTimestamp = formatDateToCustomString(oneHourAgo);

  if (formattedTimestamp) {
    const specialTimeStamp = formattedTimestamp;
    logger.info(`Using special timestamp: ${specialTimeStamp}`, "specialTimeStamp");
    url = `${baseUrl}/stock?q=timeStamp>>${specialTimeStamp}&limit=${limit}&selectAll=true&page=${page}&fields=itemReferenceCode,itemName,bufferStock,outletId,stock,timestamp`;
  } else {
    url = `${baseUrl}/stock?limit=${limit}&selectAll=true&page=${page}`;
  }

  logger.info(`Fetching data from URL: ${url}`, "sync full url");

  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error('sync full Failed to fetch data');

    const data = await response.json();
    totalPages = data.total_pages;
    logger.info(`Sync full Data fetched for page ${page}: ${JSON.stringify(data).substring(0, 100)}`);

    if (data.stock.length > 0) {
      await processStockData(data, api, logger, page);
    } else {
      logger.info("No data found");
      createNotification(api, "Sync full No Data Synced", "No data found for the latest ERP sync.", true);
      return;
    }
  } catch (error) {
    logger.error(`Sync full Error fetching or processing data on page ${page}: ${error.message}`);
    createNotification(api, "Sync full Error Processing Stock Data", `Error on page ${page}: ${error.message}`, false);
    throw error; // Rethrow the error to stop further processing
  }
}

/**
 * Processes stock data and creates or updates records in the local ERP system.
 * 
 * @param {Object} data - The stock data fetched from the TruePOS API.
 * @param {Object} api - The API object provided by the Gadget server to interact with the local ERP system.
 * @param {Object} logger - Logger object to log information and errors.
 * @param {number} page - The current page number being processed.
 * @returns {Promise<void>} A promise that resolves when the stock data is processed and records are created or updated.
 */
async function processStockData(data, api, logger, page) {
  const stocksToCreate = [];
  const stocksToUpdate = [];

  for (const item of data.stock) {
    let processedItem = {
      itemReferenceCode: item.itemReferenceCode,
      variantName: item.itemName,
      outletId: item.outletId,
      stock: Number(item.stock),
      bufferStock: item.bufferStock,
      itemTimeStamp: item.timestamp
    };

    const existingRecords = await api.erpStock.findMany({
      filter: {
        AND: [
          { variantName: { equals: item.itemName } },
          { outletId: { equals: item.outletId } }
        ]
      }
    });

    if (existingRecords.length > 0) {
      existingRecords.forEach(existingRecord => {
        stocksToUpdate.push({
          id: existingRecord.id,
          ...processedItem
        });
      });
    } else {
      stocksToCreate.push(processedItem);
    }
  }

  const operations = [];

  if (stocksToCreate.length > 0) {
    operations.push(api.erpStock.bulkCreate(stocksToCreate));
  }

  if (stocksToUpdate.length > 0) {
    operations.push(api.erpStock.bulkUpdate(stocksToUpdate));
  }

  await Promise.all(operations);

  logger.info(`Sync full Completed stock creation and update for page ${page}`);
  createNotification(api, "Sync full Stock Processing Success", `Stock data processed successfully for page ${page}.`, true);
}

/**
 * Main function to run the stock data synchronization process.
 * 
 * @param {Object} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the entire synchronization process is completed.
 */
export async function run(context) {
  const { api, logger } = context;
  let allPagesProcessedSuccessfully = true;

  for (let page = 1; page <= totalPages; page++) {
    try {
      await fetchAndProcessStockData(context, page);
    } catch (error) {
      allPagesProcessedSuccessfully = false;
      logger.error(`Sync full An error occurred processing page ${page}: ${error.message}`);
      break; // Exit the loop on first error
    }
  }

  if (allPagesProcessedSuccessfully) {
    createNotification(api, "Sync full Stock Processing Complete", "All stock data pages processed successfully.", true);
  }

  return {result: allPagesProcessedSuccessfully};
}

export const options = { timeoutMS: 900000, triggers: {} };