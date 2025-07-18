import { timeStamp } from "console";
import { UengageTrackSyncGlobalActionContext } from "gadget-server";

/**
 * @param { UengageTrackSyncGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  try {
    // Parse the incoming trackStatus parameter
    const trackStatus = JSON.parse(params.trackStatus);
    logger.info({ trackStatus }, "Received track status:");

    // Destructure necessary fields from the trackStatus
    const { data, message, status, status_code } = trackStatus;
    // Destructure data fields
    const { orderId, rider_contact, rider_name, taskId,  tracking_url} = data;

    const orderData = await api.khagatiOrderSplit.findMany({
      select: {
        id: true,
        timeStamp:true
      },
      filter: {
        orderNumber: { equals: Number(orderId) }
      }
    })
    logger.info({splitOrderId: orderData[0].id}, "uengage track sync order id")
    const splitOrderId = orderData[0].id
    if (!orderData || orderData.length === 0) {
      logger.warn(`No records found for orderNumber: ${orderId}`);
      return; // Exit the function early
    }
    let orderStatus;
    if(status_code == "ALLOTTED") {
      orderStatus = "ready_for_pickup"
    }else if(status_code == "REACHED_PICKUP") {
      orderStatus = "ready_for_pickup"
    }else if(status_code == "DISPATCHED") {
      orderStatus = "out_for_delivery";
      await api.splitOrderOutForDelivery({id: splitOrderId})
    } else if(status_code == "ARRIVED_CUSTOMER_DOORSTEP") {
      orderStatus = "out_for_delivery"
    } else if(status_code == "DELIVERED") {
      orderStatus = "delivered"
      await api.splitOrderDelivered({id: splitOrderId})
    }
    // Create the request data object
    // const existingTimestamp = orderData[0]?.timeStamp || {}; // Ensure it's not null or undefined
    // const updatedTimestamp = {
    //   ...existingTimestamp,
    //   status_code: Date.now() // Add current timestamp
    // };
    const requestData = {
      tplStatus: status,
      tplStatusCode: status_code,
    	tplMessage: message,
      riderName: rider_name,
      riderContact: rider_contact,
      orderStatus: orderStatus,
      // timeStamp:updatedTimestamp
    };
    
    logger.info({ requestData }, "Request data to be updated:");
    

    // Update the order with the new information
    const response = await api.khagatiOrderSplit.update(orderData[0].id, {
      ...requestData, // Spread the requestData object
    });

    // Log the response from the update operation
    logger.info({ response }, "Order update in uengage track sync response:");

  } catch (error) {
    // Log the error if something goes wrong
    logger.error({ error }, "Error processing track status update:");
  }
};

// Define the expected parameters
export const params = {
  trackStatus: {
    type: "string",
  },
};

export const options = {
  // disable transactions for this action
  transactional: false,
  timeoutMS: 900000, 
  triggers: {}
}