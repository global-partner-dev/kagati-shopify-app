/**
 * App Component
 * 
 * This code represents the main application structure for a Shopify embedded app using the Gadget framework and React.
 * The application supports both authenticated and unauthenticated user experiences, providing different routes and components
 * based on the user's authentication status. It also includes error handling, navigation management, and loading states.
 * 
 * Components and Features:
 * - **GadgetProvider**: Wraps the app, providing necessary context for Gadget and Shopify App Bridge.
 * - **AuthenticatedApp**: Displays the main embedded app for authenticated users, including various pages like products, orders, customers, etc.
 * - **UnauthenticatedApp**: Handles the routes and pages for users who are not signed in, like sign-in, sign-up, and password reset.
 * - **ErrorBoundary**: Catches and displays errors in the embedded app.
 * - **NavMenu**: Provides a navigation menu for easy access to different parts of the embedded app.
 * - **Error404**: Handles undefined routes, displaying a "404 not found" message.
 * 
 * @returns {JSX.Element} The main application component.
 */

import { AppType, Provider as GadgetProvider, useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { SignedInOrRedirect, SignedOutOrRedirect, useFindMany, useUser } from "@gadgetinc/react";

import { NavMenu } from "@shopify/app-bridge-react";
import { Spinner } from "@shopify/polaris";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Importing route components
import AboutPage from "../routes/Pages/about";
import ShopInternalPage from "../routes/Pages/Shop";
import ProductListPage from "../routes/Pages/Product/List";
import CustomerListPage from "../routes/Pages/Customer/List";
import AddProductPage from "../routes/Pages/Product/Add";
import ProductDetailPage from "../routes/Pages/Product/Detail";
import OrderListPage from "../routes/Pages/Order/List";
import AddDraftOrderPage from "../routes/Pages/Order/AddOrder";
import EditDraftOrderPage from "../routes/Pages/Order/EditOrder";
import OrderDetailPage from "../routes/Pages/Order/Detail";
import RefundOrderPage from "../routes/Pages/Order/Refund";
import OrderSplitDetailPage from "../routes/Pages/Order/SplitDetail";
import InventoryPage from "../routes/Pages/Inventory";
import CustomerSupportListPage from "../routes/Pages/CustomerSupport/List";
import CustomerSupportDetailPage from "../routes/Pages/CustomerSupport/Detail";
import StoresPage from "../routes/Pages/Store/Stores";
import UpdateStorePage from '../routes/Pages/Store/UpdateStore';
import AddStorePage from '../routes/Pages/Store/AddStore';
import AssignOrdersPage from "../routes/Pages/AssignOrders";
import ReportsPage from "../routes/Pages/Reports";
import SettingsPage from "../routes/Pages/Settings";
import SettingsForm from "../routes/ExternalPages/SettingsForm/SettingsForm";
import SettingProfile from "../routes/ExternalPages/SettingsForm/Profile";
import CreateProfile from "../routes/ExternalPages/SettingsForm/CreateProfile";
import StaffListPage from "../routes/Pages/Staff/List";
import AddStaffPage from "../routes/Pages/Staff/Add";
import StaffDetailsPage from "../routes/Pages/Staff/Details";
import PincodePage from "../routes/Pages/Pincode/pincodes";
import CustomerDetailPage from "../routes/Pages/Customer/Details";
import AddPinCodePage from "../routes/Pages/Pincode/AddPincode";
import EditPinCodePage from "../routes/Pages/Pincode/EditPincode";
import { api } from "../api";
import ExternalLayout from "../routes/ExternalPages/Layout";
import ExternalAboutPage from "../routes/ExternalPages/about";
import ExternalShopPage from "../routes/ExternalPages/Shop";
import ExternalIndex from "../routes/ExternalPages/index";
import ExternalSignedInPage from "../routes/ExternalPages/signed-in";
import ExternalSignInPage from "../routes/ExternalPages/sign-in";
import ExternalSignUpPage from "../routes/ExternalPages/sign-up";
import ExternalResetPasswordPage from "../routes/ExternalPages/reset-password";
import ExternalVerifyEmailPage from "../routes/ExternalPages/verify-email";
import ExternalChangePassword from "../routes/ExternalPages/change-password";
import ExternalForgotPassword from "../routes/ExternalPages/forgot-password";
import ExternalProductListPage from "../routes/ExternalPages/Product/List";
import ExternalAddProductPage from "../routes/ExternalPages/Product/Add";
import ExternalProductDetailPage from "../routes/ExternalPages/Product/Detail";
import ExternalCustomerListPage from "../routes/ExternalPages/Customer/List";
import ExternalCustomerDetailPage from "../routes/ExternalPages/Customer/Details";
import ExternalPincodePage from "../routes/ExternalPages/Pincode/pincodes";
import ExternalAddPinCodePage from "../routes/ExternalPages/Pincode/AddPincode";
import ExternalEditPinCodePage from "../routes/ExternalPages/Pincode/EditPincode";
import ExternalOrderListPage from "../routes/ExternalPages/Order/List";
import ExternalAddDraftOrderPage from "../routes/ExternalPages/Order/AddOrder";
import ExternalOrderDetailPage from "../routes/ExternalPages/Order/Detail";
import ExternalOrderSplitDetailPage from "../routes/ExternalPages/Order/SplitDetail";
import ExternalEditDraftOrderPage from "../routes/Pages/Order/EditOrder";
import ExternalRefundOrderPage from "../routes/Pages/Order/Refund";
import ExternalInventoryPage from "../routes/ExternalPages/Inventory";
import ExternalStoresPage from "../routes/ExternalPages/Store/Stores";
import ExternalUpdateStorePage from '../routes/ExternalPages/Store/UpdateStore';
import ExternalAddStorePage from '../routes/ExternalPages/Store/AddStore';
import ExternalAssignOrdersPage from "../routes/Pages/AssignOrders";
import ExternalReportsPage from "../routes/ExternalPages/Reports";
import ExternalSettingsPage from "../routes/ExternalPages/Settings";
import ExternalStaffListPage from "../routes/ExternalPages/Staff/List";
import ExternalAddStaffPage from "../routes/ExternalPages/Staff/Add";
import ExternalStaffDetailsPage from "../routes/ExternalPages/Staff/Details";
import ExternalCustomerSupportListPage from "../routes/ExternalPages/CustomerSupport/List";
import ExternalCustomerSupportDetailPage from "../routes/ExternalPages/CustomerSupport/Detail";
import "../assets/styles/style.css";
import DeliveryCustomizations from "../routes/ExternalPages/SettingsForm/DeliveryCustomizations";
import CreateDeliveryCustomization from "../routes/ExternalPages/SettingsForm/CreateDeliveryCustomization";
// import Extension from "../../extensions/kaghati-delivery-customization/src/Checkout";
import DeliveryCustomization from "../routes/app.delivery-customization.$functionId.$id";
import ErrorBoundary from "./ErrorBoundary";
import EnablePushNotifications from "./EnablePushNotifications";
import { SyncStatusProvider } from '../contexts/SyncStatusContext';

// Component for handling 404 errors
const Error404 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === new URL(process.env.GADGET_PUBLIC_SHOPIFY_APP_URL).pathname)
      return navigate("/", { replace: true });
  }, [location.pathname]);

  return <div>404 not found</div>;
};

