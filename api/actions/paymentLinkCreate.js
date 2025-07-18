import { PaymentLinkCreateGlobalActionContext } from "gadget-server";
import axios from "axios";
import uniqid from "uniqid";
import sha256 from "sha256";

/**
 * Function to execute the global action for creating a payment link and initiating a payment process.
 * 
 * This function is designed to be used as a global action within the Gadget server environment. 
 * It handles the creation of a payment link and processes a payment request by interacting with 
 * an external payment service (PhonePe).
 * 
 * @param {PaymentLinkCreateGlobalActionContext} context - The context object containing parameters and resources
 * for executing the global action. The context includes:
 * 
 * @param {Object} context.params - Parameters passed to the global action, containing data needed for the payment process.
 * 
 * @param {Object} context.logger - Logger object that can be used to log information, warnings, errors, etc.,
 * during the execution of the action.
 * 
 * @param {Object} context.api - API object that provides methods for interacting with the Gadget server's backend services,
 * including database queries, mutations, or other server-side operations.
 * 
 * @param {Object} context.connections - Connections object that can be used to interact with other services or databases
 * connected to the Gadget server.
 * 
 * @returns {Promise<void>} - The function is asynchronous and returns a Promise. The function's logic should handle
 * any asynchronous operations, such as API calls, within its implementation.
 * 
 * @example
 * // Example usage of the run function:
 * await run({
 *   params: { amount: 10000, mobileNumber: "9999999999" },
 *   logger: console,
 *   api: gadgetApi,
 *   connections: someDatabaseConnection
 * });
 */
export async function run({ params, logger, api, connections }) {
  makePayment();
};

/**
 * Helper function to initiate a payment using PhonePe's API.
 * 
 * This function constructs a payment request payload, calculates the necessary security hash, 
 * and makes a POST request to the PhonePe API to initiate the payment process.
 * 
 * The function logs detailed information about the payload, encoded payload, security hash, 
 * and request options for debugging purposes. It also handles errors, logging the response data, 
 * status, and headers in case of an error, or the error message if the request fails before reaching the server.
 * 
 * @returns {Promise<void>} - The function is asynchronous and returns a Promise. The function handles 
 * the asynchronous HTTP request and error handling.
 */
const makePayment = async () => {
  // Constants and configuration for the PhonePe API request
  const PHONE_PE_HOST_URL = "https://api.phonepe.com/apis/hermes";
  const MERCHANT_ID = "M22N6OCS54FSL";
  const MERCHANT_TRANSACTION_ID = uniqid();
  const MERCHANT_USER_ID = "MUID123";
  const SALT_INDEX = 1;
  const SALT_KEY = "242d3f57-d0eb-4896-986d-7b84b4719e81";
  const PAY_END_POINT = "/pg/v1/pay";

  // Payload for the payment request
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: MERCHANT_TRANSACTION_ID,
    merchantUserId: MERCHANT_USER_ID,
    amount: 10000,
    redirectUrl: `https://admin.shopify.com/store/asv-gadget/apps/kaghati-v4/orders/${MERCHANT_TRANSACTION_ID}`,
    redirectMode: "REDIRECT",
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE"
    }
  };

  // Encoding and security hash calculation
  const bufferObject = Buffer.from(JSON.stringify(payload), "utf-8");
  const base64Payload = bufferObject.toString("base64");
  const X_VERIFY = sha256(base64Payload + PAY_END_POINT + SALT_KEY) + "###" + SALT_INDEX;

  // Configuration options for the HTTP request
  const options = {
    method: "post",
    url: `${PHONE_PE_HOST_URL}${PAY_END_POINT}`,
    headers: {
      accept: "text/plain",
      "Content-Type": "application/json",
      "X-Verify": X_VERIFY
    },
    data: {
      request: base64Payload
    }
  };

  // Detailed logging for debugging purposes
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("Base64 Encoded Payload:", base64Payload);
  console.log("X-Verify:", X_VERIFY);
  console.log("Request Options:", JSON.stringify(options, null, 2));

  // Making the HTTP request and handling the response or errors
  try {
    const response = await axios.request(options);
    console.log("Response Data:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Response Error Data:", error.response.data);
      console.error("Response Error Status:", error.response.status);
      console.error("Response Error Headers:", error.response.headers);
    } else {
      console.error("Error Message:", error.message);
    }
  }
};