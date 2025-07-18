import { Alert } from '@shopify/polaris';
import { useState } from 'react';

// ... existing code ...

function AlertExample({ isSuccess, isError }) {
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertStatus, setAlertStatus] = useState('');

    // Call this function to trigger the alert based on the boolean values
    if (isSuccess) {
        setAlertTitle("Success");
        setAlertStatus("success");
        setShowAlert(true);
    } else if (isError) {
        setAlertTitle("Error");
        setAlertStatus("critical");
        setShowAlert(true);
    }

    return (
        <div>
            {showAlert && (
                <Alert
                    title={alertTitle}
                    onDismiss={() => setShowAlert(false)}
                    status={alertStatus}
                >
                    {alertStatus === "success" ? "Your action was successful!" : "There was an error with your action."}
                </Alert>
            )}
        </div>
    );
}

export default AlertExample;

// Example usage
// <AlertExample isSuccess={true} isError={false} />
// <AlertExample isSuccess={false} isError={true} />

// ... existing code ...