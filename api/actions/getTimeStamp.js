import { GetTimeStampGlobalActionContext } from "gadget-server";
import { subHours } from "date-fns";

/**
 * Formats the date and time as a string in the format YYYYMMDDHHMMSS in IST.
 * 
 * @param {Date} date - The date object to be formatted.
 * @returns {string} The formatted timestamp string.
 */
const getFormattedTimestampInIST = (date) => {
  // Convert the date to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const istDate = new Date(date.getTime() + istOffset);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(istDate.getDate()).padStart(2, '0');
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const seconds = String(istDate.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Main function to execute the MRP and stock data fetching based on the timestamp.
 * 
 * @param {GetTimeStampGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the operation is completed.
 */
export async function run({ params, logger, api, connections }) {
  // Get the current date and time
  const now = new Date();

  // Subtract one hour from the current date and time
  const oneHourAgo = subHours(now, 1);
  const storeCode = 314; // Store code for filtering
  const sku = 121; // SKU for filtering

  // Get the formatted timestamp in IST
  const formattedTimestampInIST = getFormattedTimestampInIST(oneHourAgo);
  logger.info(formattedTimestampInIST, "Formatted Timestamp in IST");

  // Fetch MRP and stock data filtered by the store code, SKU, and timestamp
  const findMrpStock = await api.erpItem.findMany({
    select: {
      id: true,
      mrp: true,
      stock: true,
      itemTimeStamp: true,
    },
    filter: {
      outletId: { equals: Number(storeCode) },
      itemId: { equals: Number(sku) },
      itemTimeStamp: { greaterThan: formattedTimestampInIST },
    },
  });

  // Log the fetched MRP and stock data
  logger.info(`Fetched MRP and stock data: ${JSON.stringify(findMrpStock)}`);

  // Additional logic if needed
}