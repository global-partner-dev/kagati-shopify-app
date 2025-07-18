import { UpdateOrderGlobalActionContext } from "gadget-server";

/**
 * This function updates an order in Shopify based on the provided `orderId` and `requestData`.
 * It logs the parameters received, performs the update operation using the Gadget API, 
 * and logs the result. In case of an error, it logs the error and throws an exception.
 *
 * @function run
 * @param {UpdateOrderGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.scope - An object that can be used to pass data between the global action and the Gadget platform.
 * @param {object} context.logger - A logging object for logging informational and error messages.
 * @param {object} context.params - Parameters passed to the global action, including `orderId` and `requestData`.
 * @param {string} context.params.orderId - The ID of the order to be updated.
 * @param {string} context.params.requestData - The data to be used for updating the order, passed as a JSON string.
 * @param {string} context.params.removeItems - The ID of the order to be updated.
 * @param {string} context.params.originalOrderId - The data to be used for updating the order, passed as a JSON string.
 * @param {string} context.params.addedItems - The data to be used for updating the order, passed as a JSON string.
* @param {string} context.params.requestCustomData - The data to be used for updating the order, passed as a JSON string.

 * @param {object} context.api - An object containing API methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, such as Shopify.
 *
 * @returns {Promise<void>} - This function does not return a value, but updates the `scope.result` with the updated order data.
 *
 * @throws {Error} If the order update fails, an error is logged and thrown.
 */
