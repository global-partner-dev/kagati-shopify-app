/**
 * Signed-In Component
 * 
 * This React functional component handles the signed-in area of the application.
 * It manages user authentication state and redirects users to the dashboard upon mounting.
 * The component also fetches and displays user data and metadata related to the app.
 * 
 * Hooks:
 * - `useNavigate`: React Router hook used to programmatically navigate between routes.
 * - `useUser`: Gadget hook to retrieve the current authenticated user's data.
 * - `useSignOut`: Gadget hook to sign out the current user.
 * - `useFindMany`: Gadget hook to fetch data from the specified API (in this case, `shopifyShop` data).
 * - `useQuery`: Gadget hook to perform a custom GraphQL query (`gadgetMetaQuery`) to fetch additional metadata.
 * 
 * Features:
 * - **Automatic Redirection:**
 *   - Automatically redirects users to the `/dashboard` route when the component mounts.
 * - **User Information Display:**
 *   - Displays the authenticated user's information, including their ID, name, email, and creation date.
 *   - If available, the user's Google profile image is shown; otherwise, a default user icon is used.
 * - **App Metadata:**
 *   - Fetches and displays metadata related to the Gadget app, including the app's slug and edit URL.
 * - **User Actions:**
 *   - Provides links for the user to change their password, access the shop page, or sign out.
 * 
 * Conditional Rendering:
 * - The component only renders its content if a user is authenticated (`user` exists).
 * 
 * Dependencies:
 * - React Router for navigation.
 * - Gadget hooks for user authentication, data fetching, and queries.
 * 
 * Assets:
 * - Includes images such as the React logo and a default user icon.
 * 
 * Usage:
 * - This component is typically rendered as part of the signed-in area of the application.
 * - It serves as the main entry point for authenticated users, displaying key user information and navigation options.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useSignOut, useFindFirst, useQuery, useFindMany } from "@gadgetinc/react";
import reactLogo from "../../assets/images/react-logo.svg";
import { api } from "../../api";
import userIcon from "../../assets/images/default-user-icon.svg";
import { Link } from "react-router-dom";

const gadgetMetaQuery = `
  query {
    gadgetMeta {
      slug
      editURL
    }
  }
`;

export default function () {
  //const history = useHistory(); // Hook for programmatically navigating
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard");
  }, []); // Redirect to /dashboard when the component mounts

  const user = useUser(api);
  const [{ data, fetching, error }] = useFindMany(api.shopifyShop);
  const [{ data: metaData, fetching: fetchingGadgetMeta }] = useQuery({
    query: gadgetMetaQuery,
  });
  const signOut = useSignOut();

  return user ? (
    <>
      <div className="app-link">
        <img src={reactLogo} className="app-logo" alt="logo" />
      </div>
      <div>
        <p className="description" style={{ width: "100%" }}>
          Start building your app&apos;s signed in area
        </p>
        <a href="/edit/files/frontend/routes/signed-in.jsx" target="_blank" rel="noreferrer" style={{ fontWeight: 500 }}>
          frontend/routes/signed-in.jsx
        </a>
      </div>
      <div className="card-stack">
        <div className="card user-card">
          <div className="card-content">
            <img className="icon" src={user.googleImageUrl ?? userIcon} alt="user icon" />
            <div className="userData">
              <p>id: {user.id}</p>
              <p>
                name: {user.firstName} {user.lastName}
              </p>
              <p>
                email: <a href={`mailto:${user.email}`}>{user.email}</a>
              </p>
              <p>created: {user.createdAt.toString()}</p>
            </div>
          </div>
          <div className="sm-description">This data is fetched from the user model</div>
        </div>
        <div className="flex-vertical gap-4px">
          <strong>Actions:</strong>
          <Link to="/change-password">Change password</Link>
          <Link to="/shoppage">ShopPage</Link>
          <a onClick={signOut} style={{ cursor: 'pointer' }}>
            Sign Out
          </a>
        </div>
      </div>
    </>
  ) : null;
}
