
/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  try {
    
    const pageSize = 250; // Number of items per batch
    let allRecords = [];
    let records = await api.khagatiOrderInfo.findMany({
      first: pageSize
    });

    logger.info(`Initial fetch of product variants: ${records.length} items.`);
    allRecords.push(...records);

    while (records.hasNextPage) {
      logger.info("Fetching next page of product variants");
      records = await records.nextPage();
      logger.info(`Fetched next page of product variants: ${records.length} items.`);
      allRecords.push(...records);
    }

    logger.info(`Total product variants fetched: ${allRecords.length} items.`);

    if (allRecords.length === 0) {
      logger.info('No data to process. Exiting.');
      return;
    }

    const data = allRecords.map(({ __typename, id, ...rest }) => rest);
    // Send all data to the production route in one batch
    await sendDataToProduction(data, logger);


    logger.info('Data migration completed successfully.');
  } catch (error) {
    logger.error('Migration failed:', error.message);
  }
};

async function sendDataToProduction(allRecords, logger) {
  fetch('https://kaghati-shopify-v4.gadget.app/production/my-receive-route', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: allRecords, modelName: "khagatiOrderInfo" }),
  })
  .then(response => response.json())
  .then(allRecords => logger.log(allRecords))
  .catch(error => logger.error('Error:', error));
  
}

// export const options = {
//   triggers: {
//     scheduler: [{ every: "minute" }],
//   },
// }
