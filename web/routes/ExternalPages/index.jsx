/**
 * SignIn Component
 * 
 * This functional component renders the sign-in page for the Kaghati application. It provides options for users to sign in using their email and password, 
 * or through Google OAuth. The component uses the `useActionForm` hook from the Gadget React SDK to manage the form submission process.
 * 
 * Features:
 * - **Email and Password Sign-In:** Users can sign in using their email and password.
 * - **Google OAuth:** A button is provided for users to sign in using their Google account.
 * - **Error Handling:** Displays errors related to sign-in if the credentials are incorrect.
 * - **Forgot Password:** Users can navigate to the forgot password page if they need to reset their password.
 * - **Sign-Up Option:** Users are provided with a link to sign up if they don't have an account.
 * 
 * Hooks:
 * - `useActionForm`: Hook from the Gadget React SDK used to handle form state, submission, and error management.
 * - `useLocation`: React Router hook used to access the current URL's query string, which is necessary for handling redirects after authentication.
 * - `useNavigate`: React Router hook used to navigate programmatically between routes.
 * 
 * External Libraries and Assets:
 * - **Gadget React SDK:** Used for form management and submission through the `useActionForm` hook.
 * - **React Router:** Utilized for navigation and routing within the application.
 * - **External Assets:** Includes the Kaghati logo and Google icon for branding and OAuth functionality.
 * - **CSS:** Custom styles are imported from `ExternalApp.css` to style the sign-in form and its components.
 * 
 * Render:
 * - The component renders a sign-in form that includes:
 *   - Kaghati branding with the logo.
 *   - A Google OAuth button for social login.
 *   - Email and password input fields for traditional login.
 *   - Error messages displayed for any form submission errors.
 *   - Links for password recovery and account creation.
 * 
 * Usage:
 * - This component is used as part of the authentication flow within the Kaghati application.
 * - It is accessible through a route associated with user sign-in, typically `/sign-in`.
 * 
 * Example:
 * - The `SignIn` component is rendered when the user navigates to the `/sign-in` route, allowing them to log into their account or create a new one.
 */

import React, { useEffect, useState } from "react";
import { useGlobalAction } from "@gadgetinc/react";
import { api } from "../../api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GoogleIcon from "../../assets/images/google.svg";
import KaghatiLogo from "../../assets/images/kaghati_logo.jpeg";
import "../../assets/styles/ExternalApp.css";

export default function () {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState('');
  const [{ fetching: isLoading }, signIn] = useGlobalAction(api.signIn);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setNotification("Email and password are required");
      return;
    }

    try {
      const response = await signIn({ email, password });
      console.log("Response:", response);

      if (response.data.authentication === "login") {
        localStorage.setItem("isAuthExternal", "true");
        navigate("/orders", { replace: true });
      } else if (response.data.authentication === "disLogin") {
        setNotification("Incorrect password. Please try again.");
      } else if (response.data.authentication === "unregistered") {
        setNotification("Email not registered.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setNotification("An error occurred during sign-in. Please try again.");
    }
  };

  return (
    <div className="sign-in-main">
      <div className="card">
        <form className="custom-form" onSubmit={handleSubmit}>
          <div className="logo">
            <img src={KaghatiLogo} width={40} alt="Kaghati Logo" />
            <span className="bold-text">Kaghati</span>
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              padding: "17px 0px 10px",
            }}
          >
            Sign in
          </h1>
          <div className="custom-form">
            <input
              className="custom-input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="custom-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {notification && <p className="format-message error">{notification}</p>}
            <button
              disabled={isLoading}
              type="submit"
              className="sign-in-button"
            >
              {isLoading ? "Loading..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
