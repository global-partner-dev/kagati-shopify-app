import { save, ActionOptions, SignInUserActionContext, applyParams } from "gadget-server";

/**
 * Main function to handle the sign-in process.
 * 
 * @param { SignInUserActionContext } context
 */
export async function run({ params, record, logger, api, session }) {
    try {
        // Log the incoming parameters for debugging
        logger.info({ params }, "Received parameters for sign-in:");

        // Apply parameters to the user record
        applyParams(params, record);

        // Update the last signed-in timestamp
        record.lastSignedIn = new Date();

        // Save the updated record
        await save(record);  

        // Set user session
        session.set("user", { _link: record.id });  

        logger.info("User signed in successfully, email verified.");
    } catch (error) {
        logger.error("Error in run function:", error);
        throw new Error("Failed to sign in user.");
    }
}

/**
 * Optional: Function to handle actions after successful sign-in.
 * 
 * @param { SignInUserActionContext } context
 */
export async function onSuccess({ params, record, logger, api }) {
    // Uncomment if you want to implement token generation
    /*
    try {
        const payload = {
            email: params.email,
            id: record.id,  // Include user ID in token payload
        };
        
        // Create a token with a defined expiration time
        const token = jwt.sign(payload, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' });
        logger.info({ token }, "Generated token:");

        return {
            result: token  // Return the generated token
        };
    } catch (error) {
        logger.error("Error generating token:", error);
        throw new Error("Failed to generate token.");
    }
    */
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { googleOAuthSignIn: true },
};
