import { KhaghtiOrderUpdateGlobalActionContext } from "gadget-server";
const axios = require("axios");

/**
 * Main function to execute the order creation in Shopify and store the order details in the local ERP system.
 * 
 * @param {KhaghtiOrderUpdateGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as scope, logger, params, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the order creation and storage process is completed.
 */

export async function run({ scope, logger, params, api, connections }) {
    try {
      let shopifyOrderId;
      await connections.shopify.setCurrentShop("59823030316");
      let shopify = connections.shopify.current;
      if (!shopify) {
          logger.info({shopify: shopify}, "Shopify connection is not available.");
          shopify = await connections.shopify.setCurrentShop("59823030316");
      } 
      logger.info({shopify: shopify}, "Shopify connection is not ???????.");
      try{
        shopifyOrderId = params.id;
      } catch(error){
        logger.error({error: error}, "Error in getting shopify order id.");
      }
      const shopifyOrderRecord = await api.shopifyOrder.findOne(shopifyOrderId, {
          select: {
            _all: true,
          customer: {
            _all: true
          },
          lineItems: {
            edges: {
              node: {
                _all: true
              }
            }
          }
        }
      });
      if (!shopifyOrderRecord) {
        throw new Error(`Shopify order not found for ID: ${shopifyOrderId}`);
      }
      logger.info(shopifyOrderRecord, "shopifyOrderRecord");

      const orderData = await api.khagatiOrder.findMany({
        filter: {
          orderId: { equals: String(shopifyOrderRecord?._all.id) }
        },
        select: {
         id:true
        }
      });
      if (!orderData) {
        throw new Error(`khagatiOrder not found : ${orderData}`);
      }
      const khagatiOrderId=String(orderData[0]?.id)
      await api.khagatiOrder.update(khagatiOrderId,{
        billingAddress: shopifyOrderRecord?._all?.billingAddress,
        browserIp: shopifyOrderRecord?._all?.browserIp,
        buyerAcceptsMarketing: shopifyOrderRecord?._all?.buyerAcceptsMarketing,
        cancelReason: shopifyOrderRecord?._all?.cancelReason,
        cancelledAt: shopifyOrderRecord?._all?.cancelledAt,
        cartToken: shopifyOrderRecord?._all?.cartToken,
        checkoutToken: shopifyOrderRecord?._all?.checkoutToken,
        clientDetails: shopifyOrderRecord?._all?.clientDetails,
        closedAt: shopifyOrderRecord?._all?.closedAt,
        currency: shopifyOrderRecord?._all?.currency,
        currentSubtotalPrice: shopifyOrderRecord?._all?.currentSubtotalPrice,
        currentSubtotalPriceSet: shopifyOrderRecord?._all?.currentSubtotalPriceSet,
        currentTotalAdditionalFeesSet: shopifyOrderRecord?._all?.currentTotalAdditionalFeesSet,
        currentTotalDiscounts: shopifyOrderRecord?._all?.currentTotalDiscounts,
        currentTotalDiscountsSet: shopifyOrderRecord?._all?.currentTotalDiscountsSet,
        currentTotalDutiesSet: shopifyOrderRecord?._all?.currentTotalDutiesSet,
        currentTotalPrice: shopifyOrderRecord?._all?.currentTotalPrice,
        currentTotalPriceSet: shopifyOrderRecord?._all?.currentTotalPriceSet,
        currentTotalTax: shopifyOrderRecord?._all?.currentTotalTax,
        currentTotalTaxSet: shopifyOrderRecord?._all?.currentTotalTaxSet,
        customer: shopifyOrderRecord?.customer?._all,
        customerLocale: shopifyOrderRecord?._all?.customerLocale,
        discountApplications: shopifyOrderRecord?._all?.discountApplications,
        discountCodes: shopifyOrderRecord?._all?.discountCodes,
        email: shopifyOrderRecord?._all?.email,
        estimatedTaxes: shopifyOrderRecord?._all?.estimated_taxes,
        financialStatus: shopifyOrderRecord?._all?.financialStatus,
        fulfillmentStatus: shopifyOrderRecord?._all?.fulfillmentStatus,
        fulfillments: shopifyOrderRecord?._all?.fulfillments,
        //landingSite: shopifyOrderRecord?._all?.landingSite,
        lineItems: shopifyOrderRecord?.lineItems.edges.map(item => item.node._all),
        merchantOfRecordAppId: shopifyOrderRecord?._all?.merchantOfRecordAppId,
        name: shopifyOrderRecord?._all?.name,
        note: shopifyOrderRecord?._all?.note,
        noteAttributes: shopifyOrderRecord?._all?.noteAttributes,
        number: shopifyOrderRecord?._all?.number,
        orderNumber: shopifyOrderRecord?._all?.orderNumber,
        orderStatusUrl: shopifyOrderRecord?._all?.orderStatusUrl,
        originalTotalAdditionalFeesSet: shopifyOrderRecord?._all?.originalTotalAdditionalFeesSet,
        originalTotalDutiesSet: shopifyOrderRecord?._all?.originalTotalDutiesSet,
        paymentGatewayNames: shopifyOrderRecord?._all?.paymentGatewayNames,
        phone: shopifyOrderRecord?._all?.phone,
        poNumber: shopifyOrderRecord?._all?.poNumber,
        presentmentCurrency: shopifyOrderRecord?._all?.presentmentCurrency,
        processedAt: shopifyOrderRecord?._all?.processedAt,
        referringSite: shopifyOrderRecord?._all?.referringSite,
        shippingAddress: shopifyOrderRecord?._all?.shippingAddress,
        // shippingLines: shopifyOrderRecord?._all?.shipping_lines, // checking
        sourceIdentifier: shopifyOrderRecord?._all?.source_identifier,
        sourceName: shopifyOrderRecord?._all?.sourceName,
        sourceUrl: shopifyOrderRecord?._all?.sourceUrl,
        subtotalPrice: shopifyOrderRecord?._all?.subtotalPrice,
        subtotalPriceSet: shopifyOrderRecord?._all?.subtotalPriceSet,
        tags: shopifyOrderRecord?._all?.tags,
        taxExempt: shopifyOrderRecord?._all?.tax_exempt,
        taxLines: shopifyOrderRecord?._all?.taxLines,
        taxesIncluded: shopifyOrderRecord?._all?.taxes_included,
        token: shopifyOrderRecord?._all?.token,
        totalDiscounts: shopifyOrderRecord?._all?.totalDiscounts,
        totalDiscountsSet: shopifyOrderRecord?._all?.totalDiscountsSet,
        totalLineItemsPrice: shopifyOrderRecord?._all?.totalLineItemsPrice,
        totalLineItemsPriceSet: shopifyOrderRecord?._all?.totalLineItemsPriceSet,
        totalOutstanding: shopifyOrderRecord?._all?.totalOutstanding,
        totalPrice: shopifyOrderRecord?._all?.totalPrice,
        totalPriceSet: shopifyOrderRecord?._all?.totalPriceSet,
        totalShippingPriceSet: shopifyOrderRecord?._all?.totalShippingPriceSet,
        totalTax: shopifyOrderRecord?._all?.totalTax,
        totalTaxSet: shopifyOrderRecord?._all?.totalTaxSet,
        totalTipReceived: shopifyOrderRecord?._all?.totalTipReceived,
        totalWeight: shopifyOrderRecord?._all?.total_weight,
      });
      const findNoteAttributeValue = (attributes, attributeName) => {
        const attribute = attributes.find(attr => attr.name === attributeName);
        return attribute ? attribute.value : null;
      };
      const storeCode = shopifyOrderRecord?._all?.noteAttributes?.length ? findNoteAttributeValue(shopifyOrderRecord?._all?.noteAttributes, "_outletId") : ""
      const store = await api.khagatiStores.findMany({
        select: {
          erpStoreId: true,
          storeCode: true,
          storeName: true,
          selectBackupWarehouse: true,
        },
        filter: { erpStoreId: { equals: storeCode } }
      });
    
      let primaryStoreItems = [];
      let result
      
      // Process each line item in the Shopify order
      await Promise.all(shopifyOrderRecord?.lineItems.edges.map(async (item) => {
        primaryStoreItems.push({
          id: item.node._all.id,
          quantity: item.node._all.currentQuantity,
          itemReferenceCode: item.node._all.sku,
          outletId: Number(store[0].erpStoreId)
        });
      }));
      if (primaryStoreItems && primaryStoreItems.length > 0) {
        result = {
          lineItems: primaryStoreItems,
          splitId: `${shopifyOrderRecord?._all?.orderNumber}-${store[0].storeCode}`,
          orderNumber: shopifyOrderRecord?._all?.orderNumber,
          storeCode: store[0].storeCode,
          storeName: store[0].storeName,
          erpStoreId: store[0].erpStoreId,
          orderReferenceId: shopifyOrderRecord?._all?.id
        };
      }
      const khagatiOrderSplitId = await api.khagatiOrderSplit.findMany({
        select: {
          id: true
        },
        filter: {
          orderReferenceId: { equals: shopifyOrderRecord?._all?.id }
        }
      });
      const splitUpdate = await api.khagatiOrderSplit.update(khagatiOrderSplitId[0].id, result);
      logger.info({splitUpdate: splitUpdate}, "splitUpdate");
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
   * @property {string} id - The  string containing the order data to be created in Shopify.
   */
  export const params = {
    id: {
      type: "string"
    },
  };