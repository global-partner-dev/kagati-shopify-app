/**
 * AddStore Component
 * 
 * This component provides a comprehensive interface for adding a new store. It includes sections for entering store 
 * details, managing working hours, setting up delivery options, and visualizing the store's location on a Google Map 
 * with configurable coverage radii.
 * 
 * State:
 * - `selectedTab` (number): Tracks the currently selected tab (Location Details, Listed Products, Working Hours, Connected Pincodes).
 * - `selectedDay` (string): Tracks the currently selected day for managing time slots (defaults to "Mon").
 * - `selectedDeliveryOption` (string): Tracks the currently selected delivery option (e.g., "localDelivery").
 * - `isOpen` (boolean): Controls whether the store is marked as open for the selected day.
 * - `startTime` (string): Placeholder for future time slot management (currently unused).
 * - `endTime` (string): Placeholder for future time slot management (currently unused).
 * - `timeSlots` (array): Placeholder for storing time slots (currently unused).
 * - `cardHeight` (string): Controls the height of certain cards (currently unused).
 * - `newStartTime` (string): Tracks the new start time for adding a time slot.
 * - `newEndTime` (string): Tracks the new end time for adding a time slot.
 * - `selectedDeliveryTabIndex` (number): Tracks the currently selected delivery option tab.
 * - `radiusValues` (object): Stores the current values for the store's delivery radii (R1, R2, R3).
 * - `actualRadiusValues` (object): Stores the actual values for the delivery radii after validation.
 * - `showR2` (boolean): Controls the visibility of the R2 radius circle on the map.
 * - `showR3` (boolean): Controls the visibility of the R3 radius circle on the map.
 * - `storeData` (object): Contains all the input data for the store, including name, address, working hours, delivery radii, and more.
 * - `toastActive` (boolean): Controls the visibility of a toast notification upon successful store addition.
 * 
 * Hooks:
 * - `useNavigate`: React Router hook used for programmatic navigation after a successful store creation.
 * - `useParams`: React Router hook used to access route parameters (not currently used in this component).
 * - `useLoadScript`: Hook from `@react-google-maps/api` to load the Google Maps script.
 * - `useAction`: Hook from `@gadgetinc/react` for performing a create action on the store API.
 * - `useEffect`: Used to synchronize the radius values with the store data and initialize other states.
 * 
 * Handlers:
 * - `handleChange`: Updates the store data state when input fields change.
 * - `handleRadiusChange`: Validates and updates the delivery radii values.
 * - `handleSubmit`: Sends a request to create the store with the current form data.
 * - `handleMapClick`: Updates the store's latitude and longitude based on where the user clicks on the map.
 * - `addTimeSlot`: Adds a new time slot to the selected day's schedule.
 * - `removeTimeSlot`: Removes a specific time slot from the selected day's schedule.
 * - `clearSlots`: Clears all time slots for the selected day.
 * - `toggleToastActive`: Toggles the visibility of the success toast notification.
 * - `handleTabChange`: Switches between the main tabs (Location Details, Listed Products, Working Hours, Connected Pincodes).
 * - `handleDaySelection`: Switches between days for managing working hours.
 * - `handleDeliveryTabChange`: Switches between delivery options tabs (Local Delivery, Store Pickup, Standard Delivery).
 * - `getFullDayName`: Returns the full name of a day given its abbreviation.
 * 
 * Render:
 * - The component renders a `Page` layout with several `Card` components, each containing forms and controls for various aspects 
 *   of the store setup, including store details, Google Maps integration, working hours management, and radius configuration.
 * 
 * Usage:
 * - This component is intended for use in an admin interface where users can add new stores, configure their delivery options, 
 *   and set their working hours. It integrates with Google Maps to allow the user to visually adjust the store's location and 
 *   delivery coverage.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Form,
  Frame,
  Toast,
  Card,
  Page,
  Select,
  Checkbox,
  Tabs,
  Spinner,
  BlockStack,
  InlineStack,
  FormLayout,
  Divider,
  Text,
  ButtonGroup,
  RangeSlider,
  Box,
  Icon,
} from "@shopify/polaris";
import { GoogleMap, useLoadScript, Circle, Polygon, Marker } from "@react-google-maps/api";
import { useAction } from "@gadgetinc/react";
import { QuestionCircleIcon, DeleteIcon } from "@shopify/polaris-icons";
import { api } from "../../../api";

const libraries = ["places"];

const AddStore = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDay, setSelectedDay] = useState("Mon"); // Default to Monday
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("localDelivery");
  const [isOpen, setIsOpen] = useState(true);
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [timeSlots, setTimeSlots] = useState([]);
  const [cardHeight, setCardHeight] = useState("100%");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [selectedDeliveryTabIndex, setSelectedDeliveryTabIndex] = useState(0);
  const [radiusValues, setRadiusValues] = useState({ R1: 3000, R2: 5000, R3: 7000 });
  const [actualRadiusValues, setActualRadiusValues] = useState({ R1: 3000, R2: 5000, R3: 7000 });
  const [showR2, setShowR2] = useState(true);
  const [showR3, setShowR3] = useState(true);

  const [storeData, setStoreData] = useState({
    storeName: "",
    storeCode: "",
    storeTier: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    mobNumber: "",
    email: "abc@gmail.com",
    isBackupWarehouse: false,
    selectBackupWarehouse: "",
    status: "",
    erpStoreId: "",
    localDelivery: {
      Mon: { isOpen: false, timeSlots: [] },
      Tue: { isOpen: false, timeSlots: [] },
      Wed: { isOpen: false, timeSlots: [] },
      Thu: { isOpen: false, timeSlots: [] },
      Fri: { isOpen: false, timeSlots: [] },
      Sat: { isOpen: false, timeSlots: [] },
      Sun: { isOpen: false, timeSlots: [] },
    },
    lat: 0,
    lng: 0,
    googleMap: "",
    radius: { R1: 3, R2: 5, R3: 7 },
  });
  const [toastActive, setToastActive] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [{ data, fetching, error }, create] = useAction(api.khagatiStores.create);

  useEffect(() => {
    setRadiusValues(storeData.radius || { R1: 3000, R2: 5000, R3: 7000 });
  }, [storeData]);

  const handleChange = (value, field) => {
    if (field === 'radius') {
      setStoreData((prevStoreData) => ({ ...prevStoreData, radius: { ...prevStoreData.radius, ...value } }));
      setRadiusValues((prevValues) => ({ ...prevValues, ...value }));
    } else {
      const newValue = (field === 'lat' || field === 'lng') ? Number(value) : value;
      setStoreData((prevStoreData) => ({ ...prevStoreData, [field]: newValue }));
    }
  };




  const handleRadiusChange = (key, value) => {
    setActualRadiusValues((prevValues) => {
      const newValues = { ...prevValues, [key]: value };
      if (key === "R1" && value >= newValues.R2) {
        newValues.R1 = newValues.R2 - 1;
      } else if (key === "R2") {
        if (value <= newValues.R1) {
          newValues.R2 = newValues.R1 + 1;
        }
        if (value >= newValues.R3) {
          newValues.R2 = newValues.R3 - 1;
        }
      } else if (key === "R3" && value <= newValues.R2) {
        newValues.R3 = newValues.R2 + 1;
      }
      setStoreData((prevStoreData) => ({
        ...prevStoreData,
        radius: newValues,
      }));
      return newValues;
    });
  };

  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  const handleSubmit = async () => {
    try {
      // Ensure required fields are set to default values if empty
      const statusValue = storeData.status || "Inactive"; // Default to "Inactive" if status is empty
      const googleMapValue = storeData.googleMap || ""; // Use an empty string if googleMap is not provided
      
      // Validation logic (for example, make sure googleMap is valid if not empty)
      const isValidGoogleMap = googleMapValue === "" || isValidURL(googleMapValue);

      if (!isValidGoogleMap) {
        console.error("Invalid Google Map URL");
        return;
      }

      // Proceed with saving the data
      const response = await create({
        storeName: storeData.storeName || "", // Allow empty strings
        storeCode: storeData.storeCode || "",
        storeTier: storeData.storeTier || "",
        erpStoreId: storeData.erpStoreId || "",
        address: storeData.address || "",
        city: storeData.city || "",
        state: storeData.state || "",
        pinCode: storeData.pinCode || "",
        mobNumber: storeData.mobNumber || "",
        email: storeData.email || "",
        isBackupWarehouse: storeData.isBackupWarehouse || false,
        selectBackupWarehouse: storeData.selectBackupWarehouse || "",
        status: statusValue, // Use the validated default value for status
        localDelivery: storeData.localDelivery || {},
        lat: storeData.lat ?? 0, // Allow 0 for latitude
        lng: storeData.lng ?? 0, // Allow 0 for longitude
        googleMap: googleMapValue, // Use the validated default value for googleMap
        radius: storeData.radius || { R1: 3000, R2: 5000, R3: 7000 },
      });

      console.log(storeData, "response");

      if (response) {
        setToastActive(true);
        console.log("Store added successfully:", response);
        setTimeout(() => navigate("/stores"), 1500);
      }
    } catch (error) {
      console.error("An error occurred during the update:", error);
    }
  };



  const handleMapClick = (event) => {
    setStoreData((prevStoreData) => ({
      ...prevStoreData,
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    }));
  };

  const addTimeSlot = () => {
    if (newStartTime >= newEndTime) {
      alert("Start time must be before end time.");
      return;
    }
    setStoreData((prevStoreData) => ({
      ...prevStoreData,
      localDelivery: {
        ...prevStoreData.localDelivery,
        [selectedDay]: {
          ...prevStoreData.localDelivery[selectedDay],
          timeSlots: [...prevStoreData.localDelivery[selectedDay].timeSlots, { start: newStartTime, end: newEndTime }],
        },
      },
    }));
    setNewStartTime('');
    setNewEndTime('');
  };

  const removeTimeSlot = (day, slotIndex) => {
    setStoreData((prevStoreData) => {
      const slots = [...prevStoreData.localDelivery[day].timeSlots];
      slots.splice(slotIndex, 1);
      return {
        ...prevStoreData,
        localDelivery: {
          ...prevStoreData.localDelivery,
          [day]: {
            ...prevStoreData.localDelivery[day],
            timeSlots: slots,
          },
        },
      };
    });
  };

  const clearSlots = () => {
    setStoreData((prevStoreData) => ({
      ...prevStoreData,
      localDelivery: {
        ...prevStoreData.localDelivery,
        [selectedDay]: {
          ...prevStoreData.localDelivery[selectedDay],
          timeSlots: [],
        },
      },
    }));
  };

  const toggleToastActive = () => setToastActive(!toastActive);

  const handleTabChange = (selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  };

  const handleDaySelection = (day) => {
    setSelectedDay(day);
  };

  const handleDeliveryTabChange = (selectedTabIndex) => {
    setSelectedDeliveryTabIndex(selectedTabIndex);
  };

  const getFullDayName = (dayAbbreviation) => {
    const daysMap = {
      'Mon': 'MONDAY',
      'Tue': 'TUESDAY',
      'Wed': 'WEDNESDAY',
      'Thu': 'THURSDAY',
      'Fri': 'FRIDAY',
      'Sat': 'SATURDAY',
      'Sun': 'SUNDAY',
    };

    return daysMap[dayAbbreviation] || dayAbbreviation;
  };


  const WAREHOUSES = [
    { label: "Warehouse 1", value: "warehouse1" }
  ];

  const INDIAN_STATES_AND_UT = [
    { label: "Andhra Pradesh", value: "Andhra Pradesh" },
    { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
    { label: "Assam", value: "Assam" },
    { label: "Bihar", value: "Bihar" },
    { label: "Chhattisgarh", value: "Chhattisgarh" },
    { label: "Goa", value: "Goa" },
    { label: "Gujarat", value: "Gujarat" },
    { label: "Haryana", value: "Haryana" },
    { label: "Himachal Pradesh", value: "Himachal Pradesh" },
    { label: "Jharkhand", value: "Jharkhand" },
    { label: "Karnataka", value: "Karnataka" },
    { label: "Kerala", value: "Kerala" },
    { label: "Madhya Pradesh", value: "Madhya Pradesh" },
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Manipur", value: "Manipur" },
    { label: "Meghalaya", value: "Meghalaya" },
    { label: "Mizoram", value: "Mizoram" },
    { label: "Nagaland", value: "Nagaland" },
    { label: "Odisha", value: "Odisha" },
    { label: "Punjab", value: "Punjab" },
    { label: "Rajasthan", value: "Rajasthan" },
    { label: "Sikkim", value: "Sikkim" },
    { label: "Tamil Nadu", value: "Tamil Nadu" },
    { label: "Telangana", value: "Telangana" },
    { label: "Tripura", value: "Tripura" },
    { label: "Uttar Pradesh", value: "Uttar Pradesh" },
    { label: "Uttarakhand", value: "Uttarakhand" },
    { label: "West Bengal", value: "West Bengal" },
    { label: "Andaman and Nicobar Islands", value: "Andaman and Nicobar Islands" },
    { label: "Chandigarh", value: "Chandigarh" },
    { label: "Dadra and Nagar Haveli and Daman and Diu", value: "Dadra and Nagar Haveli and Daman and Diu" },
    { label: "Delhi", value: "Delhi" },
    { label: "Lakshadweep", value: "Lakshadweep" },
    { label: "Puducherry", value: "Puducherry" },
    { label: "Ladakh", value: "Ladakh" },
  ];


  const tabs = [
    { id: 'location-details', content: 'Location Details', panelID: 'location-details-panel' },
    { id: 'product-details', content: 'Listed Products', panelID: 'product-details-panel' },
    { id: 'working-hours', content: 'Working Hours', panelID: 'working-hours-panel' },
    { id: 'pincode-details', content: 'Connected Pincodes', panelID: 'pincode-detail-panel' },
  ];


  const deliveryOptionTabs = [
    { id: 'local-delivery', content: 'Local Delivery', panelID: 'local-delivery-panel' },
    { id: 'store-pickup', content: 'Store Pickup', panelID: 'store-pickup-panel' },
    { id: 'standard-delivery', content: 'Standard Delivery', panelID: 'standard-delivery-panel' },
  ];


  if (fetching) return <Spinner accessibilityLabel="Loading store" size="large" />;
  if (error) return <div>Error loading store: {error.message}</div>;
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  return (
    <Frame>
      <div>
        <Card>
          <Tabs
            tabs={tabs}
            selected={selectedTab}
            onSelect={handleTabChange}
          ></Tabs>
          <div style={{ marginLeft: "-35px", marginRight: "-35px", padding: "20px" }}>
            {selectedTab === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  height: "90%",
                }}
              >
                <div style={{ flex: 1, marginRight: "2%" }}>
                  <Card title="Store Details" sectioned>
                    <Form>
                      <BlockStack gap="200">
                        <TextField
                          style={{ marginBottom: "5%" }}
                          label="Store Name"
                          value={storeData.storeName}
                          onChange={(e) => handleChange(e, "storeName")}
                          autoComplete="off"
                        />
                        <TextField
                          label="Store Code"
                          value={storeData.storeCode}
                          onChange={(e) => handleChange(e, "storeCode")}
                          autoComplete="off"
                        />
                        <TextField
                          label="Store Tier"
                          value={storeData.storeTier}
                          onChange={(e) => handleChange(e, "storeTier")}
                          autoComplete="off"
                        />
                        <TextField
                          label="ERP Store ID"
                          value={storeData.erpStoreId}
                          onChange={(e) => handleChange(e, "erpStoreId")}
                          autoComplete="off"
                        />
                        <TextField
                          label="Address"
                          value={storeData.address}
                          onChange={(e) => handleChange(e, "address")}
                          autoComplete="off"
                        />
                        <TextField
                          label="City"
                          value={storeData.city}
                          onChange={(e) => handleChange(e, "city")}
                          autoComplete="off"
                        />
                        <Select
                          label="State"
                          options={INDIAN_STATES_AND_UT}
                          value={storeData.state}
                          onChange={(value) => handleChange(value, "state")}
                        />
                        <TextField
                          label="Pincode"
                          value={storeData.pinCode}
                          onChange={(e) => handleChange(e, "pinCode")}
                          autoComplete="off"
                        />
                        <TextField
                          label="Phone"
                          value={storeData.mobNumber}
                          onChange={(e) => handleChange(e, "mobNumber")}
                          autoComplete="off"
                        />
                        <TextField
                          label="Email"
                          value={storeData.email}
                          onChange={(e) => handleChange(e, "email")}
                          autoComplete="off"
                        />
                        <Checkbox
                          label="Is Backup Warehouse"
                          checked={storeData.isBackupWarehouse}
                          onChange={(e) => handleChange(e, "isBackupWarehouse")}
                        />

                        {!storeData.isBackupWarehouse && (
                          <Select
                            label="Select Backup Warehouse"
                            options={WAREHOUSES}
                            value={storeData.selectBackupWarehouse}
                            onChange={(e) => handleChange(e, "selectBackupWarehouse")}
                          />
                        )}
                        <Select
                          label="Status"
                          options={[
                            { label: "Active", value: "Active" },
                            { label: "Inactive", value: "Inactive" }
                          ]}
                          value={storeData.status}
                          onChange={(e) => handleChange(e, "status")}
                        />
                        <TextField
                          label="Latitude"
                          value={String(storeData.lat)}
                          onChange={(e) => handleChange(Number(e), "lat")}
                          type="number"
                          autoComplete="off"
                        />
                        <TextField
                          label="Longitude"
                          value={String(storeData.lng)}
                          onChange={(e) => handleChange(Number(e), "lng")}
                          type="number"
                          autoComplete="off"
                        />
                        <TextField
                          label="Google Map URL"
                          value={storeData.googleMap || GoogleMap}
                          onChange={(e) => handleChange(e, "googleMap")}
                          autoComplete="off"
                        />
                        <TextField
                          label="Radius R1 (meters)"
                          type="number"
                          value={radiusValues.R1}
                          onChange={(value) => handleChange({ R1: Number(value) }, "radius")}
                          autoComplete="off"
                        />
                        <TextField
                          label="Radius R2 (meters)"
                          type="number"
                          value={radiusValues.R2}
                          onChange={(value) => handleChange({ R2: Number(value) }, "radius")}
                          autoComplete="off"
                        />
                        <TextField
                          label="Radius R3 (meters)"
                          type="number"
                          value={radiusValues.R3}
                          onChange={(value) => handleChange({ R3: Number(value) }, "radius")}
                          autoComplete="off"
                        />


                        <Button onClick={handleSubmit} primary>
                          {"Add Store"}
                        </Button>
                      </BlockStack>
                    </Form>
                  </Card>
                </div>
                <div style={{ flex: 1, width: "400px", height: "400px" }}>
                  <Card title="Map" sectioned>
                    <div style={{ width: "100%", height: "100%" }}>
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        zoom={8}
                        center={{ lat: storeData.lat, lng: storeData.lng }}
                        onClick={handleMapClick}
                      >
                        <Marker position={{ lat: storeData.lat, lng: storeData.lng }} />
                        <Circle
                          center={{ lat: storeData.lat, lng: storeData.lng }}
                          radius={actualRadiusValues.R1}
                          options={{ fillColor: "rgba(0, 0, 255, 0.2)", strokeColor: "blue" }}
                        />
                        {showR2 && (
                          <Circle
                            center={{ lat: storeData.lat, lng: storeData.lng }}
                            radius={actualRadiusValues.R2}
                            options={{ fillColor: "rgba(255, 0, 0, 0.2)", strokeColor: "red" }}
                          />
                        )}
                        {showR3 && (
                          <Circle
                            center={{ lat: storeData.lat, lng: storeData.lng }}
                            radius={actualRadiusValues.R3}
                            options={{ fillColor: "rgba(0, 255, 0, 0.2)", strokeColor: "green" }}
                          />
                        )}
                      </GoogleMap>
                    </div>
                  </Card>

                  <RangeSlider
                    label={`Coverage Radius R1: ${actualRadiusValues.R1 / 1000} km`}
                    min={0}
                    max={actualRadiusValues.R2 - 1}
                    value={actualRadiusValues.R1}
                    onChange={(value) => handleRadiusChange("R1", value)}
                    output
                  />
                  <Checkbox
                    label="Show Radius R2"
                    checked={showR2}
                    onChange={(newValue) => setShowR2(newValue)}
                  />
                  {showR2 && (
                    <RangeSlider
                      label={`Coverage Radius R2: ${actualRadiusValues.R2 / 1000} km`}
                      min={actualRadiusValues.R1 + 1}
                      max={actualRadiusValues.R3 - 1}
                      value={actualRadiusValues.R2}
                      onChange={(value) => handleRadiusChange("R2", value)}
                      output
                    />
                  )}
                  <Checkbox
                    label="Show Radius R3"
                    checked={showR3}
                    onChange={(newValue) => setShowR3(newValue)}
                  />
                  {showR3 && (
                    <RangeSlider
                      label={`Coverage Radius R3: ${actualRadiusValues.R3 / 1000} km`}
                      min={actualRadiusValues.R2 + 1}
                      max={100000}  // assuming this is the maximum limit for R3
                      value={actualRadiusValues.R3}
                      onChange={(value) => handleRadiusChange("R3", value)}
                      output
                    />
                  )}
                </div>


              </div>
            ) : selectedTab === 1 ? (
              // Listed Products Content
              <Card sectioned>
                <p>Listed Products Content goes here.</p>
              </Card>
            ) : selectedTab === 2 ? (
              // Working Hours Tab Content
              <Page fullWidth>
                <div>
                  <Card >
                    <Tabs
                      tabs={deliveryOptionTabs}
                      selected={selectedDeliveryTabIndex}
                      onSelect={handleDeliveryTabChange}
                    />
                    <div style={{ padding: "30px 0" }}>
                      <ButtonGroup fullWidth gap="tight">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day) => (
                            <Button
                              fullWidth
                              key={day}
                              pressed={selectedDay === day}
                              onClick={() => handleDaySelection(day)}
                            >
                              {day}
                            </Button>
                          )
                        )}
                        <Button>Advance</Button>
                      </ButtonGroup>
                    </div>

                    <div style={{ paddingLeft: "50px" }} >
                      <div style={{ paddingTop: "30px", paddingBottom: "40px" }}>
                        <Text as="h1" fontWeight="bold">{getFullDayName(selectedDay)}</Text>
                      </div>

                      <InlineStack gap="400">
                        <BlockStack spacing="tight" gap="400">
                          <div style={{ width: "380px" }}>
                            <Card roundedAbove="sm">
                              <Text as="h3">Store availability status</Text>
                              <InlineStack spacing="extraTight">
                                <Checkbox
                                  label="Store open"
                                  checked={isOpen}
                                  onChange={setIsOpen}
                                />
                                <Icon source={QuestionCircleIcon} tone="base"></Icon>
                              </InlineStack>
                            </Card>
                          </div>

                          <div style={{ width: "380px" }}>
                            <Card>
                              <Text as="h2" fontWeight="bold">
                                Add New Time Slot
                              </Text>
                              <Text as="h4">
                                Select a new time slot then click on 'Add Slot' button
                              </Text>
                              <FormLayout>
                                <FormLayout.Group condensed>
                                  <TextField
                                    type="time"
                                    label="Start time"
                                    value={newStartTime}
                                    onChange={setNewStartTime}
                                  />
                                  <TextField
                                    type="time"
                                    label="End time"
                                    value={newEndTime}
                                    onChange={setNewEndTime}
                                  />
                                  <Button primary onClick={addTimeSlot}>
                                    Add Slot
                                  </Button>
                                </FormLayout.Group>
                              </FormLayout>
                            </Card>
                          </div>
                        </BlockStack>
                        <div style={{ width: "380px" }}>
                          <Card>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text as="h2">Scheduled slots</Text>
                              <Button>Clear All</Button>
                            </div>

                            <BlockStack spacing="tight">
                              {storeData.localDelivery[selectedDay].timeSlots.map((slot, index) => (
                                <InlineStack alignment="center" key={index}>
                                  <TextField
                                    type="time"
                                    label="Start time"
                                    value={slot.start}
                                    onChange={(value) =>
                                      updateSlot(index, "start", value)
                                    }
                                  />
                                  <TextField
                                    type="time"
                                    label="End time"
                                    value={slot.end}
                                    onChange={(value) =>
                                      updateSlot(index, "end", value)
                                    }
                                  />
                                  <Button
                                    icon={DeleteIcon}
                                    onClick={() => removeTimeSlot(selectedDay, index)}
                                    accessibilityLabel="Delete slot"
                                  />
                                </InlineStack>
                              ))}
                              {timeSlots.length > 0 && (
                                <Button onClick={clearSlots} destructive>
                                  Clear all
                                </Button>
                              )}
                            </BlockStack>
                          </Card>
                        </div>
                      </InlineStack>
                    </div>
                  </Card>
                </div>
              </Page>
            ) : selectedTab === 3 ? (
              // Connected Pincodes Content
              <Card sectioned title="Connected Pincodes">
                <p>Connected Pincodes content goes here.</p>
              </Card>
            ) : null}
          </div>
          {toastActive && (
            <Toast
              content="Store added"
              onDismiss={toggleToastActive}
            />
          )}
        </Card>
      </div>
    </Frame>
  );
};

export default AddStore;