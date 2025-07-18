/**
 * DeliveryCustomization Component
 * 
 * This component provides a form for creating or updating delivery customizations based on pincode and delivery type. 
 * It uses Shopify Polaris components for UI and integrates with the Gadget API for data management. The component handles 
 * form submission, error display, and navigation between pages.
 * 
 * @requires react-router-dom - For navigation and accessing URL parameters.
 * @requires @gadgetinc/react - For performing global actions with the Gadget API.
 * @requires @shopify/polaris - For UI components such as Page, FormLayout, TextField, Select, Button, and Banner.
 * @requires ../api - The API client for interacting with the backend (adjust the import path as necessary).
 * 
 * @returns {JSX.Element} A form for creating or updating delivery customizations.
 */

import { useState } from "react";
import {
  Banner,
  Card,
  FormLayout,
  Layout,
  Page,
  TextField,
  Select,
  Button,
} from "@shopify/polaris";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalAction } from "@gadgetinc/react";
import { api } from "../api"; // Adjust the import path as needed

const deliveryTypes = [
  { label: "Standard", value: "standard" },
  { label: "Express", value: "express" },
  { label: "Same Day", value: "same_day" },
];

export default function DeliveryCustomization() {
  const navigate = useNavigate();
  const { id, functionId } = useParams();
  const [pincode, setPincode] = useState("");
  const [deliveryType, setDeliveryType] = useState(deliveryTypes[0].value);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [{ data, fetching, error }, createOrUpdateDeliveryCustomization] = useGlobalAction(
    api.createOrUpdateDeliveryCustomization
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userErrors = await createOrUpdateDeliveryCustomization({
      id,
      functionId,
      pincode,
      deliveryType,
    });

    if (userErrors && userErrors.length > 0) {
      setErrors(userErrors);
    } else {
      navigate("/settings-form/customizations");
    }
    setIsLoading(false);
  };

  const errorBanner = errors.length ? (
    <Layout.Section>
      <Banner title="There was an error creating the customization." status="critical">
        <ul>
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      </Banner>
    </Layout.Section>
  ) : null;

  return (
    <Page
      title="Change delivery option"
      backAction={{
        content: "Delivery customizations",
        onAction: () => navigate("/settings-form/customizations"),
      }}
      primaryAction={{
        content: "Save",
        loading: isLoading,
        onAction: handleSubmit,
      }}
    >
      <Layout>
        {errorBanner}
        <Layout.Section>
          <Card>
            <form onSubmit={handleSubmit}>
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    name="pincode"
                    type="text"
                    label="Pincode"
                    value={pincode}
                    onChange={(value) => setPincode(value)}
                    disabled={isLoading}
                    requiredIndicator
                    autoComplete="on"
                  />
                  <Select
                    label="Delivery Type"
                    options={deliveryTypes}
                    value={deliveryType}
                    onChange={(value) => setDeliveryType(value)}
                    disabled={isLoading}
                  />
                </FormLayout.Group>
              </FormLayout>
              <Button
                primary
                submit
                loading={isLoading}
              >
                Save
              </Button>
            </form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}