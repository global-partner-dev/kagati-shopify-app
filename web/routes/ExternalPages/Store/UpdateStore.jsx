/**
 * UpdateStore Component
 * 
 * This component provides an interface for updating store details, working hours, associated products, and connected pincodes.
 * It leverages the Shopify Polaris UI framework for a consistent look and feel. The component integrates with Google Maps 
 * for setting store locations, and allows users to manage a store's radius and delivery options.
 * 
 * Props:
 * - None directly. The component is designed to fetch the necessary data based on the store ID provided via the URL parameters.
 * 
 * State:
 * - `selectedTab` (number): Manages the currently selected tab (Location Details, Listed Products, Working Hours, Connected Pincodes).
 * - `selectedDay` (string): Tracks the selected day for managing delivery hours.
 * - `showCircles` (boolean): Controls the visibility of radius circles on the Google Map for all stores.
 * - `timeSlots` (array): Stores time slots for the currently selected day.
 * - `newStartTime`, `newEndTime` (string): Manages the start and end times for new delivery time slots.
 * - `allProducts` (array): Stores the list of all products associated with the store.
 * - `allPincodes` (array): Stores the list of all pincodes associated with the store.
 * - `toastActive` (boolean): Controls the visibility of a success toast notification.
 * - `radiusValues` (object): Manages the radius values for the store's delivery area.
 * - `radiusMaxValues` (object): Stores the maximum allowable radius values for each ring.
 * - `disableRadius` (boolean): Disables radius settings when pincodes are used for delivery zones.
 * - `numberOfRadius` (number): Controls the number of radius sliders displayed.
 * - `searchProducts`, `searchPincode` (string): Stores the search queries for filtering products and pincodes.
 * - `productPageInfo`, `pincodePageInfo` (object): Tracks pagination information for products and pincodes.
 * - `productCursor`, `pincodeCursor` (object): Manages the pagination cursors for loading more products or pincodes.
 * - `storeData` (object): Holds the current store's data, including name, address, delivery settings, etc.
 * - `bannerMessage` (string): Message to be displayed in the banner based on radius or pincode settings.
 * - `isSavingDetails`, `isSavingHours` (boolean): Indicates whether store details or working hours are being saved.
 * 
 * Hooks:
 * - `useNavigate`: React Router hook for navigation.
 * - `useParams`: React Router hook to extract parameters from the URL.
 * - `useState`, `useEffect`, `useCallback`: React hooks for managing state, side effects, and performance optimizations.
 * - `useFindOne`, `useFindMany`: Hooks from `@gadgetinc/react` for fetching store data and associated records.
 * 
 * Features:
 * - **Google Maps Integration:** Allows setting and visualizing the store's location with radius circles.
 * - **Working Hours Management:** Users can set delivery hours for each day of the week, add and remove time slots.
 * - **Radius Management:** Allows users to set delivery radius rings; dynamically adjusts the radius values.
 * - **Product & Pincode Management:** Provides tabs for viewing and managing products and pincodes associated with the store.
 * - **Validation & Feedback:** Includes validation for time slots and provides visual feedback when updates are made successfully.
 * 
 * Render:
 * - The component is structured into multiple tabs: Location Details, Listed Products, Working Hours, and Connected Pincodes.
 * - Each tab provides specific functionality, including form fields, maps, and lists with pagination.
 * - Includes a success toast notification after successful data updates.
 * 
 * Usage:
 * - This component is intended for use in an admin or management interface where users need to update store details and settings.
 * - It is particularly useful for managing stores with specific delivery settings, radius-based delivery areas, and associated products.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField, Button, Form, Frame, Toast, Card, Page, Select, Checkbox, Tabs, Spinner, BlockStack,
  InlineStack, FormLayout, Text, ButtonGroup, Icon, RangeSlider, ResourceList, ResourceItem, Thumbnail, Box, Divider, Link, Pagination, Banner
} from "@shopify/polaris";
import { GoogleMap, useLoadScript, Circle, Marker } from "@react-google-maps/api";
import { useFindOne, useFindMany } from "@gadgetinc/react";
import { QuestionCircleIcon, DeleteIcon } from "@shopify/polaris-icons";
import { api } from "../../../api";

const libraries = ["places"];

const UpdateStore = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [showCircles, setShowCircles] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [allPincodes, setAllPincodes] = useState([]);
  const [toastActive, setToastActive] = useState(false);
  const [allStores, setAllStores] = useState([]);
  const [selectedDeliveryTabIndex, setSelectedDeliveryTabIndex] = useState(0);
  const [radiusMaxValues, setRadiusMaxValues] = useState({ R1: 3, R2: 5, R3: 7, R4: 10, R5: 15 });
  const [radiusValues, setRadiusValues] = useState({ R1: 3, R2: 4, R3: 5, R4: 6, R5: 7 });
  const [disableRadius, setDisableRadius] = useState(false);
  const [numberOfRadius, setNumberOfRadius] = useState(1);
  const [searchProducts, setSearchProducts] = useState('');
  const [searchPincode, setSearchPincode] = useState('');
  const [allPincodesBySearch, setAllPincodesBySearch] = useState([]);
  const [productPageInfo, setProductPageInfo] = useState({ hasNextPage: false, hasPreviousPage: false });
  const [pincodePageInfo, setPincodePageInfo] = useState({ hasNextPage: false, hasPreviousPage: false });
  const [productCursor, setProductCursor] = useState({ first: 30 });
  const [pincodeCursor, setPincodeCursor] = useState({ first: 30 });
  const [selectedStoreRadius, setSelectedStoreRadius] = useState()
  const [bannerMessage, setBannerMessage] = useState("")
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const handleChangeSearchProducts = useCallback((newValue) => setSearchProducts(newValue), []);
  const handleChangeSearchPincode = useCallback((newValue) => setSearchPincode(newValue), []);
  const [emailError, setEmailError] = useState('');
  const [storeData, setStoreData] = useState({
    storeName: "",
    storeCode: "",
    erpStoreId: "",
    storeTier: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    mobNumber: "",
    email: "abc@gmail.com",
    googleMap: "",
    isBackupWarehouse: false,
    selectBackupWarehouse: "",
    status: "",
    localDelivery: {
      "Fri": {
        "isOpen": true,
        "timeSlots": [
          {
            "end": "17:00",
            "start": "09:00"
          }
        ]
      },
      "Mon": {
        "isOpen": true,
        "timeSlots": [
          {
            "end": "17:00",
            "start": "09:00"
          }
        ]
      },
      "Sat": {
        "isOpen": true,
        "timeSlots": [
          {
            "end": "17:00",
            "start": "09:00"
          }
        ]
      },
      "Sun": {
        "isOpen": true,
        "timeSlots": [
          {
            "end": "17:00",
            "start": "09:00"
          }
        ]
      },
      "Thu": {
        "isOpen": true,
        "timeSlots": [
          {
            "end": "17:00",
            "start": "09:00"
          }
        ]
      },
      "Tue": {
        "isOpen": true,
        "timeSlots": [
          {
            "end": "17:00",
            "start": "09:00"
          }
        ]
      },
      "Wed": {
        "isOpen": true,
        "timeSlots": [
          {
            "end": "17:00",
            "start": "09:00"
          }
        ]
      }
    },
    lat: 0,
    lng: 0,
    radius: { R1: 5, R2: 10, R3: 20, R4: 30, R5: 50 },
    isSelected: false
  });

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyAjOpQ9biCv7-OHpp9nn0KAIzAWVKn_3UI",
    libraries,
  });

  const [{ data: allStoresData, fetching: fetchingAllStores, error: allStoresError }] = useFindMany(api.khagatiStores, {
    select: {
      id: true,
      lat: true,
      lng: true,
      radius: true,
      storeCode: true,
      storeName: true,
      isBackupWarehouse: true,
    }
  });

  useEffect(() => {
    setAllStores(allStoresData);
  }, [allStoresData]);

  const [{ data, fetching, error }] = useFindOne(api.khagatiStores, id, {
    select: {
      state: true,
      storeName: true,
      storeCode: true,
      erpStoreId: true,
      storeTier: true,
      address: true,
      city: true,
      mobNumber: true,
      email: true,
      googleMap: true,
      isBackupWarehouse: true,
      selectBackupWarehouse: true,
      status: true,
      localDelivery: true,
      pinCode: true,
      lat: true,
      lng: true,
      radius: true
    }
  });

  const [{ data: khagatiSettingData, fetching: fetchingKhagatiSetting, error: khagatiSettingError }] = useFindMany(api.khagatiSetting, {
    select: {
      value: true
    },
    filter: {
      title: { equals: "Store Coverage Type" }
    }
  });

  useEffect(() => {
    if (khagatiSettingData) {

      setDisableRadius(khagatiSettingData.value === 'pincode');
      if (khagatiSettingData.value === 'pincode') {
        setBannerMessage("Pincode option has been selected, radius rings are disabled")
      }
      else {
        setBannerMessage("Radius rings are enabled,Pincode option is disabled")
      }
    }
  }, [khagatiSettingData]);

  const [{ data: khagatiSettingNumberOfRadius, fetching: fetchingKhagatiSettingR, error: khagatiSettingErrorR }] = useFindMany(api.khagatiSetting, {
    select: {
      value: true
    },
    filter: {
      title: { equals: "Radius Selection" }
    }
  });

  useEffect(() => {
    if (khagatiSettingNumberOfRadius) {

      setNumberOfRadius(khagatiSettingNumberOfRadius[0].value);
    }
  }, [khagatiSettingNumberOfRadius]);

  const [{ data: allProductData, fetching: fetchingAllProduct, error: allProductError }] = useFindMany(api.khagatiOnlineHybridStock, {
    select: {
      id: true,
      outletId: true,
      hybridStock: true,
      primaryStock: true,
      backUpStock: true,
      sku: true,
      productId: true,
      productTitle: true,
      variantId: true,
      variantTitle: true
    },
    filter: {
      outletId: { equals: Number(data?.erpStoreId) }
    },
    ...productCursor,
  });

  const [{ data: allPinCodeData, fetching: fetchingAllPinCode, error: allPinCodeError }] = useFindMany(api.khagatiPinCode, {
    select: {
      id: true,
      pinCode: true,
      storeCode: true,
    },
    ...pincodeCursor,
  });


  useEffect(() => {
    if (allProductData?.pageInfo) {
      setProductPageInfo({
        hasNextPage: allProductData.pageInfo.hasNextPage,
        hasPreviousPage: allProductData.pageInfo.hasPreviousPage,
      });
    }
  }, [allProductData]);

  useEffect(() => {
    if (allPinCodeData?.pageInfo) {
      setPincodePageInfo({
        hasNextPage: allPinCodeData.pageInfo.hasNextPage,
        hasPreviousPage: allPinCodeData.pageInfo.hasPreviousPage,
      });
    }
  }, [allPinCodeData]);


  const handleProductPageChange = (cursor) => {
    setProductCursor(cursor);
  };

  const handlePincodePageChange = (cursor) => {
    setPincodeCursor(cursor);
  };



  const [{ data: allPinCodeBySearchData, fetching: fetchingAllPinCodeBySearch, error: allPinCodeBySearchError }] = useFindMany(api.khagatiPinCode, {
    select: {
      id: true,
      pinCode: true,
      storeCode: true,
    },
    search: searchPincode
  });

  const [{ data: productImages, error: productImagesError, loading: productImagesLoading }] = useFindMany(api.shopifyProduct, {
    select: {
      id: true,
      images: {
        edges: {
          node: {
            source: true,
            alt: true
          }
        }
      }
    }
  });

  useEffect(() => {
    if (data) {
      if (allPinCodeData) {

        const uniquePinCodeTitles = {};
        allPinCodeData.forEach(pinCode => {
          uniquePinCodeTitles[pinCode.pinCode] = pinCode;
        });

        const uniquePinCodes = Object.values(uniquePinCodeTitles);

        setAllPincodes(uniquePinCodes);
      }
      if (allProductData) {

        const uniqueProductTitles = {};
        allProductData.forEach(product => {
          uniqueProductTitles[product.productId] = product;
        });
        const uniqueProducts = Object.values(uniqueProductTitles);
        if (productImages) {
          const productImagesMap = productImages.reduce((acc, product) => {
            acc[product.id] = product.images.edges.map(edge => edge.node);
            return acc;
          }, {});
          const productsWithImages = uniqueProducts.map(product => ({
            ...product,
            images: productImagesMap[product.productId] || []
          }));
          setAllProducts(productsWithImages);
        } else {
          setAllProducts(uniqueProducts);
        }
      }
      setStoreData({
        ...data,
      });
      setRadiusValues(data.radius || { R1: 3, R2: 5, R3: 7, R4: 10, R5: 15 });
    }
  }, [data, allPinCodeData, allProductData, productImages]);

  const handleChange = (value, field) => {
    if (field === 'radius') {
      setStoreData((prevStoreData) => ({ ...prevStoreData, radius: { ...prevStoreData.radius, ...value } }));
      setRadiusValues((prevValues) => ({ ...prevValues, ...value }))
    } else if (field === 'email') {
      setStoreData((prevStoreData) => ({ ...prevStoreData, [field]: value }));
      if (emailError) {
        setEmailError(""); // Reset error
      }

    } else {
      const newValue = (field === 'lat' || field === 'lng') ? Number(value) : value;
      setStoreData((prevStoreData) => ({ ...prevStoreData, [field]: newValue }));
    }
  };

  const handleRadiusChange = (key, value) => {
    setRadiusValues((prevValues) => {
      const newValues = { ...prevValues, [key]: value };

      if (key === "R1") {
        // Ensure R1 is between 0 and its max value
        newValues.R1 = Math.min(Math.max(value, 0), radiusMaxValues.R1);

        // R2 must be at least R1 + 1, but not exceed its max
        if (newValues.R2 <= newValues.R1) {
          newValues.R2 = newValues.R1 + 1;
        }
        newValues.R2 = Math.min(newValues.R2, radiusMaxValues.R2);
      } else if (key === "R2") {
        // Ensure R2 is between R1+1 and its max value
        newValues.R2 = Math.min(Math.max(value, newValues.R1 + 1), radiusMaxValues.R2);

        // R3 must be at least R2 + 1, but not exceed its max
        if (newValues.R3 <= newValues.R2) {
          newValues.R3 = newValues.R2 + 1;
        }
        newValues.R3 = Math.min(newValues.R3, radiusMaxValues.R3);
      } else if (key === "R3") {
        // Ensure R3 is between R2+1 and its max value
        newValues.R3 = Math.min(Math.max(value, newValues.R2 + 1), radiusMaxValues.R3);

        // R4 must be at least R3 + 1, but not exceed its max
        if (newValues.R4 <= newValues.R3) {
          newValues.R4 = newValues.R3 + 1;
        }
        newValues.R4 = Math.min(newValues.R4, radiusMaxValues.R4);
      } else if (key === "R4") {
        // Ensure R4 is between R3+1 and its max value
        newValues.R4 = Math.min(Math.max(value, newValues.R3 + 1), radiusMaxValues.R4);

        // R5 must be at least R4 + 1, but not exceed its max
        if (newValues.R5 <= newValues.R4) {
          newValues.R5 = newValues.R4 + 1;
        }
        newValues.R5 = Math.min(newValues.R5, radiusMaxValues.R5);
      } else if (key === "R5") {
        // Ensure R5 is between R4+1 and its max value
        newValues.R5 = Math.min(Math.max(value, newValues.R4 + 1), radiusMaxValues.R5);
      }

      return newValues;
    });
  };

  const handleSaveHours = async () => {
    setIsSavingHours(true);
    // Add logic to save working hours
    try {
      // Save working hours logic
      const response = await api.khagatiStores.update(id, { localDelivery: storeData.localDelivery });
      if (response) {
        setToastActive(true);
      }
    } catch (error) {
      console.error("Error:", error); // Log the error
    } finally {
      setIsSavingHours(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    let updateData = {}; // Declare updateData outside the if-else block

    if (storeData.email === '' || !validateEmail(storeData.email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setIsSavingDetails(true);
      updateData = {
        id,
        storeName: storeData.storeName,
        storeCode: storeData.storeCode,
        erpStoreId: storeData.erpStoreId,
        storeTier: storeData.storeTier,
        address: storeData.address,
        city: storeData.city,
        state: storeData.state,
        pinCode: storeData.pinCode,
        mobNumber: storeData.mobNumber,
        email: storeData.email,
        isBackupWarehouse: storeData.isBackupWarehouse,
        selectBackupWarehouse: storeData.selectBackupWarehouse,
        status: storeData.status,
        localDelivery: storeData.localDelivery,
        lat: Number(storeData.lat),
        lng: Number(storeData.lng),
        googleMap: storeData.googleMap,
        radius: radiusValues // Send actual values being set by the user
      };
    }

    try {
      if (Object.keys(updateData).length > 0) { // Check if updateData has been populated
        const response = await api.khagatiStores.update(id, updateData);
        if (response) {
          setToastActive(true);
          setTimeout(() => navigate("/stores"), 1500);
        }
      }
    } catch (error) {
      console.error("Error:", error); // Log the error
    }
  };

  const addTimeSlot = () => {
    if (!newStartTime || !newEndTime) {
      alert("Start time must be before the end time.");
      return;
    }
    const updatedLocalDelivery = { ...storeData.localDelivery };
    const slots = updatedLocalDelivery[selectedDay].timeSlots || [];
    slots.push({ start: newStartTime, end: newEndTime });
    setStoreData(prev => ({
      ...prev,
      localDelivery: {
        ...prev.localDelivery,
        [selectedDay]: { ...prev.localDelivery[selectedDay], timeSlots: slots, isOpen: prev.localDelivery[selectedDay].isOpen },
      },
    }));
    setNewStartTime('');
    setNewEndTime('');
  };


  const updateSlot = (index, field, value) => {
    const updatedSlots = storeData.localDelivery[selectedDay].timeSlots.map((slot, idx) =>
      idx === index ? { ...slot, [field]: value } : slot
    );
    setStoreData(prev => ({
      ...prev,
      localDelivery: {
        ...prev.localDelivery,
        [selectedDay]: { ...prev.localDelivery[selectedDay], timeSlots: updatedSlots, isOpen: prev.localDelivery[selectedDay].isOpen },
      },
    }));
  };

  const removeTimeSlot = (index) => {
    const updatedSlots = storeData.localDelivery[selectedDay].timeSlots.filter((_, idx) => idx !== index);
    setStoreData(prev => ({
      ...prev,
      localDelivery: {
        ...prev.localDelivery,
        [selectedDay]: { ...prev.localDelivery[selectedDay], timeSlots: updatedSlots, isOpen: prev.localDelivery[selectedDay].isOpen },
      },
    }));
  };

  const clearSlots = () => {
    setTimeSlots([]);
  };

  const toggleToastActive = () => setToastActive(!toastActive);

  const tabs = [
    {
      id: "location-details",
      content: "Location Details",
      panelID: "location-details-panel",
    },
    {
      id: "product-details",
      content: "Listed Products",
      panelID: "product-details-panel",
    },
    {
      id: "working-hours",
      content: "Working Hours",
      panelID: "working-hours-panel",
    },
    {
      id: "pincode-details",
      content: "Connected Pincodes",
      panelID: "pincode-detail-panel",
    },
  ];

  const deliveryOptionTabs = [
    {
      id: "local-delivery",
      content: "Local Delivery",
      panelID: "local-delivery-panel",
    },
  ];

  const getBackupWarehouseOptions = () => {
    return allStoresData
      ?.filter(store => store.isBackupWarehouse)
      .map(store => ({ label: store.storeName, value: store.id })) || [];
  };

  const backupWarehouseOptions = [...getBackupWarehouseOptions()];

  const statesOfIndia = [
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
  ];

  const weekOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const dayKeys = storeData && storeData.localDelivery && Object.keys(storeData.localDelivery).sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));

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

  if (fetching)
    return <Spinner accessibilityLabel="Loading store" size="large" />;
  if (error) return <div>Error loading store: {error.message}</div>;
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  const filteredProducts = allProducts.filter(
    product =>
      product.productTitle.toLowerCase().includes(searchProducts.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchProducts.toLowerCase())
  );

  const filteredPincodes = allPincodes.filter(
    pincode => pincode.pinCode.toLowerCase().includes(searchPincode.toLowerCase())
  );

  const filteredSerachPincodes = () => {
    const uniquePinCodeTitles = {};
    allPinCodeBySearchData && allPinCodeBySearchData.forEach(pinCode => {
      const key = `${pinCode.pinCode}-${pinCode.storeCode}`;
      uniquePinCodeTitles[key] = pinCode;
    });
    const uniquePinCodes = Object.values(uniquePinCodeTitles);
    return uniquePinCodes;
  }

  return (
    <Frame>
      <div style={{ margin: "25px" }}>
        <Card>
          <Banner title={bannerMessage} tone="success" />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Tabs
              tabs={tabs}
              selected={selectedTab}
              onSelect={handleTabChange}
            ></Tabs>
            {!disableRadius && (
              <Checkbox
                label="Show circles for all stores"
                checked={showCircles}
                onChange={(newShowCircles) => setShowCircles(newShowCircles)}
              />

            )}
          </div>
          <div style={{ padding: "20px" }}>
            {selectedTab === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  height: "85%",
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
                          label="ERP Store Id"
                          value={storeData.erpStoreId}
                          onChange={(e) => handleChange(e, "erpStoreId")}
                          autoComplete="off"
                        />
                        <TextField
                          label="Store Tier"
                          value={storeData.storeTier}
                          onChange={(e) => handleChange(e, "storeTier")}
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
                          options={statesOfIndia}
                          value={storeData.state || ""}
                          onChange={(e) => handleChange(e, "state")}
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
                        {emailError && <Banner tone="critical">{emailError}</Banner>}
                        <Checkbox
                          label="Is Backup Warehouse"
                          checked={storeData.isBackupWarehouse}
                          onChange={(e) => handleChange(e, "isBackupWarehouse")}
                        />
                        {!storeData.isBackupWarehouse && (
                          <Select
                            label="Select Backup Warehouse"
                            options={[{ label: "None", value: "" }, ...backupWarehouseOptions]}
                            value={storeData.selectBackupWarehouse}
                            onChange={(e) => handleChange(e, "selectBackupWarehouse")}
                          />
                        )}
                        <Select
                          label="Status"
                          options={["Active", "Inactive"]}
                          value={storeData.status}
                          onChange={(e) => handleChange(e, "status")}
                        />
                        <TextField
                          label="Latitude"
                          type="number"
                          value={storeData.lat || 0}
                          onChange={(e) => handleChange(e, "lat")}
                          autoComplete="off"
                          helpText="Enter the latitude for the store's location."
                        />
                        <TextField
                          label="Longitude"
                          type="number"
                          value={storeData.lng || 0}
                          onChange={(e) => handleChange(e, "lng")}
                          autoComplete="off"
                          helpText="Enter the longitude for the store's location."
                        />
                        <TextField
                          label="Google Map URL"
                          value={storeData.googleMap}
                          onChange={(e) => handleChange(e, "googleMap")}
                          autoComplete="off"
                          type="url"
                          helpText="Please enter the Google Map URL for the store location."
                        />
                        <div style={{ marginTop: "20px", display: "flex", flexDirection: "row", justifyContent: "center", textDecoration: "boldest", fontSize: "1.2em" }}>
                          <Button
                            onClick={handleSubmit}
                            primary
                            loading={isSavingDetails}
                            disabled={isSavingDetails}
                          >
                            Update Store
                          </Button>


                        </div>

                      </BlockStack>
                    </Form>
                  </Card>
                </div>
                <div style={{ flex: 1, width: "400px", height: "500px" }}>
                  <Card title="Map" sectioned>
                    <div style={{ width: "100%", height: "100%" }}>
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        zoom={8}
                        center={{ lat: storeData.lat, lng: storeData.lng }}
                      >
                        {allStores?.map((store) => {
                          const latitude = Number(store.lat);
                          const longitude = Number(store.lng);

                          if (!isNaN(latitude) && !isNaN(longitude)) {
                            const isStoreSelected = store.id === id;
                            const storeRadiusValues = store.radius || radiusValues; // Use default values if not available

                            if (showCircles) {
                              return (
                                <>
                                  <Marker
                                    position={{ lat: latitude, lng: longitude }} // Store's latitude and longitude
                                    label={{
                                      text: store.name, // Optionally show the store name as a label
                                      color: "black",
                                      fontSize: "12px",
                                    }}
                                    icon={{
                                      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Standard Google Maps red dot marker
                                    }}
                                  />
                                  <Circle
                                    key={`R1-${store.id}`}
                                    center={{ lat: latitude, lng: longitude }}
                                    radius={storeRadiusValues.R3 * 1000} // Convert km to meters
                                    options={{
                                      fillColor: "rgba(255, 0, 0, 0.2)", // 20% opacity
                                      strokeColor: "rgba(0, 0, 255, 0.2)", // 20% opacity
                                      strokeOpacity: 0.2,
                                      strokeWeight: 2,
                                    }}
                                  />
                                </>

                              );
                            } else if (!showCircles && !disableRadius) {
                              // Show all 5 radii for the selected store if showCircles is false and disableRadius is also false
                              const colors = ["rgba(255, 0, 0, 0.2)", "rgba(0, 255, 0, 0.2)", "rgba(0, 0, 255, 0.2)", "rgba(255, 255, 0, 0.2)", "rgba(0, 255, 255, 0.2)"];
                              return (
                                Object.keys(radiusValues).map((radiusKey, index) => {
                                  const radiusValue = storeRadiusValues[radiusKey] || (index + 1) * 5; // Default value if not available
                                  return (
                                    <>
                                      <Marker
                                        position={{ lat: storeData.lat, lng: storeData.lng }} // Store's latitude and longitude
                                        label={{
                                          text: store.name, // Optionally show the store name as a label
                                          color: "black",
                                          fontSize: "12px",
                                        }}
                                        icon={{
                                          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Standard Google Maps red dot marker
                                        }}
                                      />
                                      <Circle
                                        key={radiusKey}
                                        center={{ lat: storeData.lat, lng: storeData.lng }}
                                        radius={radiusValues[radiusKey] * 1000}
                                        options={{
                                          fillColor: colors[index],
                                          strokeColor: colors[index],
                                          strokeOpacity: 0.2,
                                          strokeWeight: 1,
                                        }}
                                      />
                                    </>

                                  );
                                })
                              );
                            }
                          }
                          return null;
                        })}
                      </GoogleMap>
                    </div>
                  </Card>
                  <Card>
                    <div style={{ flex: 1, width: "400px", height: "500px", marginTop: "20px" }}>
                      <BlockStack gap={500}>
                        {Array.from({ length: 5 }).map((_, index) => {
                          const radiusKey = `R${index + 1}`;
                          const radiusCoverageNumber = `R${index + 1}`;
                          return (
                            <BlockStack gap={200} key={radiusKey}>
                              <RangeSlider
                                label={`Coverage Radius ${radiusCoverageNumber}:`}
                                min={index === 0 ? 0 : radiusValues[`R${index}`] + 1}
                                max={radiusMaxValues[radiusKey]}
                                value={radiusValues[radiusKey] || 0}
                                step={1}
                                onChange={(value) => handleRadiusChange(radiusKey, value)}
                                output
                              />
                              <TextField
                                type="number"
                                value={radiusValues[radiusKey] || 0}
                                onChange={(value) => handleRadiusChange(radiusKey, Number(value))}
                                autoComplete="off"
                                suffix="km"
                                style={{ marginLeft: "10px", width: "70px" }}
                              />
                            </BlockStack>
                          );
                        })}
                      </BlockStack>
                    </div>
                  </Card>
                </div>
              </div>
            ) : selectedTab === 1 ? (
              <Card sectioned>
                <TextField
                  placeholder="Search Products by title or SKU"
                  value={searchProducts}
                  onChange={handleChangeSearchProducts}
                />
                <Box paddingBlockStart="400">
                  <Divider />
                  {filteredProducts && filteredProducts.length ? (
                    <>
                      <ResourceList
                        resourceName={{ singular: 'product', plural: 'products' }}
                        items={filteredProducts}
                        renderItem={(item) => {
                          const { id, productTitle, primaryStock, backUpStock, hybridStock, images } = item;

                          const media = (
                            <Thumbnail
                              source={images[0]?.source ? images[0]?.source : 'default_image.jpg'}
                              alt={`Thumbnail of ${productTitle}`}
                              size="extra small"
                            />
                          );

                          return (
                            <ResourceItem id={id} media={media}>
                              <Text variant="bodyMd" fontWeight="bold" as="h3">
                                {productTitle}
                              </Text>
                              <Text variant="bodyMd" as="span">
                                {primaryStock} {backUpStock} {hybridStock}
                              </Text>
                            </ResourceItem>
                          );
                        }}
                      />
                      <Pagination
                        hasNext={productPageInfo.hasNextPage}
                        onNext={() => handleProductPageChange({ after: allProductData[allProductData.length - 1]?.id, first: 10 })}
                        hasPrevious={productPageInfo.hasPreviousPage}
                        onPrevious={() => handleProductPageChange({ before: allProductData[0]?.id, last: 10 })}
                      />
                    </>
                  ) : (
                    <Box padding="400" width="586px">
                      <Text variant="bodyMd" as="h3">
                        No Products Available
                      </Text>
                    </Box>
                  )}
                </Box>
              </Card>


            ) : selectedTab === 2 ? (
              <Page fullWidth>
                <div>
                  <Card>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                      <Tabs
                        tabs={deliveryOptionTabs}
                        selected={selectedDeliveryTabIndex}
                        onSelect={handleDeliveryTabChange}
                      />
                      <Button onClick={handleSaveHours} primary loading={isSavingHours} disabled={isSavingHours} > Save </Button>
                    </div>


                    {dayKeys && (
                      <div style={{ paddingTop: "10px", paddingLeft: "50px" }}>
                        <ButtonGroup segmented>
                          {dayKeys.map((day) => (
                            <Button key={day} pressed={selectedDay === day} onClick={() => setSelectedDay(day)}>
                              {day}
                            </Button>
                          ))}
                        </ButtonGroup>
                      </div>
                    )}
                    <div style={{ paddingLeft: "50px" }}>
                      <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                        <Text as="h1" fontWeight="bold">
                          {getFullDayName(selectedDay)}
                        </Text>
                      </div>
                      <InlineStack gap="400">
                        <BlockStack spacing="tight" gap="400">
                          <div style={{ width: "380px" }}>
                            <Card roundedAbove="sm">
                              <Text as="h3">Store availability status</Text>
                              <InlineStack spacing="extraTight">
                                <Checkbox
                                  label="Store open"
                                  checked={storeData && storeData.localDelivery && storeData.localDelivery[selectedDay].isOpen}
                                  onChange={(newIsOpen) => {
                                    setStoreData((prevStoreData) => ({
                                      ...prevStoreData,
                                      localDelivery: {
                                        ...prevStoreData.localDelivery,
                                        [selectedDay]: { ...prevStoreData.localDelivery[selectedDay], isOpen: newIsOpen },
                                      },
                                    }));
                                  }}
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
                              <Text as="h4">Select a new time slot then click on 'Add Slot' button</Text>
                              <FormLayout>
                                <FormLayout.Group condensed>
                                  <TextField
                                    type="time"
                                    label="Start time"
                                    value={newStartTime}
                                    onChange={(value) => setNewStartTime(value)}
                                  />
                                  <TextField
                                    type="time"
                                    label="End time"
                                    value={newEndTime}
                                    onChange={(value) => setNewEndTime(value)}
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
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Text as="h2">Scheduled slots</Text>
                              <Button onClick={clearSlots}>Clear All</Button>
                            </div>
                            <BlockStack spacing="tight">
                              {storeData &&
                                storeData.localDelivery &&
                                storeData.localDelivery[selectedDay].timeSlots.map((slot, index) => (
                                  <InlineStack alignment="space-between" key={index}>
                                    <TextField
                                      type="time"
                                      label="Start time"
                                      value={slot.start}
                                      onChange={(value) => updateSlot(index, "start", value)}
                                    />
                                    <TextField
                                      type="time"
                                      label="End time"
                                      value={slot.end}
                                      onChange={(value) => updateSlot(index, "end", value)}
                                    />
                                    <div style={{ margin: "5%" }}> <Button icon={DeleteIcon} onClick={() => removeTimeSlot(index)} accessibilityLabel="Delete slot" /></div>

                                  </InlineStack>
                                ))}
                            </BlockStack>
                          </Card>
                          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>

                          </div>
                        </div>
                      </InlineStack>
                    </div>
                  </Card>
                </div>
              </Page>
            ) : selectedTab === 3 ? (
              <Card sectioned title="Connected Pincodes">
                <TextField
                  placeholder="Search Pincodes"
                  value={searchPincode}
                  onChange={handleChangeSearchPincode}
                />
                <Box paddingBlockStart="400">
                  <Divider />
                  {filteredPincodes && filteredPincodes.length ? (
                    <>
                      <ResourceList
                        resourceName={{ singular: 'pinCode', plural: 'pinCodes' }}
                        items={filteredPincodes}
                        renderItem={(item) => {
                          const { id, pinCode } = item;

                          return (
                            <ResourceItem id={id}>
                              <Text variant="bodyMd" fontWeight="bold" as="h3">
                                {pinCode}
                              </Text>
                            </ResourceItem>
                          );
                        }}
                      />
                      <Pagination
                        hasNext={pincodePageInfo.hasNextPage}
                        onNext={() => handlePincodePageChange({ after: allPinCodeData[allPinCodeData.length - 1]?.id, first: 10 })}
                        hasPrevious={pincodePageInfo.hasPreviousPage}
                        onPrevious={() => handlePincodePageChange({ before: allPinCodeData[0]?.id, last: 10 })}
                      />
                    </>
                  ) : (
                    <Box padding="400" width="586px">
                      <Text variant="bodyMd" as="h3">
                        No Pincodes Available
                      </Text>
                    </Box>
                  )}
                </Box>
              </Card>
            ) : null}
          </div>
          {toastActive && <Toast content={id ? "Store updated" : "Store added"} onDismiss={toggleToastActive} />}
        </Card>
      </div>
    </Frame>
  );
};

export default UpdateStore;
