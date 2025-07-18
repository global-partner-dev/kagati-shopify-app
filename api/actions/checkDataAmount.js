import { CheckDataAmountGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the record count for the `shopifyProduct` model.
 * 
 * @param {CheckDataAmountGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<Object>} A promise that resolves with the total number of records found or an error message.
 */
export async function run({ params, logger, api, connections }) {
  const allRecords = [];
  try {
    // Initial fetch of the first 250 records from the Shopify product model
    let records = await api.shopifyProduct.findMany({
      first: 250,
      select: { id: true },
    });

    // Store the fetched records
    allRecords.push(...records);

    // Continue fetching the next pages of records until all pages are retrieved
    while (records.hasNextPage) {
      records = await records.nextPage();
      allRecords.push(...records);
    }

    // Log the total number of records found
    logger.info(`Total records in shopifyProduct: ${allRecords.length}`);

    // Return the total number of records
    return { totalRecords: allRecords.length };
  } catch (error) {
    // Log any errors encountered during the data fetching process
    logger.error(`Failed to fetch shopifyProduct records: ${error.message}`);
    
    // Return the error message in case of failure
    return { error: error.message };
  }
}