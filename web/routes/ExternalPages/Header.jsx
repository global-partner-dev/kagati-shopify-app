/**
 * Header Component
 * 
 * The `Header` component renders the top navigation bar of the Kaghati application, including the logo, notifications, and user profile menu.
 * 
 * Features:
 * - **Logo and Branding:** Displays the Kaghati logo and brand name, linking back to the home page.
 * - **Notifications:** Includes a notification icon/component to keep users informed about updates.
 * - **Profile Menu:** Provides access to user profile settings and sign-out functionality.
 * 
 * External Libraries:
 * - **Gadget React SDK:** Utilizes the `useSignOut` hook from the Gadget SDK to handle user sign-out.
 * - **React Router:** Incorporates `Link` for navigation and `Outlet` for nested routing, managing how components are rendered.
 * 
 * Hooks:
 * - `useSignOut`: Hook from the Gadget SDK to handle signing out the current user.
 * 
 * Components:
 * - **ProfileMenu:** Manages user profile-related actions like viewing profile settings and signing out.
 * - **Notification:** Displays user notifications.
 * 
 * Assets:
 * - **Logo:** The Kaghati logo is imported and displayed at the top left corner.
 * - **CSS:** Custom styles are imported from `ExternalApp.css` to style the header and its contents.
 * 
 * Render:
 * - The header is styled to be consistent with the overall design of the application.
 * - The logo is clickable and redirects users to the home page.
 * - The header also displays notification and profile management options.
 * 
 * Usage:
 * - The `Header` component is typically used at the top of the application layout to provide users with easy access to notifications, profile settings, and navigation back to the home page.
 * - It should be included in pages where a consistent navigation bar is required.
 * 
 * Example:
 * - The `Header` component is likely included in the main layout component of the app, ensuring that it is visible across different routes.
 */

import "../../assets/styles/ExternalApp.css";
import KaghatiLogo from "../../assets/images/kaghati_logo.jpeg";
import ProfileMenu from "./ProfileMenu";
import Notification from "./Notification";

import {
  SignedInOrRedirect,
  SignedIn,
  SignedOut,
  SignedOutOrRedirect,
  Provider,
  useSignOut,
} from "@gadgetinc/react";
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Link,
} from "react-router-dom";
import SignInPage from "./sign-in";
import SignUpPage from "./sign-up";

const Header = () => {
  const signout = useSignOut();
  //{process.env.GADGET_PUBLIC_APP_SLUG}
  return (
    <div className="header">
      <a
        href="/"
        target="_self"
        rel="noreferrer"
        style={{ textDecoration: "none", backgroundColor: "#f9fafb" }}
      >
        <div className="logo" style={{ display: "flex" }}>
          <img src={KaghatiLogo} width={35} height="auto" />

          <span className="bold-text">Kaghati</span>
        </div>
      </a>
      <div className="header-content">
        <Notification />
        <ProfileMenu />
      </div>
    </div>
  );
};

export default Header;
