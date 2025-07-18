/**
 * SettingsForm Component
 * 
 * This component renders a settings form for managing shipping and delivery configurations within the application.
 * It provides options for managing shipping rates, enabling or disabling delivery date automation, and configuring 
 * order routing and pickup point shipping settings.
 * 
 * Features:
 * - **Shipping Management:**
 *   - Displays existing shipping rates and allows editing and adding custom rates or destination restrictions.
 * - **Delivery Date Management:**
 *   - Allows toggling between automated and manual delivery date settings.
 * - **Order Routing:**
 *   - Provides information on the current routing rules and allows users to manage them.
 * - **Pickup Point Shipping:**
 *   - Allows customers to choose carrier pickup points for their orders.
 * 
 * Hooks:
 * - `useState`: Manages the state of toggles, modals, and flags for the form.
 * - `useGlobalAction`: Executes global actions like syncing shipping and delivery data.
 * 
 * Props:
 * - None.
 * 
 * Usage:
 * - This component is typically rendered within a route dedicated to shipping and delivery settings.
 * - It is accessed by users with permissions to manage shipping configurations.
 * 
 * Example:
 * - This component could be rendered when the user navigates to `/settings/shipping`.
 */

import React, { useState } from 'react';
import { api } from "../../api";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  Button,
  Link,
  ChoiceList,
  SettingToggle,
  TextContainer,
  Badge
} from '@shopify/polaris';
import { useFindMany, useGlobalAction, useUser } from "@gadgetinc/react";

function SettingsForm() {
  // This state and function are placeholders for your shipping rates and the useGlobalAction hook
  // Replace these with your actual state and actions from your application's state management
  const shippingRates = [
    { name: 'General products', rates: '2 zones', noRates: '1 location' }
  ];

  // Placeholder state for toggle settings
  const [deliveryDateAutomationEnabled, setDeliveryDateAutomationEnabled] = useState(false);
  const [manualDeliveryDatesEnabled, setManualDeliveryDatesEnabled] = useState(false);

  const [{ }, createShippingAndDelivery] = useGlobalAction(
    api.shippingAndDelivery
  );

  // State for the export/import modals or flags
  const [activeExport, setActiveExport] = useState(false);
  const [activeImport, setActiveImport] = useState(false);

  // The secondary actions for the Page component
  const secondaryActions = [
    { content: 'Inventory Sync', onAction: () => createShippingAndDelivery() },
    { content: 'Export', onAction: () => setActiveExport(!activeExport) },
    { content: 'Import', onAction: () => setActiveImport(true) }
  ];

  return (
    <Page
      title="Shipping and delivery"
      secondaryActions={secondaryActions}
    >
      <Layout>
        <Layout.Section>
          <Card title="Shipping" sectioned>
            <FormLayout>
              <FormLayout.Group>
                {shippingRates.map(rate => (
                  <ChoiceList
                    key={rate.name}
                    title={`${rate.name} shipping rates`}
                    choices={[{ label: 'All products', value: 'all_products' }]}
                    selected={[]}
                    allowMultiple
                  />
                ))}
                <Button>Edit</Button>
              </FormLayout.Group>
              <Link url="">Add custom rates or destination restrictions for groups of products.</Link>
            </FormLayout>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Expected delivery dates" sectioned>
            <SettingToggle
              action={{
                content: deliveryDateAutomationEnabled ? 'Disable' : 'Enable',
                onAction: () => setDeliveryDateAutomationEnabled(!deliveryDateAutomationEnabled),
              }}
              enabled={deliveryDateAutomationEnabled}
            >
              Automated delivery dates (Shop Promise)
            </SettingToggle>
            <SettingToggle
              action={{
                content: manualDeliveryDatesEnabled ? 'Disable' : 'Enable',
                onAction: () => setManualDeliveryDatesEnabled(!manualDeliveryDatesEnabled),
              }}
              enabled={manualDeliveryDatesEnabled}
            >
              Manual delivery dates
            </SettingToggle>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Order routing" sectioned>
            <TextContainer>
              Automatically route orders to optimize fulfillment.
              <Button plain>3 routing rules active</Button>
            </TextContainer>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Shipping to pickup points" sectioned>
            <TextContainer>
              Let customers pick up their orders from carrier pickup points.
              <Button plain>Manage</Button>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default SettingsForm;