// Main application component
const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const history = useMemo(() => ({ replace: (path) => navigate(path, { replace: true }) }), [navigate]);

  const appBridgeRouter = useMemo(
    () => ({ location, history }),
    [location, history]
  );

  return (
    <GadgetProvider type={AppType.Embedded} shopifyApiKey={window.gadgetConfig.apiKeys.shopify} api={api} router={appBridgeRouter}>
      <SyncStatusProvider>
        <EnablePushNotifications />
        <AuthenticatedApp />
        <ToastContainer />
      </SyncStatusProvider>
    </GadgetProvider>
  );
};

// Component to handle authentication states
function AuthenticatedApp() {
  const { isAuthenticated, loading } = useGadget();
  const [storeAccess, setStoreAccess] = useState([]);
  const shownNotifications = useRef(new Set());
  const user = useUser();
  useEffect(() => {
    if (user?.storeAccess) {
      setStoreAccess(user?.storeAccess);
    }
  }, [user?.storeAccess]);
  const [{ data: notificationData, fetching: fetchingNotification, error: errorNotification }] = useFindMany(api.notificationCenter, {
    live: true,
    filter: {
      event: { equals: "orderCreated" },
    },
    select: {
      event: true,
      isTrigger: true,
      outletId: true,
      orderName: true,
      storeName: true,
      storeCode: true
    }
  });
  const [{ data: storeData }] = useFindMany(api.khagatiStores, {
    select: {
      id: true,
      storeCode: true,
      storeName: true,
      erpStoreId: true
    },
    filter: {
      status: { in: ["Active"] }
    }
  });
//////////////////////////////////////////////////1 method //////////////////////////////////////////////////
  // const fixShopifyIframe = () => {
  //   const iframes = document.getElementsByTagName("iframe");
  //   console.log("here iframes---------", iframes);
  //   // for (let iframe of iframes) {
  //   //   if (iframe.src.includes("your-shopify-app.com")) {
  //   //     iframe.setAttribute("allow", "autoplay"); // ✅ Force autoplay permission
  //   //   }
  //   // }
  // };
  
  // // Wait for the iframe to load, then fix it
  // setTimeout(fixShopifyIframe, 3000);
  //////////////////////////////////////////////////1 method //////////////////////////////////////////////////
  const action = () => {
    // const audio = document.getElementById('notification-audio');
    const audio = new Audio('https://res.cloudinary.com/djjovgwyk/video/upload/v1740160779/simple-alarm_zvmdh0.mp3');
    audio.volume = 0.8; // 80% volume
    // Play the audio
    const button = document.createElement("button");
    button.addEventListener("click", () => {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    });
    button.click();
    // document.body.appendChild(button);
    // button.addEventListener("click", () => {
    //   var promise = audio.play();
    //   if (promise !== undefined) {
    //     promise.then(_ => {
    //       // Autoplay started!
    //       console.warn("Autoplay started!");
    //     }).catch(error => {
    //       console.warn("Autoplay was prevented. Show a 'Play' button so that user can start playback.");

    //       // Autoplay was prevented.
    //       // Show a "Play" button so that user can start playback.
    //     });
    //   }
    // });
    // button.click();
    // document.body.removeChild(button);
    toast.success(`Hi, there. New order ${notificationData[0].orderName} landed on ${notificationData[0].storeName}!`, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      pauseOnHover: true,
      className: "custom-toast",
      progressClassName: "!bg-gradient-to-r from-blue-500 to-purple-500",
      theme: "light",
      icon: ({ theme, type }) => <img src="https://res.cloudinary.com/djjovgwyk/image/upload/v1739515599/photo_2025-02-14_08-37-33_fyib4y.png" />,
    });

  }

  const checkNotification = useCallback(() => {
    if (notificationData && notificationData?.length > 0 && storeData?.length > 0) {
      // Create a unique identifier for the notification
      const notificationId = `${notificationData[0].orderName}-${notificationData[0].outletId}`;

      // Check if we've already shown this notification
      if (shownNotifications.current.has(notificationId)) {
        console.log("notification already shown", notificationId);
        // return;
      }

      const relevantStores = storeData?.filter(store =>
        store.erpStoreId === notificationData[0].outletId
      );

      const hasStoreAccess = relevantStores.some(({ storeName, storeCode }) => {
        const notificationStoreString = `${storeName}-${storeCode}`;
        return storeAccess.includes(notificationStoreString);
      });

      if (notificationData[0].isTrigger === true && (!isAuthenticated ? hasStoreAccess : true)) {
        // Add the notification to our tracked set before showing it
        shownNotifications.current.add(notificationId);
        action();
      }
    }
  }, [notificationData, storeData]);
  useEffect(() => {
    return () => {
      shownNotifications.current.clear();
    };
  }, []);
  useEffect(() => {
    checkNotification();
  }, [checkNotification]);
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
        <Spinner accessibilityLabel="Spinner example" size="large" />
      </div>
    );
  }
  if (isAuthenticated === null) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
        <Spinner accessibilityLabel="Spinner example" size="large" />
      </div>
    )
  }

  return isAuthenticated ? <EmbeddedApp /> : <UnauthenticatedApp />;
}

