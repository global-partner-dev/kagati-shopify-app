/**
 * SettingsPage Component
 * 
 * This component is responsible for rendering the settings page of the application. It allows users 
 * to view and update various settings grouped by categories. It also triggers inventory and store 
 * price synchronization actions when certain settings are modified.
 * 
 * Features:
 * - **Settings Management:** 
 *   - Fetches and displays settings grouped by categories from the API.
 *   - Supports text and select inputs for different types of settings.
 *   - Allows users to edit and save changes to settings.
 * - **Synchronous Actions:**
 *   - Triggers inventory and store price synchronization if specific settings are modified.
 * - **UI Elements:**
 *   - Provides a save button that is enabled when there are unsaved changes.
 *   - Displays a banner notification when a sync operation is in progress or completed.
 * 
 * Hooks:
 * - `useFindMany`: Fetches data from the API for settings and setting groups.
 * - `useGlobalAction`: Executes global actions such as inventory and store price sync.
 * - `useState`: Manages the state of edited fields, loading indicators, and banners.
 * - `useEffect`: Handles data initialization and synchronization status updates.
 * 
 * Props:
 * - None.
 * 
 * Usage:
 * - This component is typically rendered within a route dedicated to application settings.
 * - It is accessed by users with permissions to view and modify application settings.
 * 
 * Example:
 * - This component could be rendered when the user navigates to `/settings`.
 */

import { Page, BlockStack, InlineGrid, Box, Text, Card, TextField, Select, Button, Banner } from '@shopify/polaris';
import { useFindMany, useGlobalAction } from "@gadgetinc/react";
import { useState, useEffect } from 'react';
import { api } from "../../api";
import { findDifferenceArray } from '../../util/commonFunctions';

const SettingsPage = () => {
  const [{ data: settingGroups}] = useFindMany(api.khagatiSettingGroup);
  const [{ data: settings }] = useFindMany(api.khagatiSetting);
  const [editedFields, setEditedFields] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [isBanner, setIsBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [{ data: shopifyInventorySyncData, fetching: shopifyInventorySyncFetching, error: shopifyInventorySyncError }, createHybridStock] = useGlobalAction(
    api.shopifyInventorySync
  );

  const [{ data: shopifyStorePriceSyncData, fetching: shopifyStorePriceSyncFetching, error: shopifyStorePriceSyncError }, createStorePrice] = useGlobalAction(
    api.shopifyStorePriceSync
  );

  const inventorySync = async () => {
    await createHybridStock();
  };

  const storePriceSync = async () => {
    await createStorePrice();
  }

  const options = [
    { label: 'Cluster', value: 'cluster' },
    { label: 'Primary With Backup', value: 'primary_with_backup' },
    { label: 'Primary', value: 'primary' },
  ];

  const handleChange = (id, newValue) => {
    setEditedFields(prev => {
      const newFields = [...prev];
      const field = newFields.find(field => field.id === id);
      if (field) {
        field.value = newValue;
      }
      return newFields;
    });
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const updateRequestData = findDifferenceArray(editedFields, settings);
    if (updateRequestData.some(item => item.id === "7")) {
      setIsBanner(true);
      inventorySync();
      storePriceSync();
    } else {
      setIsLoading(false);
    }
    const saveSettings = await api.khagatiSetting.bulkUpdate(updateRequestData);
    if (saveSettings) {
      setIsSaved(true);
      
      setTimeout(() => {
        setIsSaved(false);
      }, 3000); 
    }
  };

  const resetData = () => {
    setEditedFields(settings);
    setIsEditing(false);
  };

  useEffect(() => {
    if (settings) {
      const data = settings?.map(({ id, value, title, GID, type, description, options }) => ({ id, value, title, GID, type, description, options }));
      setEditedFields(data);
    }
  }, [settings]);

  useEffect(() => {
    if (!shopifyInventorySyncFetching && !shopifyStorePriceSyncFetching) {
      setIsLoading(false);
      setIsSyncing(true);
      setTimeout(() => {
        setIsBanner(false);
        setIsSyncing(false);
      }, 3000);
    }
  }, [shopifyInventorySyncFetching, shopifyInventorySyncFetching]);

  // useEffect(() => {

  // })

  return (
    <Page
      fullWidth
      compactTitle
      title="Settings"
      primaryAction={isEditing && <Button onClick={handleSubmit} loading={isloading} variant='primary'>Save</Button>}
      secondaryActions={isEditing && <Button onClick={resetData}>Cancel</Button>}
    >
      <Box>
        {isBanner && <Banner
          title={isSyncing ? "Store Price & Inventory Sync Completed" : "Store Price & Inventory Sync is in progress"}
          tone={isSyncing ? "success" : "warning"}
        />}
      </Box>
      <Box>
        {isSaved && <Banner
          title={"Setting saved successfully"}
          tone={"success"}
        />}
      </Box>
      {settingGroups?.map(({ id, title, description, GID }) => (
        <Box paddingBlock="300" key={id}>
          <BlockStack gap={{ xs: "800", sm: "400" }}>
            <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
              <Box
                as="section"
                paddingInlineStart={{ xs: 400, sm: 0 }}
                paddingInlineEnd={{ xs: 400, sm: 0 }}
              >
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    {title}
                  </Text>
                  <Text as="span" variant="bodyLg">
                    {description?.markdown}
                  </Text>
                </BlockStack>
              </Box>
              <Card roundedAbove="sm">
                {editedFields && editedFields.filter(setting => setting.GID === GID)?.map(({ id, value, title, type, description, options }, index) => (
                  <Box paddingBlockStart={index === 0 ? "0" : "500"} key={id}>
                    <BlockStack gap="100">
                      <Text as="h3" variant="headingMd">
                        {title}
                      </Text>
                      <Text as="span" variant="bodyLg">
                        {description?.markdown}
                      </Text>
                      {type === "text" ? (
                        <TextField
                          value={value}
                          onChange={(newValue) => handleChange(id, newValue)}
                        />
                      ) : type === "select" ? (
                        <Select
                          options={options?.selectOptions}
                          onChange={(value) => {
                            handleChange(id, value)
                          }}
                          value={value}
                        />
                      ) : null}
                    </BlockStack>
                  </Box>
                ))}
              </Card>
            </InlineGrid>
          </BlockStack>
        </Box>
      ))}
    </Page>
  );
};

export default SettingsPage;
