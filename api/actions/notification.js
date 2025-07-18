import { NotificationGlobalActionContext } from "gadget-server";

/**
 * Function to create and log a notification with markdown-formatted details in the Gadget server environment.
 * 
 * This function is designed to generate notifications that can be associated with a specific shop. 
 * It supports both success and error notifications, with details formatted using markdown.
 * 
 * @param {NotificationGlobalActionContext['api']} api - The Gadget API context, used to interact with the backend services
 * for creating notification logs.
 * 
 * @param {string} title - The title of the notification, providing a brief summary of the notification content.
 * 
 * @param {string} markdown - The markdown-formatted string that represents the detailed content of the notification.
 * 
 * @param {boolean} isSuccess - A flag indicating the type of notification: `true` for success and `false` for an error.
 * 
 * @param {string} shop - The identifier of the shop associated with the notification. This associates the notification
 * with a specific shop in the system.
 * 
 * @returns {Promise<void>} - The function is asynchronous and returns a Promise. It handles any errors during the 
 * notification creation process by logging them to the console.
 * 
 * @example
 * // Example usage of createNotification within a global action:
 * await createNotification(api, "Order Processed", "Order **#12345** was successfully processed.", true, "shop123");
 * 
 * // Example usage of createNotification within a global action function:
 * export async function run({ api, logger }) {
 *   const isSuccess = true;
 *   const shopValue = "exampleShopId";
 *   const markdownContent = "example _rich_ **text**";
 *   const title = "example value for notificationInfo";
 * 
 *   try {
 *     await createNotification(api, title, markdownContent, isSuccess, shopValue);
 *     logger.info("Success notification created.");
 *   } catch (error) {
 *     logger.error("Failed to create success notification:", error.message);
 *   }
 * }
 */
async function createNotification(api, title, markdown, isSuccess, shop) {
  try {
    await api.khagatiNotificationLog.create({
      notificationInfo: title,
      notificationDetails: {
        markdown: markdown, // Markdown content
      },
      notificationViewStatus: !isSuccess, // Assuming false indicates unread; adjust based on your logic
      logType: isSuccess ? 'info' : 'error', // Use 'info' for success, 'error' for failures
      shop: shop, // Associate the notification with a specific shop
      notificationType: 'setting'
    });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
}

/**
 * Example usage of createNotification within a global action function.
 * 
 * This function demonstrates how to use the `createNotification` helper function within a global action
 * in the Gadget server environment. It attempts to create a success notification with example data and logs 
 * the outcome.
 * 
 * @param {NotificationGlobalActionContext} context - The context object provided by the Gadget server, containing 
 * parameters, logger, API, and other resources for executing the global action.
 * 
 * @returns {Promise<void>} - The function is asynchronous and returns a Promise. It logs the result of the 
 * notification creation attempt.
 */
export async function run({ api, logger }) {
  // Example usage
  const isSuccess = true; // Example success flag
  const shopValue = "exampleShopId"; // Example shop value, adjust as needed

  if (isSuccess) {
    const markdownContent = "example _rich_ **text**";
    const title = "example value for notificationInfo";

    try {
      await createNotification(api, title, markdownContent, isSuccess, shopValue);
      logger.info("Success notification created.");
    } catch (error) {
      logger.error("Failed to create success notification:", error.message);
    }
  }
};

/** @type {ActionOptions} */
export const options = {};