// Component for the main embedded app after user authentication
function EmbeddedApp() {
  return (
    <>
      <ErrorBoundary>
        <Routes>
          <Route path="/dashboard" element={<ShopInternalPage />} />
          <Route path="/" element={<OrderListPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<AddProductPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/pincodes" element={<PincodePage />} />
          <Route path="/pincodes/new" element={<AddPinCodePage />} />
          <Route path="/pincodes/:id" element={<EditPinCodePage />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/split/:id/:splitId" element={<OrderSplitDetailPage />} />
          <Route path="/orders/draft/new" element={<AddDraftOrderPage />} />
          <Route path="/orders/edit/:id" element={<EditDraftOrderPage />} />
          <Route path="/orders/refund/:id" element={<RefundOrderPage />} />
          <Route path="/inventories" element={<InventoryPage />} />
          <Route path="/customer-support" element={<CustomerSupportListPage />} />
          <Route path="/customer-support/detail/:id/:splitId" element={<CustomerSupportDetailPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/stores/:id" element={<UpdateStorePage />} />
          <Route path="/stores/new" element={<AddStorePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/shipping" element={<SettingsForm />} />
          <Route path="/shipping/profiles/:id" element={<SettingProfile />} />
          <Route path="/shipping/profiles/create" element={<CreateProfile />} />
          <Route path="/shipping/customizations" element={<DeliveryCustomizations />} />
          <Route path="/shipping/customizations/create" element={<CreateDeliveryCustomization />} />
          <Route path="/app/delivery-customization/:functionId/:id" element={<DeliveryCustomization />} />
          <Route path="/app/delivery-customization/:functionId/new" element={<DeliveryCustomization />} />
          <Route path="/staffs" element={<StaffListPage />} />
          <Route path="/staffs/new" element={<AddStaffPage />} />
          <Route path="/staffs/:id" element={<StaffDetailsPage />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </ErrorBoundary>
      <NavMenu>
        <a href="/orders" rel="home">Orders</a>
        <a href="/orders">Orders</a>
        <a href="/inventories">Inventories</a>
        <a href="/stores">Stores</a>
        <a href="/pincodes">Pincodes</a>
        <a href="/staffs">Staffs</a>
        <a href="/customer-support">Customer Support</a>
        <a href="/settings">Settings</a>
        <a href="/shipping">Shipping Profile</a>
      </NavMenu>

    </>
  );
}

// Component for unauthenticated routes
function UnauthenticatedApp() {
  return (
    <Routes>
      <Route path="/" element={<ExternalLayout />}>
        <Route index element={<SignedOutOrRedirect><ExternalIndex /></SignedOutOrRedirect>} />
        <Route path="/about" element={<ExternalAboutPage />} />
        <Route path="signed-in" element={<SignedInOrRedirect><ExternalSignedInPage /></SignedInOrRedirect>} />
        <Route path="change-password" element={<SignedInOrRedirect><ExternalChangePassword /></SignedInOrRedirect>} />
        <Route path="forgot-password" element={<SignedOutOrRedirect><ExternalForgotPassword /></SignedOutOrRedirect>} />
        <Route path="sign-in" element={<SignedOutOrRedirect><ExternalSignInPage /></SignedOutOrRedirect>} />
        <Route path="sign-up" element={<SignedOutOrRedirect><ExternalSignUpPage /></SignedOutOrRedirect>} />
        <Route path="products" element={<SignedInOrRedirect><ExternalProductListPage /></SignedInOrRedirect>} />
        <Route path="reset-password" element={<ExternalResetPasswordPage />} />
        <Route path="verify-email" element={<ExternalVerifyEmailPage />} />
        <Route path="dashboard" element={<SignedInOrRedirect><ExternalShopPage /></SignedInOrRedirect>} />
        <Route path="/products/new" element={<SignedInOrRedirect><ExternalAddProductPage /></SignedInOrRedirect>} />
        <Route path="/products/:id" element={<SignedInOrRedirect><ExternalProductDetailPage /></SignedInOrRedirect>} />
        <Route path="/customers" element={<SignedInOrRedirect><ExternalCustomerListPage /></SignedInOrRedirect>} />
        <Route path="/customers/:id" element={<SignedInOrRedirect><ExternalCustomerDetailPage /></SignedInOrRedirect>} />
        <Route path="/pincodes" element={<SignedInOrRedirect><ExternalPincodePage /></SignedInOrRedirect>} />
        <Route path="/pincodes/new" element={<SignedInOrRedirect><ExternalAddPinCodePage /></SignedInOrRedirect>} />
        <Route path="/pincodes/:id" element={<SignedInOrRedirect><ExternalEditPinCodePage /></SignedInOrRedirect>} />
        <Route path="/orders" element={<SignedInOrRedirect><ExternalOrderListPage /></SignedInOrRedirect>} />
        <Route path="/orders/:id" element={<SignedInOrRedirect><ExternalOrderDetailPage /></SignedInOrRedirect>} />
        <Route path="/orders/split/:id/:splitId" element={<SignedInOrRedirect><ExternalOrderSplitDetailPage /></SignedInOrRedirect>} />
        <Route path="/orders/draft/new" element={<SignedInOrRedirect><ExternalAddDraftOrderPage /></SignedInOrRedirect>} />
        <Route path="/orders/edit/:id" element={<SignedInOrRedirect><ExternalEditDraftOrderPage /></SignedInOrRedirect>} />
        <Route path="/orders/refund/:id" element={<SignedInOrRedirect><ExternalRefundOrderPage /></SignedInOrRedirect>} />
        <Route path="/inventories" element={<SignedInOrRedirect><ExternalInventoryPage /></SignedInOrRedirect>} />
        <Route path="/stores" element={<SignedInOrRedirect><ExternalStoresPage /></SignedInOrRedirect>} />
        <Route path="/stores/:id" element={<SignedInOrRedirect><ExternalUpdateStorePage /></SignedInOrRedirect>} />
        <Route path="/stores/new" element={<SignedInOrRedirect><ExternalAddStorePage /></SignedInOrRedirect>} />
        <Route path="/assign-orders" element={<SignedInOrRedirect><ExternalAssignOrdersPage /></SignedInOrRedirect>} />
        <Route path="/reports" element={<SignedInOrRedirect><ExternalReportsPage /></SignedInOrRedirect>} />
        <Route path="/settings" element={<SignedInOrRedirect><ExternalSettingsPage /></SignedInOrRedirect>} />
        <Route path="/shipping" element={<SettingsForm />} />
        <Route path="/shipping/profiles/:id" element={<SettingProfile />} />
        <Route path="/shipping/profiles/create" element={<CreateProfile />} />
        <Route path="/shipping/customizations" element={<DeliveryCustomizations />} />
        <Route path="/staffs" element={<SignedInOrRedirect><ExternalStaffListPage /></SignedInOrRedirect>} />
        <Route path="/staffs/new" element={<SignedInOrRedirect><ExternalAddStaffPage /></SignedInOrRedirect>} />
        <Route path="/staffs/:id" element={<SignedInOrRedirect><ExternalStaffDetailsPage /></SignedInOrRedirect>} />
        <Route path="/customer-support" element={<SignedInOrRedirect><ExternalCustomerSupportListPage /></SignedInOrRedirect>} />
        <Route path="/customer-support/detail/:id/:splitId" element={<SignedInOrRedirect><ExternalCustomerSupportDetailPage /></SignedInOrRedirect>} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
}

export default App;