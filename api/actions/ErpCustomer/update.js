import { formatDateToCustomString, formatLatitude, formatPhoneNumber } from "../../../web/util/commonFunctions";

const baseUrl = process.env.NODE_ENV === "production" ? process.env.TruePOS_URL : "https://dogmycats.true-pos.com/TruePOS/api/v1";
const authToken = process.env.NODE_ENV === "production" ? process.env.TruePOS_AuthToken : "9B9A7CD7C0FD271F6AD2147D8D73F68C1181E8EA2421B6053D44B0CD8C8C692F2776098819E69F43"
const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': authToken,
};

/**
 * Main function to execute the customer update process.
 * 
 * @param {Object} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the update process is completed.
 */
export async function run(context) {
    const { api, logger, params } = context;
    logger.info(params, "params");

    const orderId = params.orderId;
    const shopifyOrderRecord = await api.shopifyOrder.findOne( orderId, {
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

    const mobile = formatPhoneNumber(shopifyOrderRecord.shippingAddress.phone);

    let url = `${baseUrl}/eCustomers?mode=update`;
    // Prepare the request body for creating a new customer in TruePOS
    const requestBody = {
        eCustomers: [
            {
                id: 64810,
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
                isQty: shopifyOrderRecord.customer.ordersCount,
                syncTS: formatDateToCustomString(shopifyOrderRecord.customer.updatedAt),
                customerAlias: shopifyOrderRecord.shippingAddress.name,
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
            logger.info({data: data.result}, "Customer updated successfully in TruePOS.");
            return true
        }
    } catch (error) {
        logger.error(error, "Error during customer creation");
        return error
    }
}

/**
 * Parameters for the ERP customer update action.
 * 
 * @type {Object}
 */
export const params = {
    orderId: {
        type: "string",
        required: true
    }
};
