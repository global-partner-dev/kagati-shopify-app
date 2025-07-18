/**
 * About Page Component
 * 
 * This functional component renders an "About" page for a Shopify Embedded App using Shopify Polaris for the UI.
 * It provides information about the application and includes a back button to navigate back to the main Shop Information page.
 * 
 * Hooks:
 * - `useNavigate`: React Router hook used to programmatically navigate between routes.
 * 
 * Features:
 * - **Navigation:** Includes a back action button that navigates the user back to the home or shop information page.
 * 
 * Render:
 * - Renders a `Page` component from Shopify Polaris with a title and a `Text` component to display the about information.
 * 
 * Usage:
 * - This component is used within a Shopify Embedded App to provide basic information about the app.
 * - It is accessible through a route typically associated with an "About" page.
 */

import { Page, Text } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";

export default function () {
  const navigate = useNavigate();

  return (
    <Page
      title="About"
      backAction={{
        content: "Shop Information",
        onAction: () => navigate("/"),
      }}
    >
      <Text variant="bodyMd" as="p">
        This is a simple Shopify Embedded App.
      </Text>
    </Page>
  );
}