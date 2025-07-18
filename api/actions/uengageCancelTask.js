import { UengageCancelTaskGlobalActionContext } from "gadget-server";
import { getUengageData } from "../../web/util/getUengageData";

/**
 * @param { UengageCancelTaskGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  // Your logic goes here
  const orderId = params.id;
  
  const splitOrderData = await api.khagatiOrderSplit.findMany({
    select: {
      erpStoreId: true,
      tplTaskId: true,
    },
    filter: {
      orderReferenceId: { equals: orderId },
    },
  });

  const erpStoreId = splitOrderData[0].erpStoreId;
  const tplTaskId = splitOrderData[0].tplTaskId;

  const url = "https://riderapi.uengage.in/cancelTask";

  const { UENGAGE_ACCESS_TOKEN, UENGAGE_STORE_ID } = await getUengageData(erpStoreId);
  const requestBody = {
      storeId: UENGAGE_STORE_ID,
      taskId: tplTaskId
  }

  const cancelResponse = await fetch(url, {
      method: "POST",
      headers: {
        'access-token': UENGAGE_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    logger.info({ cancelResponse }, "Cancel Task API Response:");
    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text();
      logger.error({ status: cancelResponse.status, errorText }, "Failed to fetch serviceability data");
      throw new Error(`Request failed with status ${cancelResponse.status}`);
    }
    const cancelResponseData = await cancelResponse.json();
    logger.info({ cancelResponseData }, "Cancel Task Response Received Successfully");
    
    if(!cancelResponseData.status) {
      return {error: cancelResponseData.msg};
    }
    // Parse and log the response data
    

    return cancelResponseData
};

// Define expected parameters for the function
export const params = {
  id: {
    type: "string",
  },
};
