/**
 * EditPinCodePage Component
 *
 * This component provides a form to edit an existing pin code associated with a specific store. The component fetches
 * the current details of the pin code from the database based on the provided pin code ID, displays them in the form,
 * and allows the user to make updates. Upon submission, the updated pin code information is saved, and the user is
 * redirected to the pin code listing page with a success toast notification.
 *
 * Features:
 * - Fetches and displays the current pin code details (Store ID, Store Code, and Pin Code) for editing.
 * - Form submission triggers an API call to update the pin code details.
 * - Displays a loading spinner while fetching data.
 * - Redirects the user to the pin code listing page after successful submission.
 * - Displays a success toast notification upon updating the pin code.
 *
 * Usage:
 *
 * <EditPinCodePage />
 *
 * Dependencies:
 * - React hooks (useState, useEffect)
 * - Polaris components from Shopify (Page, Form, FormLayout, TextField, Button, Toast, Spinner)
 * - Gadget API for fetching and updating pin code records
 * - React Router for navigation (useNavigate, useParams)
 *
 * Example:
 * ```
 * <EditPinCodePage />
 * ```
 *
 * Props:
 * - No props are required. The component fetches the pin code ID from the URL parameters and handles the form submission
 *   and navigation internally.
 *
 * Note:
 * - Ensure that the API endpoints for fetching and updating a pin code (`api.khagatiPinCode.findOne` and `api.khagatiPinCode.update`)
 *   are correctly configured in the Gadget API.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Page,
    Form,
    FormLayout,
    TextField,
    Button,
    Toast,
    Spinner,
} from '@shopify/polaris';
import { api } from "../../../api";

const EditPinCodePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [pinCode, setPinCode] = useState('');
    const [storeId, setStoreId] = useState('');
    const [storeCode, setStoreCode] = useState('');
    const [toastActive, setToastActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPinCodeDetails = async () => {
            const response = await api.khagatiPinCode.findOne(id);
            const { storeId, storeCode, pinCode } = response;
            setStoreId(storeId);
            setStoreCode(storeCode);
            setPinCode(pinCode);
            setLoading(false);
        };
        fetchPinCodeDetails();
    }, [id]);

    const handleSubmit = async () => {
        await api.khagatiPinCode.update(id, {
            storeId,
            storeCode,
            pinCode
        });
        setToastActive(true);
        navigate('/pincodes');
    };

    const handleToastDismiss = () => setToastActive(false);

    if (loading) {
        return <Spinner accessibilityLabel="Loading" size="large" />;
    }

    return (
        <Page
            title="Edit Pincode"
            breadcrumbs={[{ content: 'Pincodes', url: '/pincodes' }]}
            primaryAction={{
                content: 'Save Pincode',
                onAction: handleSubmit,
            }}
        >
            <Form onSubmit={handleSubmit}>
                <FormLayout>
                    <TextField
                        label="Store ID"
                        value={storeId}
                        onChange={(value) => setStoreId(value)}
                        type="number"
                        autoComplete="off"
                    />
                    <TextField
                        label="Store Code"
                        value={storeCode}
                        onChange={(value) => setStoreCode(value)}
                        type="number"
                        autoComplete="off"
                    />
                    <TextField
                        label="Pin Code"
                        value={pinCode}
                        onChange={(value) => setPinCode(value)}
                        type="text"
                        autoComplete="off"
                    />
                    <Button variant="primary" submit>
                        Save Pin Code
                    </Button>
                </FormLayout>
            </Form>
            {toastActive && (
                <Toast content="Pincode updated successfully" onDismiss={handleToastDismiss} />
            )}
        </Page>
    );
};

export default EditPinCodePage;