import { ActionOptions, EmailSMTPGlobalActionContext } from "gadget-server";
import { formaterDate } from "../../web/util/commonFunctions";

const axios = require("axios");
/**
 * Executes the email SMTP action.
 * 
 * This function sends an email using the SMTP protocol. It retrieves the necessary parameters from the context and logs the success or failure of the email sending operation.
 * 
 * @async
 * @function run
 * @param {EmailSMTPGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly SMTP.
 * 
 * @returns {Promise<void>} A promise that resolves when the action completes.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  
  const splitOrderId = params.id
  logger.info({splitOrderId:splitOrderId}, "IDIDIDIDID---------->")
  const orderStatus = params.orderStatus
  
  const calculateOrderTotals = (data) => {
    let totalPrice = 0;
    let totalTax = 0;
    let totalQuantity = 0;
    
    if (data.lineItems) {
 
        // Loop through each line item
        for (const item of lineItems) {
            const node = item;
            // Add the price of the current item to totalPrice
            totalQuantity += node.quantity;
            totalPrice += parseFloat(node.price)*parseInt(totalQuantity);
            // Assuming quantity is part of the node structure
  
            // Add tax amounts if they exist
            if (node.taxLines && node.taxLines.length > 0) {
                for (const taxLine of node.taxLines) {
                    totalTax += parseFloat(taxLine.price);
                }
            }
        }
    }
  
    // Total shipping price
    const totalShippingPrice = parseFloat(data.totalShippingPriceSet.shop_money.amount);
    const totalDiscount = parseFloat(data.totalDiscountsSet.shop_money.amount);
  
    // Final total price calculation
    const finalTotalPrice = totalPrice + totalShippingPrice - totalDiscount;
  
    return {
        totalPrice: totalPrice.toFixed(2),          // Format to 2 decimal places
        totalTax: totalTax.toFixed(2),                // Format to 2 decimal places
        totalDiscount: totalDiscount.toFixed(2),      // Format to 2 decimal places
        totalQuantity: totalQuantity,                   // Total quantity of line items
        finalTotalPrice: finalTotalPrice.toFixed(2),    // Format to 2 decimal places
        totalShippingPrice: totalShippingPrice.toFixed(2)
    };
  };

  let orderData;

  const splitOrderData = await api.khagatiOrderSplit.findOne(splitOrderId, {
    select: {
      id: true,
      orderReferenceId: true,
      orderNumber: true,
      lineItems: true
    }
  });

  // Step 2: Log and verify the retrieved splitOrderData
  logger.info(splitOrderData, "splitOrderData fetched");

  // Step 3: Use the orderReferenceId to get Shopify order details
  const orderRefId = splitOrderData.orderReferenceId;

  try {
    orderData = await api.khagatiOrder.findMany({
      filter: {
        orderId: { equals: String(orderRefId) }
      },
      select: {
        id: true,
        createdAt: true,
        name: true,
        email: true,
      	presentmentCurrency: true,
        shippingAddress: true,
      	totalShippingPriceSet: true,
        totalDiscountsSet: true,
        taxLines: true,
        lineItems: true

      }
    });

    if (orderData.length === 0) {
      throw new Error("No records found matching the provided orderRefId.");
    }

    logger.info({ orderData }, "Fetched Order Data======>");

  } catch (error) {
    logger.error({ error }, "Error fetching order data");
  }

  const getProductImage = async (productId) => {
    const shopifyProductRecords = await api.shopifyProduct.findMany({
      select: {
        images: {
          edges: {
            node: {
              source: true,
            },
          },
        },
      },
      filter: { id: { equals: productId } },
    });

    const image = shopifyProductRecords[0]?.images?.edges[0]?.node?.source;
    logger.info({ image }, "Retrieved product image:");
    return image || null;
  };

  ////===========================Function================================//
  let templeteId
  if (orderStatus == "on_hold") {
    templeteId = "THEP-0127316-HOLD"
  } else if (orderStatus == "delivered") {
    templeteId = "THEP-0127316-DELIEVER"
  } else if (orderStatus == "canceled") {
    templeteId = "THEP-0127316-CANCEL"
  }

  const requestData = orderData[0];

  const name = requestData.name;
  const createdAt = formaterDate(requestData.createdAt);
  const email = requestData.email;
  const presentmentCurrency = requestData.presentmentCurrency === "INR" ? "₹" : "$";

  let lineItems = requestData.lineItems;
  const shippingAddress = requestData.shippingAddress;
  const taxLines = requestData.taxLines; //array- or empty array----
  
  const totalDiscount = requestData.totalDiscountsSet.shop_money.amount;
  const totalShippingPrice = requestData.totalShippingPriceSet.shop_money.amount;
  const customerName = shippingAddress?.first_name + " " + shippingAddress?.last_name;
  const address1 = shippingAddress?.address1  + " " + shippingAddress?.address2
  const addressCity = shippingAddress?.city;
  const addressProvince = shippingAddress?.province;
  const addressZipcode = shippingAddress?.zip;
  const addressCountry = shippingAddress?.country;

  const images = {};
  for (const item of requestData.lineItems) {
    const image = await getProductImage(item.product);
    images[item.product] = image;
  }
  logger.info({images: images}, "images---->>")
  

  const priceData = calculateOrderTotals(requestData)
  logger.info({priceData: priceData}, "priceData------>>")
  
  const totalPrice = priceData.totalPrice;
  const totalQuantity = priceData.totalQuantity;
  const finalTotalPrice = priceData.finalTotalPrice;

  logger.info({totalPrice: totalPrice}, "totalPrice------>>")
  logger.info({totalQuantity: totalQuantity}, "totalQuantity------>>")
  ///----items---------------------------------------------------------//
  const items = lineItems.map(item => {
    return {
      productName: item.title,
      quantities: item.quantity,
      price: item.price,
      image: images[item.product] // Access the image using the product key
    };
  });
  logger.info({items: items}, "items-------->>>")
  ///----items---------------------------------------------------------//
  
  const apiKey = process.env.SMTP_TOKEN;
  const toEmail = requestData.email;
  const senderEmail = "hello@thepetproject.com";
  
  const templateData = {
    orderName: name,
    orderDate: createdAt,
    totalPrice: totalPrice,
    finalTotalPrice: finalTotalPrice,
    shippingPrice: totalShippingPrice,
    discountPrice: totalDiscount,
    itemsCount: totalQuantity,
    currency: presentmentCurrency,
    customerName: customerName,
    shippingAddress: address1,
    shippingCity: addressCity,
    shippingProvince: addressProvince,
    shippingZipcode: addressZipcode,
    shippingCountry: addressCountry,
    items: items
  }

  logger.info({templateData : templateData}, "templateData---->>")


  try {
    const response = await axios.post("https://api.smtp2go.com/v3/email/send", {
      api_key: apiKey,
      to: [toEmail],
      sender: senderEmail,
      template_id: templeteId,
      template_data: templateData,
    });
    
    logger.info({response: response}, "Email sent successfully!");
    logger.info({response: response.data}, "Email success response!");
    logger.info({response: JSON.parse(response.config.data)}, "Email status!");
    return response.data
  } catch (error) {
    logger.error("Failed to send email:", error);
    throw error;
  }
}

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};
export const params = {
  id: {
    type: "string"
  },
  orderStatus: {
    type: "string"
  }
};