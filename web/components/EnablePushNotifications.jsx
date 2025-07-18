import { useEffect } from "react";

const EnablePushNotifications = () => {
    useEffect(() => {
        if (!("Notification" in window)) {
            console.error("This browser does not support notifications");
            return;
        }

        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                console.log("Notification permission:", permission);
                
                if (permission === "granted") {
                    new Notification("Notifications Enabled!", {
                        body: "You will now receive notifications"
                    });
                }
            } catch (err) {
                console.error("Error requesting permission:", err);
            }
        };

        // Request permission when component mounts
        if (Notification.permission === "default") {
            requestPermission();
        }
    }, []);

    return null; // Component doesn't render anything
};

export default EnablePushNotifications;