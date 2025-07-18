import { ActionOptions, PorterCreateOrderGlobalActionContext } from "gadget-server";

/**
 * Executes the Porter Create Order action.
 * 
 * This function retrieves order details from Shopify, prepares the necessary data, and sends a request to the Porter API to create a delivery order. 
 * It also tracks the order status by making a subsequent API call to Porter and logs the entire process.
 * 
 * @async
 * @function run
 * @param {PorterCreateOrderGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action, including the Shopify order ID and ERP store ID.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services, particularly Porter.
 * 
 * @returns {Promise<void>} A promise that resolves when the order creation and tracking are complete.
 * 
 * @throws {Error} If an error occurs during the process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
    //logger.info(params.orderId, "Running porter create order action");

    let storeId = params.erpStoreId.trim();

    // Fetch the order to get shippingAddress
    const orderData = await api.shopifyOrder.findOne(params.orderId);
    const shippingAddress = orderData?.shippingAddress; // Ensure shippingAddress is handled safely

    // Environment variables for API integration
    const porterApiURL = process.env.Porter_Api_URL; // Base URL for Porter API
    const porterApiKey = process.env.Porter_Api_key; // API key for Porter API
    const porterOrderCreateURL = `${porterApiURL}v1/orders/create`; // URL for creating orders
    let porterOrderTrackURL = porterApiURL; // URL for tracking orders, replace :id with actual order ID as needed

    try {
        // Fetch store data based on the ERP store ID
        const storeData = await api.khagatiStores.findMany({
            filter: {
                erpStoreId: { equals: storeId },
                status: { in: ["Active"] }
            }
        });

        if (storeData.length > 0) {
            const firstStore = storeData[0];
            const addressParts = firstStore.address.split(',').map(part => part.trim());

            // Preparing the pickup_details object with firstStore's data
            const pickupDetails = {
                address: {
                    apartment_address: addressParts[0] || ".",
                    street_address1: addressParts[1] || ".",
                    street_address2: addressParts[2] || ".",
                    landmark: addressParts[3] || ".",
                    city: firstStore.city,
                    state: firstStore.state,
                    pincode: firstStore.pinCode,
                    country: "India",
                    lat: firstStore.lat, // Placeholder, extract from another source if available
                    lng: firstStore.lng, // Placeholder, extract from another source if available
                    contact_details: {
                        name: firstStore.storeName,
                        phone_number: firstStore.mobNumber
                    }
                }
            };

            // Mapping shippingAddress to drop_details accurately
            const dropDetails = {
                address: {
                    apartment_address: shippingAddress.address1 || ".",
                    street_address1: shippingAddress.address2 || ".",
                    city: shippingAddress.city,
                    state: shippingAddress.province,
                    pincode: shippingAddress.zip,
                    country: shippingAddress.country,
                    lat: shippingAddress.latitude, // Using provided latitude
                    lng: shippingAddress.longitude, // Using provided longitude
                    contact_details: {
                        name: shippingAddress.name,
                        phone_number: shippingAddress.phone
                    }
                }
            };

            // Preparing the requestBody for the Porter API call
            const requestBody = {
                "request_id": "TEST_0_8236098bfc-87e0-11ec-a8a3-0242ac120002",
                "delivery_instructions": {
                    "instructions_list": [
                        {
                            "type": "text",
                            "description": "handle with care"
                        }
                    ]
                },
                "pickup_details": pickupDetails,
                "drop_details": dropDetails,
                "additional_comments": "This is a test comment"
            };

            // logger.info(`Request Body: ${JSON.stringify(requestBody)}`);

            // Making the API call to create an order
            const createResponse = await fetch(porterOrderCreateURL, {
                method: "POST",
                headers: {
                    'x-api-key': porterApiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!createResponse.ok) {
                throw new Error(`HTTP error! status: ${createResponse.status}`);
            }

            const createResponseData = await createResponse.json();
            logger.info(`Order created successfully: ${JSON.stringify(createResponseData)}`);

            const porterOrderId = createResponseData.order_id;
            logger.info(porterOrderId);

            porterOrderTrackURL = porterOrderTrackURL + "v1.1/order/" + porterOrderId;
            logger.info(porterOrderTrackURL);

            try {
                // Introduce a delay before making the tracking request
                await new Promise(resolve => setTimeout(resolve, 10000));

                // Making the API call to track the order
                const trackResponse = await fetch(porterOrderTrackURL, {
                    method: "GET",
                    headers: {
                        'x-api-key': porterApiKey,
                        'Content-Type': 'application/json'
                    }
                });
                if (!trackResponse.ok) {
                    throw new Error(`HTTP error! status: ${trackResponse.status}`);
                }

                const trackResponseData = await trackResponse.json();
                logger.info(`Tracking data: ${JSON.stringify(trackResponseData)}`);
            } catch (error) {
                logger.info(error.message);
            }
            // const { order_id, status, partner_info, order_timings, fare_details } = trackResponseData;

            // const dataToSave = {
            //     orderId: order_id,
            //     status: status,
            //     partner_info: JSON.stringify(partner_info),
            //     order_timings: JSON.stringify(order_timings),
            //     additional_comments: Fare Details: Estimated - ${fare_details.estimated_fare_details.minor_amount} ${fare_details.estimated_fare_details.currency}
            // };

            // try {
            //     const savedTrackingData = await api.khagatiThreePLShippingOrder.create({
            //         data: dataToSave
            //     });
            //     logger.info(Tracking data saved successfully: ${JSON.stringify(savedTrackingData)});
            // } catch (error) {
            //     logger.error(Error saving tracking data: ${error});
            // }
        } else {
            logger.error('No records found for the provided ERP store ID.');
        }
    } catch (error) {
        logger.error(`Error fetching store data or making the API request: ${error}`);
    }
};

/**
 * Parameters required for creating and tracking an order with Porter.
 *
 * @constant
 * @type {ActionOptions}
 * @property {string} orderId - The ID of the Shopify order that needs to be processed.
 * @property {string} erpStoreId - The ERP store ID used to fetch store details for the pickup location.
 */
export const params = {
    orderId: {
        type: "string"
    },
    erpStoreId: {
        type: "string"
    }
};