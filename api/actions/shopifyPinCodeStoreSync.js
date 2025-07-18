import { ActionOptions, ShopifyPinCodeStoreSyncGlobalActionContext } from "gadget-server";

/**
 * Executes the Shopify pin code and store synchronization action.
 * 
 * This function retrieves pin code and store data from the Gadget API and uploads the compiled data to Shopify by creating 
 * metafields under the "pinCodeData" and "storeData" keys in the "kaghati" namespace. The function handles pagination for 
 * data retrieval, and logs the success or failure of each metafield creation operation.
 * 
 * @async
 * @function run
 * @param {ShopifyPinCodeStoreSyncGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves when the action completes.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  const shopify = connections.shopify.current;
  const syncType = params.syncType;
  let allPincodes = [];
  let allStores = [];

  // Fetch pin code records from the Gadget API
  let khagatiPinCodeRecords = await api.khagatiPinCode.findMany({
    select: {
      pinCode: true,
      storeCode: true,
      storeId: true
    },
    first: 250,
  });

  allPincodes.push(...khagatiPinCodeRecords);

  // Handle pagination for pin code records
  while (khagatiPinCodeRecords.hasNextPage) {
    khagatiPinCodeRecords = await khagatiPinCodeRecords.nextPage();
    allPincodes.push(...khagatiPinCodeRecords);
  }

  // Fetch store records from the Gadget API
  let khagatiStoreRecords = await api.khagatiStores.findMany({
    first: 250,
    select: {
      id: true,
      state: true,
      storeName: true,
      storeCode: true,
      storeTier: true,
      address: true,
      city: true,
      mobNumber: true,
      email: true,
      googleMap: true,
      isBackupWarehouse: true,
      selectBackupWarehouse: true,
      status: true,
      localDelivery: true,
      pinCode: true,
      erpStoreId: true,
      lat: true,
      lng: true,
      storeTier: true,
      storeCluster: true,
      radius: true,
    },
    filter: {
      status: { in: ["Active"] }
    }
  });

  allStores.push(...khagatiStoreRecords);

  // Handle pagination for store records
  while (khagatiStoreRecords.hasNextPage) {
    khagatiStoreRecords = await khagatiStoreRecords.nextPage();
    allStores.push(...khagatiStoreRecords);
  }

  try {
    // Create metafield in Shopify for pin code data
    if (syncType === "pinCode") {
      const khagatiPinCodeResponse = await shopify.metafield.create({
        key: 'pinCodeData',
        value: JSON.stringify(allPincodes),
        type: 'json',
        namespace: 'kaghati',
        owner_resource: 'shop',
      });

      if (khagatiPinCodeResponse) {
        logger.info("Pin Code Meta Field Created!");
      } else {
        logger.info("Something went wrong!");
      }
    }
    // Create metafield in Shopify for store data
    if (syncType === "store") {
      const khagatiStoreResponse = await shopify.metafield.create({
        key: 'storeData',
        value: JSON.stringify(allStores),
        type: 'json',
        namespace: 'kaghati',
        owner_resource: 'shop',
      });

      if (khagatiStoreResponse) {
        logger.info("Store Meta Field Created!");
      } else {
        logger.info("Something went wrong!");
      }
    }
    // Log the result of the metafield creation
    
  } catch (error) {
    logger.error("Error creating metafields:", error);
    return {
      success: false,
      message: "Something went wrong!"
    }
  } finally {
    return {
      success: true,
      message: `${syncType} sync successfully`
    }
  }
};

/**
 * Parameters required for updating the "on hold" status of a split order.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} syncType - The type of sync to be performed.
 */
export const params = {
  syncType: {
    type: "string",
  },
};