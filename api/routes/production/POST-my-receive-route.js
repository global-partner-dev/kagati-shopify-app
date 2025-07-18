import { RouteHandler } from "gadget-server";

/**
 * Route handler for POST /my-receive-route
 *
 * @type { RouteHandler }
 */
const route = async ({ request, reply, api, logger }) => {
  const data = request.body.data;
  const modelName = request.body.modelName;
  logger.info({ data }, "Received data for processing in production");

  try {
    // Validate that the data is an array
    if (!Array.isArray(data)) {
      return reply.code(400).send({ error: "Invalid data format. Expected an array." });
    }

    logger.info(`Received ${data.length} items for processing.`);

    // Process each item
    for (const item of data) {
      try {
        // Create a new record in the specified model
        await api.internal[modelName].create({
          ...item
        });
        logger.info(`Successfully processed item with ID: ${item.id}`);
      } catch (error) {
        logger.error(`Error processing item with ID ${item.id}: ${error.message}`);
      }
    }

    return reply.code(200).send({ message: "Data processing completed successfully." });
  } catch (error) {
    logger.error("Error in data processing route:", error.message);
    return reply.code(500).send({ error: "Internal server error during data processing." });
  }
};

export const options = { timeoutMS: 900000, triggers: {} };

export default route;
