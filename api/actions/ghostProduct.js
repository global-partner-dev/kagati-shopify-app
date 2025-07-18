import { GhostProductGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the ghost product creation and inventory management process.
 * 
 * @param {GhostProductGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the operation is completed.
 */
export async function run({ params, logger, api, connections }) {
  // Base URL and Auth token for TruePOS API
  const baseUrl = process.env.TruePOS_URL;
  const authToken = process.env.TruePOS_AuthToken;
  const limit = 500; // Limit for API requests
  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': authToken,
  };

  // List of outlet IDs to process
  const outletIds = [
    26311, 26314, 26867, 28450, 28451, 225, 311, 312, 314, 11526, 11527, 26220
  ];

  // Establish connection to Shopify
  const shopify = connections.shopify.current;

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
   * Creates a product in Shopify.
   * 
   * @param {Object} shopify - The Shopify connection object.
   * @param {string} productName - The name of the product to create.
   * @param {string} productType - The type of the product.
   * @param {string} vendor - The vendor of the product.
   * @returns {Promise<string>} The ID of the created product.
   */
  async function createShopifyProduct(shopify, productName, productType, vendor) {
    try {
      const data = await shopify.graphql(`mutation {
        productCreate(input: {title: "${productName}", productType: "${productType}", vendor: "${vendor}"}) {
          product {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`);

      if (data.productCreate.userErrors.length > 0) {
        throw new Error(data.productCreate.userErrors[0].message);
      }

      return data.productCreate.product.id;
    } catch (error) {
      console.error(`Failed to create Shopify product: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetches and processes item data from TruePOS for a specific page and outlet.
   * 
   * @param {GhostProductGlobalActionContext} context - The context object provided by the Gadget server.
   * @param {number} page - The page number of data to fetch.
   * @param {number} outletId - The ID of the outlet for which data is being fetched.
   * @returns {Promise<void>}
   */
  async function fetchAndProcessItemsData(context, page, outletId) {
    const { api, logger } = context;
    logger.info(`Processing page ${page} for outletId ${outletId}`);
    let url = `${baseUrl}/items?page=${page}&&q=outletId==${outletId}&&fields=itemId,itemName,mrp,outletId,stock&limit=${limit}`;
    try {
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) throw new Error('Failed to fetch items');

      const data = await response.json();
      logger.info(`Data fetched for page ${page} and outletId ${outletId}, total ${data.items.length}`);

      // Process items in chunks to reduce memory usage
      const chunkSize = 50;
      for (let i = 0; i < data.items.length; i += chunkSize) {
        const chunk = data.items.slice(i, i + chunkSize);
        await processItemsData(chunk, context, shopify, logger, page, outletId);
      }
    } catch (error) {
      logger.error(`Error fetching or processing data on page ${page} for outletId ${outletId}: ${error.message}`);
      createNotification(api, "Error Processing Item Data", `Error on page ${page} for outletId ${outletId}: ${error.message}`, false);
    }
  }

  /**
   * Processes the item data fetched from TruePOS and handles creation and update operations in both Shopify and the local ERP system.
   * 
   * @param {Array} data - Array of item data to process.
   * @param {GhostProductGlobalActionContext} context - The context object provided by the Gadget server.
   * @param {Object} shopify - The Shopify connection object.
   * @param {Object} logger - Logger object to log information and errors.
   * @param {number} page - The page number of data being processed.
   * @param {number} outletId - The ID of the outlet for which data is being processed.
   * @returns {Promise<void>}
   */
  async function processItemsData(data, context, shopify, logger, page, outletId) {
    const { api } = context;
    let itemsToCreate = [];
    let itemsToUpdate = [];
    let ghostItemsToCreate = [];

    for (let item of data) {
      let mrpMap = {}; // To track MRP across outlets

      // Process each stock entry to check for different MRPs
      for (let stockInfo of item.stock) {
        const mrp = Number(stockInfo.mrp);
        const outletId = Number(stockInfo.outletId);
        const stock = Number(stockInfo.stock);

        // Track MRP for each item
        if (!mrpMap[item.itemId]) {
          mrpMap[item.itemId] = new Set();
        }
        mrpMap[item.itemId].add(mrp);

        let processedItem = {
          itemId: item.itemId,
          itemName: item.itemName,
          mrp: mrp,
          outletId: outletId,
          stock: stock,
        };

        let existingRecords = [];

        try {
          existingRecords = await api.erpItem.findMany({
            filter: {
              AND: [
                { itemId: { equals: item.itemId } },
                { outletId: { equals: stockInfo.outletId } }
              ]
            }
          });
        } catch (error) {
          logger.error(`Error fetching existing records for outletId ${stockInfo.outletId}: ${error.message}`);
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

      // Create ghost products if different MRPs are found
      if (mrpMap[item.itemId] && mrpMap[item.itemId].size > 1) {
        for (let stockInfo of item.stock) {
          const mrp = Number(stockInfo.mrp);
          const outletId = Number(stockInfo.outletId);
          const stock = Number(stockInfo.stock);

          let ghostProductName = `${item.itemName} - Variant ${outletId}`;

          // Create a ghost product in Shopify
          try {
            const shopifyProductId = await createShopifyProduct(shopify, ghostProductName, 'YourProductType', 'YourVendor');

            // Add the ghost product to the local database
            ghostItemsToCreate.push({
              itemId: item.itemId,
              itemName: ghostProductName,
              mrp: mrp,
              outletId: outletId,
              stock: stock,
              shopifyProductId: shopifyProductId // storing the Shopify product ID
            });

          } catch (error) {
            logger.error(`Error creating Shopify product for ${ghostProductName}: ${error.message}`);
          }
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

    if (ghostItemsToCreate.length > 0) {
      operations.push(api.erpItem.bulkCreate(ghostItemsToCreate));
    }

    Promise.allSettled(operations)
      .then(() => {
        logger.info(`Processed items for page ${page} and outletId ${outletId}: ${itemsToCreate.length} created, ${itemsToUpdate.length} updated`);
        createNotification(api, "Item Processing Success", `Completed item creation and update for page ${page} and outletId ${outletId}.`, true);
      })
      .catch((error) => {
        logger.error(`An error occurred during item creation or update for outletId ${outletId}: ${error.message}`);
      });
  }

  // Process all pages and outletIds
  let allPagesProcessedSuccessfully = true;
  for (let outletId of outletIds) {
    for (let page = 1; page <= 10; page++) {  // Assuming 10 pages, adjust as necessary
      try {
        await fetchAndProcessItemsData({ api, logger, connections }, page, outletId);
      } catch (error) {
        allPagesProcessedSuccessfully = false;
        logger.error(`An error occurred processing page ${page} for outletId ${outletId}: ${error.message}`);
        break;
      }
    }
  }

  // Create a notification once all pages are processed
  if (allPagesProcessedSuccessfully) {
    createNotification(api, "Item Processing Complete", "All item data pages processed successfully for all outletIds.", true);
  }
}