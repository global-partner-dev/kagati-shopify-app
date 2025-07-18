import { ActionOptions, GlobalActionContext } from "gadget-server";
import PushNotifications from "node-pushnotifications";

/**
 * @param { GlobalActionContext } context
 */

// VAPID keys for Web Push Authentication
const publicKey = "BNkRBxxkgNjp6nmVX-UvVXJhUXHN-OZS0xksjrxjYz0GrMekPPodpo4xQOgCp_cIweLGsiPniI9wPE8pzqE3uuM";
const privateKey = "jO_etMwTGlMOfCWGZqFdin2JCZdkfnO7b2DncGfVWbU";

export async function run({ params, logger, api, connections }) {   
    // Part 1: Setting up subscription and configuration
    let subscription;
    let settings;
    try {
        // Parse the subscription from parameters
        subscription = params.subscription;
        if (!subscription) {
            throw new Error("Subscription parameter is required");
        }

        // If subscription is a string, try to parse it as JSON
        if (typeof subscription === 'string') {
            try {
                subscription = JSON.parse(subscription);
            } catch (e) {
                logger.error("Failed to parse subscription as JSON", e);
                throw new Error("Invalid subscription format: must be a valid push subscription object");
            }
        }
        
        // Configure the Web Push settings without FCM dependency
        settings = {
            web: {
                vapidDetails: {
                    subject: "mailto:kei@asvinfomedia.com", // Contact email for VAPID
                    publicKey: publicKey,
                    privateKey: privateKey,
                },
                // No gcmAPIKey - we don't want to rely on Firebase
                TTL: 2419200, // Time-To-Live of notification in seconds (28 days)
                contentEncoding: "aes128gcm", // Modern encryption for web push
                headers: {},
            },
            isAlwaysUseFCM: false, // Explicitly avoid FCM when not needed
        };
        logger.info("Push notification settings configured successfully");
    } catch (error) {
        logger.error("Error in configuration setup:", error);
        throw new Error(`Configuration setup failed: ${error.message}`);
    }

    // Part 2: Creating push notification instance
    let push;
    try {
        push = new PushNotifications(settings);
        logger.info("Push notification instance created successfully");
    } catch (error) {
        logger.error("Error creating push notification instance:", error);
        throw new Error(`Push notification instance creation failed: ${error.message}`);
    }
    
    // Part 3: Sending notification
    try {
        // Define the notification payload
        const payload = { 
            title: "New Order Landed",
            body: "You have received a new notification",
            // Add any other notification properties as needed
        };
        
        // Convert callback-based method to Promise for better error handling
        const sendResult = await new Promise((resolve, reject) => {
            push.send(subscription, payload, (err, result) => {
                if (err) {
                    logger.error("Push notification error:", err);
                    reject(err);
                } else {
                    logger.info("Push notification sent successfully:", result);
                    resolve(result);
                }
            });
        });

        // Return success response with details
        return {
            subscription: subscription,
            payload: payload,
            result: sendResult,
            success: true
        };
    } catch (error) {
        logger.error("Error sending push notification:", error);
        // Return failure with details rather than throwing to provide better client response
        return {
            subscription: subscription,
            success: false,
            error: error.message
        };
    }
}

export const params = {
  subscription: {
    type: "string",
  }
};
