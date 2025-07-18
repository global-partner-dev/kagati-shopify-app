/**
 * Application Bootstrap
 * 
 * This script sets up the main entry point for a React application that uses Shopify's Polaris design system. It configures the application 
 * to use internationalization (i18n) with English translations, sets up React Router for client-side navigation, and renders the main `App` 
 * component within the DOM.
 * 
 * @requires @shopify/polaris - The Shopify Polaris design system is used to style and structure the application's UI components.
 * @requires @shopify/polaris/locales/en.json - Provides English translations for Polaris components.
 * @requires react-dom - Used to render the React application into the DOM.
 * @requires react-router-dom - Provides routing capabilities for the React application.
 * @requires ./components/App.jsx - The root component of the application.
 * 
 * @returns {void}
 */

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App.jsx";

// Get the root DOM element where the React app will be mounted
const root = document.getElementById("root");
if (!root) throw new Error("#root element not found for booting react app");

// Render the React app into the DOM
ReactDOM.createRoot(root).render(
  <>
    <AppProvider i18n={enTranslations} style={{ "padding": "0 !important" }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProvider>
  </>
);