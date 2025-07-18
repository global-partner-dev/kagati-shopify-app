import { formatPhoneNumber } from "../../web/util/commonFunctions";

const baseUrl = process.env.NODE_ENV === "production" ? process.env.TruePOS_URL : "https://dogmycats.true-pos.com/TruePOS/api/v1";
const authToken = process.env.NODE_ENV === "production" ? process.env.TruePOS_AuthToken : "9B9A7CD7C0FD271F6AD2147D8D73F68C1181E8EA2421B6053D44B0CD8C8C692F2776098819E69F43"
const headers = {
    'Content-Type': 'Application/json',
    'X-Auth-Token': authToken
};

const paymentMode = (paymentGateway) => {
    switch (paymentGateway) {
        case "PhonePe PG":
            return "The Pet Project - Website"
        case "manual":
            return "Manual"
        default:
        
            break;
    }
}

/**
 * Main function to run the sales order creation process.
 * 
 * @param {Object} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the process is completed.
 */
export async function run(context) {
    const response = await createSalesOrder(context);
    return response;
}

/**
 * Creates a sales order in TruePOS based on the provided Shopify order details.
 * 
 * @param {Object} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the sales order creation process is completed.
 */
async function createSalesOrder(context) {

    const { api, logger, params, connections } = context;
    await connections.shopify.setCurrentShop("59823030316");
    const shopify = connections.shopify.current;
    if (!shopify) {
      throw new Error("Missing Shopify connection");
    }

    const lineItems = JSON.parse(params.lineItems);
    logger.info(params, "Received parameters");

    // Fetch the Shopify order details
    const shopifyOrderRecord = await api.shopifyOrder.findOne(params.orderId, {
        select: {
            id: true,
            orderNumber: true,
            financialStatus: true,
            email: true,
            shippingAddress: true,
            totalShippingPriceSet: true,
            totalDiscountsSet: true,
            taxesIncluded:true,
            totalTax:true,
            lineItems: {
                edges: {
                    node: {
                        id: true,
                        price: true,
                        taxLines: true,
                        quantity:true,
                        variantId:true,
                        variant: {
                            compareAtPrice: true,
                        },
                        product: { 
                            id: true,
                            tags:true,
                        },
                    }
                },
            },
        }
    });
logger.info({shopifyOrderRecord: shopifyOrderRecord}, "shopifyOrderRecord-->")
const orderTransactionQuery = await shopify.graphql(`
    query getOrderTransactions($orderId: ID!) {
      order(id: $orderId) {
        transactions {
          id
          gateway
          kind
          status
          amount
          processedAt
        }
      }
    }
  `, {
    orderId: `gid://shopify/Order/${params.orderId}`
  });
  const originalTransaction = orderTransactionQuery.order.transactions.find(
    (node) => (node.kind === "SALE" || node.kind === "CAPTURE") && node.status === "SUCCESS"
  );

const paymentModeType = paymentMode(originalTransaction.gateway)

const calculateOrderTotals = (data) => {
    let subTotalPrice = 0;
    let totalTax = 0;
    let totalQuantity = 0;
    
    if (data.lineItems && data.lineItems.edges) {
        const lineItems = data.lineItems.edges;
 
        // Loop through each line item
        for (const item of lineItems) {
            const node = item.node;
            if(node.currentQuantity != 0){
              // Add the price of the current item to totalPrice
              totalQuantity += node.quantity; 
              subTotalPrice += parseFloat(node.price)*parseInt(node.quantity);
              // Assuming quantity is part of the node structure
    
              // Add tax amounts if they exist
              if (node.taxLines && node.taxLines.length > 0) {
                  for (const taxLine of node.taxLines) {
                      totalTax += parseFloat(taxLine.price);
                  }
              }
          }
        }
    }
  
    // Total shipping price
    const totalShippingPrice = parseFloat(data.totalShippingPriceSet.shop_money.amount);
    const totalDiscount = parseFloat(data.totalDiscountsSet.shop_money.amount);
  
    // Final total price calculation
    const finalTotalPrice = subTotalPrice + totalShippingPrice - totalDiscount;
    const discountPercentage = (totalDiscount / subTotalPrice)*100;
    return {
        subTotalPrice: (subTotalPrice + totalShippingPrice).toFixed(2),          // Format to 2 decimal places
        totalTax: totalTax.toFixed(2),                // Format to 2 decimal places
        totalDiscount: totalDiscount.toFixed(2),      // Format to 2 decimal places
        totalQuantity: totalQuantity,       
        discountPercentage : discountPercentage.toFixed(2),             // Total quantity of line items
        finalTotalPrice: finalTotalPrice.toFixed(2),    // Format to 2 decimal places
        totalShippingPrice: totalShippingPrice.toFixed(2)
    };
  };
  const orderTotals = calculateOrderTotals(shopifyOrderRecord);
  logger.info({orderTotals: orderTotals}, "orderTotals------->")
  const orderLineItems =shopifyOrderRecord.lineItems.edges;
  const targetTags = ["tax_18", "tax_12", "tax_5", "tax_0"];
  const taxRates = {
    tax_18: 18,  
    tax_12: 12,  
    tax_5: 5,  
    tax_0: 0.0,    
  };

  const variantTagMapping = orderLineItems.reduce((acc, edge) => {
      const { node } = edge; 
      const { id,variantId, product,price, quantity } = node; 
      if (product && Array.isArray(product.tags)) {
      const foundTag = product.tags.find(tag => targetTags.includes(tag)); 
      if (foundTag) {
          const taxRate = taxRates[foundTag] || 0; // Default to 0 if no tax rate found
          const totalProductCost = parseFloat(price) * parseInt(quantity);
          const taxAmount = totalProductCost- (totalProductCost * (100 / (100 + parseInt(taxRate))));
          acc[id] ={ tags: foundTag, taxamount:taxAmount.toFixed(2), };
      }
      }
      return acc;
  }, {});
    let totalTaxes =0.0;
    if(variantTagMapping){
        totalTaxes = Object.values(variantTagMapping).reduce((sum, item) => {
        return sum + parseFloat(item.taxamount || 0); // Ensure taxamount is treated as a number
        }, 0);
    }
    if(orderTotals?.shippingTaxAmount){
        totalTaxes=parseFloat(totalTaxes)+parseFloat(orderTotals.shippingTaxAmount);
    }


  logger.info({variantTagMapping: variantTagMapping}, "variantTagMapping------->")
  logger.info({totalTaxes: totalTaxes}, "totalTaxes------->")

    // Process each line item and map it to the TruePOS format
    const orderItems = await Promise.all(lineItems.map(async (item, index) => {
        let itemUrl = `${baseUrl}/items?q=itemId==${item.itemReferenceCode}`;
      logger.info({itemUrl: itemUrl}, "ItemUrl----->")
        let itemData = await fetch(itemUrl, { method: 'GET', headers });
        const itemIdData = await itemData.json();
        logger.info(itemIdData, "Fetched item data");
        const shopifyItem = shopifyOrderRecord.lineItems.edges.find(edge => edge.node.id === item.id)?.node;
         logger.info({shopifyItem: shopifyItem}, "shopifyItem-------->")
        if (!shopifyItem) {
            throw new Error(`Shopify item not found for item ID: ${item.id}`);
        }
        logger.info({taxPercentageAmount: variantTagMapping?.[item?.id]?.taxamount}, "taxPercentageAmount------->")
        const taxPercentageAmount = variantTagMapping?.[item?.id]?.taxamount || 0;

        logger.info({taxPercentageAmount: variantTagMapping?.[item?.id]?.tags}, "taxPercentageAmount------->")
        const tags = variantTagMapping?.[item?.id]?.tags;
        const taxPercentage = tags ? tags.replace(/^tax_/, '') : null;
       
        return {
            rowNo: Number(index + 1),
            itemId: Number(itemIdData.items[0]?.itemId),
            itemReferenceCode: item.itemReferenceCode,
            salePrice: Number(shopifyItem.price),
            quantity: Number(item.quantity),
            itemAmount: shopifyItem.price * item.quantity,
            taxPercentage: Number(taxPercentage),
            itemMarketPrice: shopifyItem.price * item.quantity,
        };
    }));


    // Calculate totals for the order
    // let totalQuantity = orderItems.reduce((acc, item) => acc + item.quantity, 0);
    // let totalAmount = orderItems.reduce((acc, item) => acc + item.itemAmount, 0);
    // let totalDiscountAmount = orderItems.reduce((acc, item) => acc + (item.discountAmount || 0), 0);
    // let totalTaxAmount = orderItems.reduce((acc, item) => acc + (item.itemAmount * parseFloat(item.taxPercentage) / 100), 0);
    

    // totalAmount = parseFloat(totalAmount.toFixed(2));
    // totalTaxAmount = parseFloat(totalTaxAmount.toFixed(2));
    // totalDiscountAmount = parseFloat(totalDiscountAmount.toFixed(2));
   
    
    // Prepare the request body for the sales order
    let url = `${baseUrl}/salesOrders`;
    const requestBody = {
        salesOrder: {
            outletId: params.erpStoreId,
            status: "pending",
            orderDiscPerc: parseFloat(orderTotals.discountPercentage),
            orderDiscAmt: parseFloat(orderTotals.totalDiscount),
            vendorDiscount: parseFloat(orderTotals.totalDiscount),
            totalQuantity: orderTotals.totalQuantity,
            onlineReferenceNo: shopifyOrderRecord.id,
            paymentMode: paymentModeType,
            totalAmount: orderTotals.subTotalPrice,
            totalTaxAmount: totalTaxes,
            totalDiscountAmount: parseFloat(orderTotals.totalDiscount),
            shippingId: shopifyOrderRecord.id,
            shippingName: shopifyOrderRecord.shippingAddress.name,
            shippingAddress1: shopifyOrderRecord.shippingAddress.address1,
            shippingAddress2: shopifyOrderRecord.shippingAddress.address2,
            shippingState: shopifyOrderRecord.shippingAddress.province,
            shippingCountry: shopifyOrderRecord.shippingAddress.country,
            shippingPincode: shopifyOrderRecord.shippingAddress.zip,
            shippingMobile: shopifyOrderRecord.shippingAddress.phone,
            shippingCharge: 0,
            packingCharge: "0.0",
            shipmentItems: lineItems.length,
            customerName: shopifyOrderRecord.shippingAddress.name,
            customerAddressLine1: shopifyOrderRecord.shippingAddress.address1,
            customerAddressLine2: shopifyOrderRecord.shippingAddress.address2,
            customerArea: shopifyOrderRecord.shippingAddress.city,
            customerState: shopifyOrderRecord.shippingAddress.province,
            customerCountry: shopifyOrderRecord.shippingAddress.country,
            customerPincode: shopifyOrderRecord.shippingAddress.zip,
            customerMobile: formatPhoneNumber(shopifyOrderRecord.shippingAddress.phone),
            customerPhone: formatPhoneNumber(shopifyOrderRecord.shippingAddress.phone),
            customerEmail: shopifyOrderRecord.email,
            channel: "E-Commerce API",
            orderItems: orderItems,
        }
    };
    logger.info(JSON.stringify(requestBody), "Prepared request body for sales order");
    // Send the sales order request to TruePOS
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        logger.info(data, "Sales order creation response");
        if (data.result.status === "success") {
            logger.info("Sales order created successfully");
        }
    } catch (error) {
        logger.error(`Error during sales order creation: ${error.message}`);
    }
}

/**
 * Parameters for the sales order creation action.
 * 
 * @type {Object}
 * @property {string} orderId - The ID of the Shopify order to process.
 * @property {string} erpStoreId - The ID of the ERP store where the order will be created.
 * @property {string} lineItems - A JSON string representing the line items of the order.
 */

/* 
    recieved params from SplitDetail.jsx (  khagatiOrderSplit model )
*/

export const params = {
    orderId: {
        type: "string"
    },
    erpStoreId: {
        type: "string"
    },
    lineItems: {
        type: "string"
    }
};
