import { formatPhoneNumber } from "../../../web/util/commonFunctions";

const baseUrl = process.env.NODE_ENV === "production" ? process.env.TruePOS_URL : "https://dogmycats.true-pos.com/TruePOS/api/v1";
const authToken = process.env.NODE_ENV === "production" ? process.env.TruePOS_AuthToken : "9B9A7CD7C0FD271F6AD2147D8D73F68C1181E8EA2421B6053D44B0CD8C8C692F2776098819E69F43"
const headers = {
  'Content-Type': 'application/json',
  'X-Auth-Token': authToken,
};
/**
 * Main function to execute the customer data synchronization process.
 * 
 * @param {Object} context - The context object provided by the Gadget server, containing useful utilities such as params, logger, api, and connections.
 * @returns {Promise<void>} A promise that resolves when the entire synchronization process is completed.
 */
export async function run(context) {
  
  const { api, logger, params } = context;

  
  const shopifyOrderRecord = await api.shopifyOrder.findOne(params.orderId, {
    select: {
      shippingAddress: true,
      customer: {
        id : true,
      },
    }
  });

  const mobile = formatPhoneNumber(shopifyOrderRecord.shippingAddress.phone);
  
  let customerIdAvailability = `${baseUrl}/eCustomers?q=customerId==${shopifyOrderRecord.customer.id}`;
  let mobileAvailability = `${baseUrl}/eCustomers?q=mobile==${mobile}`;
  
  const response = await fetch( customerIdAvailability,
    {
      method: 'GET',
      headers 
    }
  );
  const data = await response.json();
  if (data?.eCustomers?.length > 0) { 
    const response = await fetch( mobileAvailability,
      {
        method: 'GET',
        headers 
      }
    )
    const data2 = await response.json();
    if (data2?.eCustomers?.length > 0) { 
      return "customerExist";
    } else {
      return "mobileMisMatch";
    }
  } else {
    return "customerNotFound";
  }
}

/** 
 * Action options configuration.
 * 
 * @type {Object} 
 */
export const params = {
  orderId: {
      type: "string"
  }
};