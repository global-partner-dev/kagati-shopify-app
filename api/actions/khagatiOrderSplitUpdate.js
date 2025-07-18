import { khagatiOrderSplitUpdateGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the product creation in Shopify.
 * 
 * @param {khagatiOrderSplitUpdateGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as scope, logger, params, and connections.
 * @returns {Promise<void>} A promise that resolves when the product creation process is completed.
 */
export async function run({ scope, logger, api, params, connections }) {
  try {
    // Log the parameters received for product creation
    logger.info(params, "Order update params");
    await connections.shopify.setCurrentShop("59823030316");
      let shopify = connections.shopify.current;
      if (!shopify) {
          logger.info({shopify: shopify}, "Shopify connection is not available.");
          shopify = await connections.shopify.setCurrentShop("59823030316");
      } 
      const khagatiOrderSplitId = await api.khagatiOrderSplit.findMany({
        select: {
          id: true,
          orderStatus:true
        },
        filter: {
          orderReferenceId: { equals: params.id }
        }
      });
      if (!khagatiOrderSplitId) {
        throw new Error(`Shopify order not found for ID: ${khagatiOrderSplitId}`);
      }
      
      const orderData = await api.shopifyOrder.findFirst({  
        select: {
          financialStatus: true
        },
        filter: {
          id: { equals: params.id }
        }
      });

      if(orderData?.financialStatus == 'paid' && khagatiOrderSplitId[0]?.orderStatus == "on_hold"){
         const splitId= khagatiOrderSplitId[0].id
          await api.khagatiOrderSplit.update(splitId,{
            orderStatus:'new',
            onHoldStatus:'closed'
          });
         logger.info("Updated edit order in Shopify");
      }
      
    // Create the product in Shopify using the provided request data
    

    // Log the response from Shopify
    // logger.info({ responseProductData }, "Update split order data");

    // scope.result = responseProductData;
  } catch (error) {
    
    logger.error({ error }, "Error update split order data ");
    throw new Error(`Failed to  update split order data : ${error.message}`);
  }
}

/**
 * Parameters for the order data .
 * 
 * @type {Object}
 * @property {string} requestData - The JSON string containing the order data 
 */
export const params = {
  id: {
    type: "string"
  },
};