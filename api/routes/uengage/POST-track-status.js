// api/routes/uengage/track-status.js

import { RouteHandler } from "gadget-server";

/**
 * Route handler for POST uengage/track-status
 *
 * @type { RouteHandler } route handler - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const SECRET_KEY = "super-360-uengage-202411131054"; // Your shared secret key

const route = async ({ request, reply, api, logger }) => {
  // Log the incoming request body for debugging
  logger.info({ Request: request.body }, "Incoming request body:");

  // Get the secret key from the headers
  const incomingSecret = request.headers['x-uengage-secret'];

  // Validate the secret key
  if (incomingSecret !== SECRET_KEY) {
    logger.warn("Unauthorized access attempt: Invalid secret key.");
    return reply.status(403).send("Forbidden: Invalid secret key");
  }

  // Validate the incoming request body structure
  const { status, data, message, status_code } = request.body;

  // Check for missing or invalid values
  if (
    typeof status !== 'boolean' ||
    !data || 
    !data.taskId || 
    !data.orderId || 
    !data.rider_name || 
    !data.rider_contact || 
    !message || 
    !status_code
  ) {
    logger.warn("Invalid request body: Missing required fields.");
    return reply.status(400).send("Bad Request: Missing or invalid fields");
  }

  // If the validation is passed, proceed with processing the request
  logger.info("Processing order status update...");

  // Example: Here you can implement your logic to handle the order status
  // const orderStatusData = request.body; // You can extract and utilize this data

  // Respond with a success message
  await reply.status(200).send("Success: Order status processed");
  await api.uengageTrackSync({trackStatus: JSON.stringify(request.body)})
};

export const options = { timeoutMS: 900000, triggers: {} };

export default route;