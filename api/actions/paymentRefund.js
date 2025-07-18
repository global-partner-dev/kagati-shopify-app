import { PaymentRefundGlobalActionContext } from "gadget-server";

/**
 * Executes the Payment Refund action.
 * 
 * This function initiates the process of making a refund using the PhonePe API. It constructs the necessary payload,
 * computes the verification signature, and makes an HTTP request to PhonePe's sandbox API to process the refund.
 * The action logs the request and handles errors appropriately.
 * 
 * @async
 * @function run
 * @param {PaymentRefundGlobalActionContext} context - The context object provided by Gadget Server.
 * @param {object} context.params - Parameters provided to the global action.
 * @param {object} context.logger - A logger object for recording informational and error messages during execution.
 * @param {object} context.api - An API object containing methods for interacting with the Gadget platform.
 * @param {object} context.connections - An object containing connections to external services.
 * 
 * @returns {Promise<void>} A promise that resolves when the refund process is complete.
 * 
 * @throws {Error} If an error occurs during the refund process, it is logged and handled within the function.
 */
export async function run({ params, logger, api, connections }) {
  // Initiate the refund process by calling makeRefund function
  logger.info("Initiating refund process");
  makeRefund();
}

/**
 * Initiates the refund request to PhonePe's sandbox API.
 * 
 * This function constructs the necessary refund payload, encodes the data in base64 format, computes the 
 * verification signature using the SHA-256 hash algorithm, and sends the refund request to PhonePe. 
 * The function logs the request and handles any errors that occur during the process.
 * 
 * @async
 * @function makeRefund
 * @returns {Promise<void>} A promise that resolves when the refund process is complete.
 * 
 * @throws {Error} If an error occurs during the API request, it is logged and handled within the function.
 * Refund Confirmation
 */
const makeRefund = async () => {
  const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"; // PhonePe sandbox URL
  const MERCHANT_ID = "PGTESTPAYUAT"; // Merchant ID for PhonePe sandbox
  const MERCHANT_TRANSACTION_ID = uniqid(); // Unique transaction ID generated for the refund
  const MERCHANT_USER_ID = "MUID123"; // Merchant user ID for identification
  const SALT_INDEX = 1; // Salt index for signature computation
  const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"; // Salt key for signature computation
  const REFUND_END_POINT = "/pg/v1/refund"; // API endpoint for refunds

  // Constructing the refund request payload
  const payload = {
    merchantId: MERCHANT_ID,
    merchantUserId: MERCHANT_USER_ID,
    originalTransactionId: MERCHANT_TRANSACTION_ID,
    merchantTransactionId: MERCHANT_TRANSACTION_ID,
    amount: 10000, // Amount to be refunded (in minor units)
    redirectMode: "REDIRECT",
    callbackUrl: "https://webhook.site/callback-url", // Callback URL for the refund response
  }

  // Encoding the payload in base64 format
  const bufferObject = Buffer.from(JSON.stringify(payload), "utf-8");
  const base63EncodedPayload = bufferObject.toString("base64");

  // Compute the verification signature
  const X_VERIFY = sha256(base63EncodedPayload + REFUND_END_POINT + SALT_KEY) + "###" + SALT_INDEX;

  // Define options for the API request
  const options = {
    method: "post",
    url: `${PHONE_PE_HOST_URL}${REFUND_END_POINT}`,
    headers: {
      accept: "text/plain",
      "Content-Type": "application/json",
      "X-Verify": X_VERIFY // Signature for request verification
    },
    data: {
      request: base63EncodedPayload // Base64 encoded payload for refund request
    }
  };

  // Logging the request options for debugging purposes
  console.log(options, "options");

  // Sending the API request to PhonePe
  try {
    const response = await axios.request(options); // Making the HTTP request
    console.log(response.data); // Logging the response data
  } catch (error) {
    console.log("Error occurred during the refund request");
    console.error(error); // Logging the error details
  }
};


// export async function onSuccess({ params, record, logger, api, connections }) {
//   // Your logic goes here
//   logger.info(params, "params in ");
//   logger.info(record, "record");
//   const orderRefId = JSON.parse(params.splitOrderData)[0].orderReferenceId
//   logger.info(orderRefId, "orderRefId");

//   const shopifyOrderResponse = await api.shopifyOrder.findOne(orderRefId, {
//     select: {
//       id: true,
//       email: true,
//       shippingAddress: true
//     }
//   })


//   logger.info(shopifyOrderResponse, "shopifyOrderResponse");
//   const phoneNumber = shopifyOrderResponse.shippingAddress.phone
//   const email = shopifyOrderResponse.email
//   const cName = shopifyOrderResponse.shippingAddress.first_name + " " + shopifyOrderResponse.shippingAddress.last_name

//   const tId = "1";


//   const responseKhagatiSMS = await api.khagatiSMS({ cName, phoneNumber, tId });
// }