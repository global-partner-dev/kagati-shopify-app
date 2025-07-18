import { ActionOptions, ShopifyStorePriceSyncGlobalActionContext } from "gadget-server";
import { setTimeout } from 'timers/promises';

const RATE_LIMIT_DELAY = 3000; // 3 seconds delay

/**
 * Executes the Shopify store price sync action.
 * 
 * This function orchestrates the synchronization of Shopify store prices by fetching product variants, processing them in batches, 
 * and updating metafields for each variant. The operation is logged, and errors are handled and logged appropriately.
 * 
 * @async
 * @function run
 * @param {ShopifyStorePriceSyncGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during the execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform, specifically for finding and updating product variants.
 * @param {object} context.connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves when the action completes.
 * 
 * @throws {Error} If an error occurs during the process, it is caught, logged, and not rethrown.
 */
export async function run({ params, logger, api, connections }) {
    try {
        await processProductVariants(logger, api, connections);
        logger.info("Completed updating product variants.");
    } catch (error) {
        logger.error("Failed to process product variants:", error);
    }
};

/**
 * Fetches and processes all Shopify product variants.
 * 
 * This function retrieves all Shopify product variants in batches, processing them as needed. It continues to fetch and process 
 * the next batch until all product variants have been handled.
 * 
 * @async
 * @function processProductVariants
 * @param {object} logger - A logger object for recording informational and error messages during execution.
 * @param {object} api - An API object containing methods for interacting with the Gadget platform, specifically for finding product variants.
 * @param {object} connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves when all product variants have been processed.
 */
async function processProductVariants(logger, api, connections) {
    try {
        await api.productVariantPriceUpdateFileFinal(logger, api, connections)
        logger.info("Completed updating product variants.");
    } catch (error) {
        logger.error("Failed to process product variants:", error);
    }
      
//     let allProducts = [];
//     let findProducts = await api.shopifyProductVariant.findMany({
//         first: 250,
//         select: {
//             id: true,
//             sku: true
//         }
//     });
// logger.info({ findProducts: findProducts }, "findProducts------->")
//     while (true) {
//         allProducts.push(...findProducts);
//         if (!findProducts.hasNextPage) break;
//         findProducts = await findProducts.nextPage();
//     }
//   logger.info({ allProducts: allProducts }, "allProducts------->")

//     await processVariantsBatch(allProducts, logger, api, connections);
}

/**
 * Processes a batch of product variants.
 * 
 * This function iterates through the list of product variants, applying updates to the Shopify metafields. 
 * It includes rate limiting between API calls to prevent hitting Shopify's rate limits.
 * 
 * @async
 * @function processVariantsBatch
 * @param {Array} allProducts - An array of all product variants to be processed.
 * @param {object} logger - A logger object for recording informational and error messages during execution.
 * @param {object} api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} connections - An object containing connections to external services, particularly Shopify.
 * 
 * @returns {Promise<void>} A promise that resolves when the batch has been processed.
 */
async function processVariantsBatch(allProducts, logger, api, connections) {
    const shopify = connections.shopify.current;

    logger.info(shopify, "shopify");

    // await shopify?.metafield.update({
    //     key: "outletId",
    //     namespace: 'kaghati',
    //     owner_resource: "variant",
    //     owner_id: 8985019646242,
    //     type: "number",
    //     value: 55555,
    // });

    // The following code is commented out but would normally handle updating each product variant's metafields
    // await Promise.all(allProducts.map(async (product) => {
    //     try {
    //         await setTimeout(RATE_LIMIT_DELAY); // Add 3 seconds delay between each API call

    //         // Fetch stock information from ERP
    //         const findStock = await api.erpItem.findMany({
    //             select: { outletId: true },
    //             filter: {
    //                 itemId: { equals: product.sku }
    //             }
    //         });

    //         const transformedData = findStock.map(item => ({
    //             mrp: item.mrp,
    //             outletId: item.outletId
    //         }));

    //         const storeCodeData = findStock.map(item => item.outletId);

    //         // Update Shopify metafields
    //         await connections.shopify.current?.metafield.update({
    //             key: "outletId",
    //             namespace: 'kaghati',
    //             owner_resource: "variant",
    //             owner_id: product.id,
    //             type: "number",
    //             value: 123456,
    //         });

    //         await connections.shopify.current?.metafield.create({
    //             key: "storeCode",
    //             namespace: 'kaghati',
    //             owner_resource: "variant",
    //             owner_id: product.id,
    //             type: "json",
    //             value: JSON.stringify(storeCodeData),
    //         });

    //         const response = await connections.shopify.current?.metafield.create({
    //             key: "storePrices",
    //             namespace: 'kaghati',
    //             owner_resource: "variant",
    //             owner_id: product.id,
    //             type: "json",
    //             value: JSON.stringify(transformedData),
    //         });

    //         if (response) {
    //             logger.info("Meta Field Created!", response);
    //         } else {
    //             logger.error("No response received from metafield creation.");
    //         }
    //     } catch (error) {
    //         logger.error(`Error processing product variant ${product.id}:`, error);
    //     }
    // }));
}

/** 
 * Action options for the Shopify store price sync action.
 *
 * @constant
 * @type {ActionOptions}
 * @property {number} timeoutMS - The timeout duration for the action in milliseconds.
 * @property {boolean} transactional - Indicates whether the action is transactional.
 */
export const options = {
    timeoutMS: 900000,
    transactional: false
};