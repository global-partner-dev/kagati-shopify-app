import { CreateOrderGlobalActionContext } from "gadget-server";
const axios = require("axios");

/**
 * Main function to execute the order creation in Shopify and store the order details in the local ERP system.
 * 
 * @param {CreateOrderGlobalActionContext} context - The context object provided by the Gadget server, containing useful utilities such as scope, logger, params, api, and connections.
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
    
    const data = JSON.parse(params.requestData);
    
    if(data && data.id) {
      shopifyOrderId = data.id

    } else {
      const responseOrderData = await shopify.order.create(data);
      shopifyOrderId = responseOrderData.id
      logger.info({responseOrderData: responseOrderData}, "responseOrderData--->>")
    }
    logger.info({shopifyOrderId: shopifyOrderId}, "shopifyOrderId--->>")

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

    
    logger.info(shopifyOrderRecord, "shopifyOrderRecord");

    
    await api.khagatiOrder.create({
      orderId: String(shopifyOrderRecord?._all?.id),
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

    logger.info("Order created in kaghati order model!");
    
    const orderName = shopifyOrderRecord?._all.name
    const cName = shopifyOrderRecord?._all?.shippingAddress?.name;
    const phoneNumber = shopifyOrderRecord?._all?.shippingAddress?.phone
    const smsRequestData = {
      orderName: orderName,
      cName: cName,
      phoneNumber: phoneNumber
    }

    logger.info({ smsRequestData: smsRequestData }, "Request Data for order data");
    // Step 4: Create the email message
    try {
      // Prepare the SMS request data
      const responseSMS = await api.khagatiSMS({
        smsRequestData: JSON.stringify(smsRequestData),
        subject: "Confirmation"
      });
  
      // Optional: Handle the response if needed
      logger.info("SMS sent successfully:", responseSMS);
    } catch (error) {
      // Handle any errors that occur during the SMS sending process
      logger.error("Failed to send SMS:", error);
    }
  
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