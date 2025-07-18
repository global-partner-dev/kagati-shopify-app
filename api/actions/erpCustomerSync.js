import { formatDateToCustomString, formatLatitude, formatPhoneNumber } from "../../web/util/commonFunctions";

const baseUrl = process.env.NODE_ENV === "production" ? process.env.TruePOS_URL : "https://dogmycats.true-pos.com/TruePOS/api/v1";
const authToken = process.env.NODE_ENV === "production" ? process.env.TruePOS_AuthToken : "9B9A7CD7C0FD271F6AD2147D8D73F68C1181E8EA2421B6053D44B0CD8C8C692F2776098819E69F43"
const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': authToken,
};

/**
 * Creates a customer in the TruePOS system based on Shopify order details.
 * 
 * @param {Object} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<string|void>} A promise that resolves with the ERP customer ID if the customer exists, or creates a new customer in TruePOS.
 */
async function createErpCustomer(context) {
    const { api, logger, params } = context;
    logger.info(params.orderId, "params orderId");
    // Fetch the Shopify order details using the provided order ID
    const shopifyOrderRecord = await api.shopifyOrder.findOne(params.orderId, {
        select: {
            shippingAddress: true,
            customer: {
                id : true,
                email : true,
                lastOrderName: true,
                ordersCount: true,
                totalSpent: true,
                lastOrderName: true,
                shopifyState: true,
                shopifyUpdatedAt: true,
                updatedAt: true
            },
        }
    });

    logger.info(shopifyOrderRecord, "shopifyOrderRecord");
    // Generate a random customer ID for the new ERP customer
    const uniqueValue  = String(Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000);
    const mobile = formatPhoneNumber(shopifyOrderRecord.shippingAddress.phone);

    let url = `${baseUrl}/eCustomers`;
    // Prepare the request body for creating a new customer in TruePOS
    const requestBody = {
        eCustomers: [
            {
                id: uniqueValue,
                name: shopifyOrderRecord.shippingAddress.name,
                address1: shopifyOrderRecord.shippingAddress.address1,
                address2: shopifyOrderRecord.shippingAddress.address2 === null ? "." : shopifyOrderRecord.shippingAddress.address2,
                address3: ".",
                pincode: shopifyOrderRecord.shippingAddress.zip,
                type: "DEFAULT",
                customerId: shopifyOrderRecord.customer.id, //1. Empty string for customer create   2. With customer id for customer update
                // priceLevelId: 5,
                city: shopifyOrderRecord.shippingAddress.city,
                state: shopifyOrderRecord.shippingAddress.province,
                country: shopifyOrderRecord.shippingAddress.country,
                area: shopifyOrderRecord.shippingAddress.city,
                mobile: mobile,
                email: shopifyOrderRecord.customer.email,
                salesMan: 0,
                salesManCode: 0,
                salesManMobile: "",
                creditDays: 3,
                loginId: uniqueValue,
                isOffer: 0,
                isQty: shopifyOrderRecord.customer.ordersCount,
                isFree: 0,
                syncTS: formatDateToCustomString(shopifyOrderRecord.customer.updatedAt),
                allowBilling: 1,
                customerAlias: shopifyOrderRecord.shippingAddress.name,
                status: "A",
                outstanding: 0,
                gstNumber: "",
                aadharNumber: "",
                panNumber: "",
                isGstExempted: false,
                stateCode: 0,
                gstRegType: 1,
                customerTypeCode: 1,
                isCreditAllowed: 1,
                longitude: formatLatitude(shopifyOrderRecord.shippingAddress.longitude),
                latitude: formatLatitude(shopifyOrderRecord.shippingAddress.latitude),
            }
        ]
    };

    logger.info(requestBody, "Prepared request body for customer creation");

    try {
        // Create a new customer in the TruePOS system
        const response = await fetch(url,
            {   method: 'POST',
                headers,
                body: JSON.stringify(requestBody) 
            }
        );
        const data = await response.json();
        return data
        if (data.result.status === "success") {
            logger.info({data: data.result}, "Customer created successfully in TruePOS.");
            return "success"
        }
    } catch (error) {
        logger.error(error, "Error during customer creation");
        return error
    }
}

/**
 * Main function to run the ERP customer creation process.
 * 
 * @param {Object} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the process is completed.
 */
export async function run(context) {
    const { api, logger, params } = context;
    //get customer availability from erp
    const availability = await api.ErpCustomer.availability({ 
        orderId : params.orderId
    })
    if (availability === "customerExist" || availability === "mobileMisMatch") {
        //if there is exist customer in erp...
        // const result = await api.ErpCustomer.update({ 
        //     orderId : params.orderId,
        // })
        return true;
    } else if (availability === "customerNotFound") {
        //if there is no exist customer in erp...
        const result = await createErpCustomer(context);
        return result;
    }
}

/**
 * Parameters for the ERP customer creation action.
 * 
 * @type {Object}
 * @property {string} orderId - The ID of the Shopify order to process.
 */
export const params = {
    orderId: {
        type: "string"
    }
};