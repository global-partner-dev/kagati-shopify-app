/**
 * AddPinCodePage Component
 *
 * This component provides a form to add a new pin code associated with a specific store. It allows users to input the
 * store ID, store code, and pin code, and then save this information to the database using the Gadget API. Upon
 * successful submission, the user is redirected to the list of pin codes, and a confirmation toast message is displayed.
 *
 * Features:
 * - Input fields for Store ID, Store Code, and Pin Code.
 * - Form submission triggers a database operation to create a new pin code.
 * - Redirects the user to the pin code listing page after successful submission.
 * - Displays a success toast notification upon adding the pin code.
 *
 * Usage:
 *
 * <AddPinCodePage />
 *
 * Dependencies:
 * - React hooks (useState)
 * - Polaris components from Shopify (Page, Form, FormLayout, TextField, Button, Toast)
 * - Gadget API for creating a new pin code record
 * - React Router for navigation (useNavigate)
 *
 * Example:
 * ```
 * <AddPinCodePage />
 * ```
 *
 * Props:
 * - No props are required. The component handles the form submission and navigation internally.
 *
 * Note:
 * - Ensure that the API endpoint for creating a pin code (`api.khagatiPinCode.create`) is correctly configured in the Gadget API.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page,
  Form,
  FormLayout,
  TextField,
  Button,
  Toast,
} from '@shopify/polaris';
import { api } from "../../../api";

const AddPinCodePage = () => {
  const navigate = useNavigate();
  const [pinCode, setPinCode] = useState('');
  const [storeId, setStoreId] = useState('');
  const [storeCode, setStoreCode] = useState('');
  const [toastActive, setToastActive] = useState(false);

  const handleSubmit = async () => {
    await api.khagatiPinCode.create({
      storeId,
      storeCode,
      pinCode
    })
    setToastActive(true);
    navigate('/pincodes');
  };

  const handleToastDismiss = () => setToastActive(false);

  return (
    <Page
      title="Add New Pincode"
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
            Add Pin Code
          </Button>
        </FormLayout>
      </Form>
      {toastActive && (
        <Toast content="Pincode added successfully" onDismiss={handleToastDismiss} />
      )}
    </Page>
  );
};

export default AddPinCodePage;
