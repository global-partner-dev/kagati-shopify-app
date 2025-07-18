import { CreateDraftOrderGlobalActionContext } from "gadget-server";

/**
 * Main function to execute the order creation in Shopify and store the order details in the local ERP system.
 * 
 * @param {CreateDraftOrderGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as scope, logger, params, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the order creation and storage process is completed.
 */
const axios = require("axios");

export async function run({ scope, logger, params, api, connections }) {
  logger.info({params : params}, "params--------- in draft order")
    try {
      await connections.shopify.setCurrentShop("59823030316");
      let shopify = connections.shopify.current;
      if (!shopify) {
          logger.info({shopify: shopify}, "Shopify connection is not available.");
          shopify = await connections.shopify.setCurrentShop("59823030316");
      } 
      logger.info({shopify: shopify}, "Shopify connection is not ?");

      const data = JSON.parse(params.requestData);
      logger.info({data : data}, "data--------- in draft order")

      const line_items = data.line_items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        title: item.variant_title,
        price: item.price
      }));
       // STEP 3: Prepare a draft order for simulation
      const draftOrderPayload = {
        line_items: line_items,
        // shipping_address: data.shipping_address,
        customer: {
          id: data.customer.id,
        },
        note_attributes: data.note_attributes,
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags,
        shipping_line: {
          title: "custom shipping",
          price: 0
        },
        use_customer_default_address : true
      };

      logger.info({draftOrderPayload : draftOrderPayload}, "draftOrderPayload--------- in draft order")
      // STEP 4: Create a draft order (simulation)
      const draftOrder = await shopify.draftOrder.create(draftOrderPayload);
  
      if (!draftOrder) {
        throw new Error("Failed to create draft order.");
      }
  
      logger.info({ draftOrder: draftOrder }, "Draft Order Created ");
      const invoice = await shopify.draftOrder.sendInvoice(draftOrder.id);
      logger.info({ invoice: invoice }, "Invoice Sent");

      await api.khagatiOrder.create({
        orderId: String(draftOrder.id),
        name: draftOrder.name,
        billingAddress: draftOrder.billing_address,
        currency: draftOrder.currency,
        currentSubtotalPrice: draftOrder.subtotal_price,
        currentTotalTax: draftOrder.total_tax,
        currentTotalPrice: draftOrder.total_price,
        customer: {
          id: draftOrder.customer.id,
          firstName: draftOrder.customer.first_name,
          lastName: draftOrder.customer.last_name,
          email: draftOrder.customer.email,
          phone: draftOrder.customer.phone
        },
        email: draftOrder.email,
        financialStatus: "pending",
        lineItems: draftOrder.line_items.map(item => ({
          productId: item.product_id,
          variantId: item.variant_id,
          variantTitle: item.variant_title,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          sku: item.sku
        })),
        note: draftOrder.note,
        noteAttributes: draftOrder.note_attributes,
        phone: draftOrder.phone,
        shippingAddress: draftOrder.shipping_address,
        tags: draftOrder.tags
      });


      const orderRequestData = {
        orderId: Number(draftOrder.id), // Convert to number instead of string
        orderReferenceId: String(draftOrder.id),
        deliveryPaymentType: "pending",
        orderTags: draftOrder.tags,
        comments: ["Draft Order created successfully"],
        smsNotification: "notSent",
        emailNotification: "notSent",
        whatsAppNotification: "notSent",
      };
    
      // Create the order information record in khagatiOrderInfo
      await api.khagatiOrderInfo.create(orderRequestData);
    

      const findNoteAttributeValue = (attributes, attributeName) => {
        const attribute = attributes.find(attr => attr.name === attributeName);
        return attribute ? attribute.value : null;
      };
      // Fetch the store details based on the provided orderType
      const store = await api.khagatiStores.findMany({
        select: {
          erpStoreId: true,
          storeCode: true,
          storeName: true,
          selectBackupWarehouse: true,
        },
        filter: { erpStoreId: { equals: findNoteAttributeValue(draftOrder.note_attributes, "_outletId") } }
      });
      let primaryStoreItems = [];
      logger.info({store: store}, "store--------- in draft order")
      // Process each line item in the Shopify order
      await Promise.all(draftOrder.line_items.map(async (item) => {
        primaryStoreItems.push({
          id: item.id,
          quantity: item.quantity,
          itemReferenceCode: item.sku,
          outletId: Number(store[0].erpStoreId)
        });
      }));
    
      let result;
      const currentTimeStamp=Date.now();
      const timeStamp={
        draft: currentTimeStamp
      }
    
      // If there are items to split, prepare the split order data
      if (primaryStoreItems && primaryStoreItems.length > 0) {
        result = {
          lineItems: primaryStoreItems,
          splitId: `${draftOrder.id}-${store[0].storeCode}`,
          orderNumber: draftOrder.id,
          storeCode: store[0].storeCode,
          storeName: store[0].storeName,
          erpStoreId: store[0].erpStoreId,
          orderReferenceId: String(draftOrder.id), // Convert to string to match GraphQL schema
          orderStatus: "on_hold",
          onHoldStatus: "open",
          timeStamp:timeStamp
        };
      }
    
      logger.info(result, "result");
    
      // Create the order split records in khagatiOrderSplit
      await api.khagatiOrderSplit.create(result);
     
      // Return the calculated data to the client or process further
      return {
        // taxData,
        // shippingData,
        draftOrder,
      };
    
    } catch (error) {
      // Log any errors that occur during the order creation process
      logger.error({ error }, "Error creating order in Shopify");
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }
  
  /**
 * Parameters for the Shopify order creation action.
 * 
 * @type {Object}
 * @property {string} requestData - The JSON string containing the order data to be created in Shopify.
 */
export const params = {
  requestData: {
    type: "string"
  },
};