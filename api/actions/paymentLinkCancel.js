import { PaymentLinkCancelGlobalActionContext } from "gadget-server";

/**
 * Function to execute the global action for canceling a payment link.
 * 
 * This function is designed to be used as a global action within the Gadget server environment. 
 * It handles the cancellation of an existing payment link by interacting with the necessary 
 * backend services and performing any required operations to successfully cancel the payment.
 * 
 * @param {PaymentLinkCancelGlobalActionContext} context - The context object containing parameters and resources
 * for executing the global action. The context includes:
 * 
 * @param {Object} context.params - Parameters passed to the global action, which typically include details
 * about the payment link to be canceled (e.g., payment link ID, reason for cancellation).
 * 
 * @param {Object} context.logger - Logger object that can be used to log information, warnings, errors, etc.,
 * during the execution of the action.
 * 
 * @param {Object} context.api - API object that provides methods for interacting with the Gadget server's backend services,
 * including making database queries, mutations, or other server-side operations necessary for canceling the payment link.
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
 *   params: { paymentLinkId: "abc123", reason: "Customer request" },
 *   logger: console,
 *   api: gadgetApi,
 *   connections: someDatabaseConnection
 * });
 * 
 * // The actual logic of this action should be implemented within the function body.
 */
export async function run({ params, logger, api, connections }) {
  
};