export async function run({ scope, logger, params, api, connections }) {
    try {
        const shopifyShopData = await api.shopifyShop.findMany({});
        const shopifyShopId = shopifyShopData[0].id;
        let  calculatedOrderId="";
        let  editOrderId="";
        let removeStatus=false;
        let addItemStatus=false;
        let updateItemStatus=false;
        const shopify = await connections.shopify.forShopId(shopifyShopId);
        logger.info({ params }, "Edit order data for the update");
        const removeItems=JSON.parse(params.removeItems);
        const addedItems=JSON.parse(params.addedItems);
        // const updatedItems=JSON.parse(params.updatedItems);
        const customData = JSON.parse(params.requestCustomData);
        const storeDetails=customData.selectedStore;
        const customerInvoice=customData.customerInvoice;
        const requestData=JSON.parse(params.requestData);
        const orderNumber=customData.orderNumber;
        logger.info({ addedItems }, "added items for the new order");
        // logger.info(params.splitId, "split id data");
        logger.info(params.orderId, "order id data");
        const kaghatiOrderData = await api.khagatiOrder.findOne(params.orderId);
        const findNoteAttributeValue = (attributes, attributeName) => {
          const attribute = attributes.find(attr => attr.name === attributeName);
          return attribute ? attribute.value : null;
        };

        const updatedItems = requestData?.lineItems ? requestData.lineItems.filter(item => {
          // Find matching item in original order
          const originalItem = kaghatiOrderData?.lineItems?.find(original => original.id === item.id);
            
          // Include item if quantity changed from original order
          if (originalItem && originalItem.currentQuantity !== item.quantity) {
            return true;
          }
          return false;
        }) : [];
        logger.info({updatedItems: updatedItems},"updatedItems")

        // Log the incoming request data
       // logger.info(JSON.parse(params.requestData), "Update order params");
        // Update the order using Gadget API
       //const responseOrderData = await api.khagatiOrder.update(params.orderId, JSON.parse(params.requestData));
        // Log the updated order data
       //logger.info({ responseOrderData }, "Updated new order in Shopify");
       // scope.result = responseOrderData;
       try{
        if(removeItems && typeof removeItems === "object" && Object.keys(removeItems).length > 0 || addedItems && typeof addedItems === "object" && Object.keys(addedItems).length > 0 || updatedItems && typeof updatedItems === "object" && Object.keys(updatedItems).length > 0){
              editOrderId = await shopify.graphql(`mutation beginEdit{
                orderEditBegin(id: "gid://shopify/Order/${params.originalOrderId}"){
                    calculatedOrder{
                    id
                    }
                }
            }`);
        }       
        if (editOrderId?.orderEditBegin?.calculatedOrder?.id && editOrderId.orderEditBegin.calculatedOrder.id !== null) {
          const calculatedOrderId = editOrderId.orderEditBegin.calculatedOrder.id;
          
          const orderEditSetQuantity = `mutation removeLineItem($id: ID!, $lineItemId: ID!, $quantity: Int!,$restock: Boolean!) {
            orderEditSetQuantity(id: $id, lineItemId: $lineItemId, quantity: $quantity,restock:$restock) {
              calculatedOrder {
                id
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      quantity
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }`;
          // Function to remove items from the order
          const removeItemsFromOrder = async (itemsToRemove) => {
        
            for (const item of itemsToRemove) {
              try {
                const response = await shopify.graphql(orderEditSetQuantity, {
                  id: item.id,
                  lineItemId: item.lineItemId,
                  quantity: item.quantity,
                  restock:true
                });
                logger.info({ response }, "Successfully removed item");
              } catch (error) {
                logger.error({ error }, "Error removing item");
              }
            }
          };

          const updateItemsToOrder = async (itemsToUpdate) => {
            for (const item of itemsToUpdate) {
              try {
                const response = await shopify.graphql(orderEditSetQuantity, {
                  id: item.id,
                  lineItemId: item.lineItemId,
                  quantity: item.quantity,
                  restock:true
                });
                logger.info({ response }, "Successfully updated item");
              } catch (error) {
                logger.error({ error }, "Error updating item");
              }
            }
          };
        
          // Function to add items to the order
          const addItemsToOrder = async (itemsToAdd) => {
            const mutation = `
              mutation addVariantToOrder($id: ID!, $variantId: ID!, $quantity: Int!) {
                orderEditAddVariant(id: $id, variantId: $variantId, quantity: $quantity) {
                  calculatedOrder {
                    id
                    addedLineItems(first: 10) {
                      edges {
                        node {
                          id
                          quantity
                        }
                      }
                    }
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }`;
        
            for (const item of itemsToAdd) {
              try {
                const response = await shopify.graphql(mutation, {
                  id: item.id,
                  variantId: item.variantId,
                  quantity: item.quantity,
                });
                logger.info({ response }, "Successfully added item");
              } catch (error) {
                logger.error({ error }, "Error adding item");
              }
            }
          };
        
          // Function to commit the order edit
          const commitOrder = async () => {
            const mutation = `
              mutation commitEdit {
                orderEditCommit(
                  id: "${calculatedOrderId}",
                  notifyCustomer: ${customerInvoice},
                  staffNote: "Edit order"
                ) {
                  order {
                    id
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }`;
        
            try {
              const response = await shopify.graphql(mutation);
              if (response.orderEditCommit.userErrors.length) {
                logger.error(
                  { errors: response.orderEditCommit.userErrors },
                  "User errors during order commit"
                );
              } else {
                logger.info(
                  { orderId: response.orderEditCommit.order.id },
                  "Successfully committed the order"
                );
               
                if(customData.reAssignStatus == true){
                  const mutation = `mutation updateOrderCustomAttributes($input: OrderInput!) {
                    orderUpdate(input: $input) {
                      order {
                        id
                        customAttributes {
                              key
                              value
                          }
                      }
                      userErrors {
                        message
                        field
                      }
                    }
                  }`;
                  const response = await shopify.graphql(mutation, {
                    input: {
                      customAttributes: requestData.noteAttributes,
                      id: `gid://shopify/Order/${params.originalOrderId}`
                    }
                  });
                }
                
                if(customData.reAssignStatus == true){
                  const outletId = requestData.noteAttributes && requestData.noteAttributes.length ? findNoteAttributeValue(requestData.noteAttributes, "_outletId") : "";
                  const storeCode= requestData.noteAttributes && requestData.noteAttributes.length ? findNoteAttributeValue(requestData.noteAttributes, "_storeCode") : "";
                  const storeName= requestData.noteAttributes && requestData.noteAttributes.length ? findNoteAttributeValue(requestData.noteAttributes, "_storeName") : "";
                  const storeId=`${orderNumber}-${outletId}`;
                  // Update the external system if the commit was successful
              //  await api.khagatiOrder.update(params.orderId,JSON.parse(params.requestData));
                  await api.khagatiOrderSplit.update(customData.splitId,{
                    splitId:storeId,
                    storeCode:storeCode,
                    storeName:storeName,
                    reAssignStatus:customData.reAssignStatus
                  });
                  logger.info("Updated new order in Shopify");
                }
                
                }
              } catch (error) {
              logger.error({ error }, "Error committing the order");
            }
          };
        
          // Main function to execute the order edit
          const executeOrderEdit = async () => {
            try {
              if (removeItems && Array.isArray(removeItems) && removeItems.length > 0) {
                const itemsToRemove = removeItems.map((item) => ({
                  id: calculatedOrderId,
                  lineItemId: `gid://shopify/CalculatedLineItem/${item.id}`,
                  quantity: 0,
                }));
                await removeItemsFromOrder(itemsToRemove);
                removeStatus=true;
               
              }
              if (addedItems && Array.isArray(addedItems) && addedItems.length > 0) {
                const itemsToAdd = addedItems.map((item) => ({
                  id: calculatedOrderId,
                  variantId: `gid://shopify/ProductVariant/${item.id}`,
                  quantity: item.quantity,
                }));
                await addItemsToOrder(itemsToAdd);
                addItemStatus=true;
              }
              if(updatedItems && Array.isArray(updatedItems) && updatedItems.length > 0){
                const itemsToUpdate = updatedItems.map((item) => ({
                  id: calculatedOrderId,
                  lineItemId: `gid://shopify/CalculatedLineItem/${item.id}`,
                  quantity: item.quantity,
                }));
                await updateItemsToOrder(itemsToUpdate);
                updateItemStatus=true;
              }
  
              if(addItemStatus == true || removeStatus == true || updateItemStatus == true){
                await commitOrder();
              }
            
            } catch (error) {
              logger.error({ error }, "Error executing order edit");
            }
          };
        
          // Execute the order edit process
          executeOrderEdit();
        }

        
       }catch (error) {
        // Log the error and throw an exception if the update fails
        logger.error({ error }, "Error in api for edit order");
        throw new Error(`Failed to edit remove order: ${error.message}`);
    }
        
    } catch (error) {
        // Log the error and throw an exception if the update fails
        logger.error({ error }, "Error updating order in Shopify");
        throw new Error(`Failed to update order: ${error.message}`);
    }
}


/**
 * Parameters required for updating an order.
 *
 * @constant
 * @type {object}
 * @property {string} orderId - The ID of the order to be updated.
 * @property {string} requestData - The data to be used for updating the order, passed as a JSON string.
* @property {string} removeItems - The ID of the order to be updated.
 * @property {string} originalOrderId - The data to be used for updating the order, passed as a JSON string.
 */
export const params = {
    orderId: {
        type: "string",
    },
    requestData: {
        type: "string",
    },
    removeItems: {
        type: "string",
    },
    originalOrderId: {
      type: "string",
    },
    addedItems: {
        type: "string",
    },
    requestCustomData: {
        type: "string",
    },
    updateItems: {
        type: "string",
    },
   
};