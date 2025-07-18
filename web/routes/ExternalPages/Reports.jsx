/**
 * ReportsPage Component
 * 
 * This component renders a page dedicated to displaying various reports within the application.
 * It utilizes Shopify Polaris's `Page` component for consistent styling and layout.
 * 
 * Features:
 * - **Full Width Layout:** The page is rendered with full width to maximize the available space for displaying reports.
 * - **Compact Title:** Uses a compact title layout to provide a clean and focused interface.
 * 
 * Dependencies:
 * - `@shopify/polaris`: Provides the `Page` component for layout and styling.
 * - `TableComponent`: (Commented out) Intended to display tabular data for reports, though currently not in use.
 * 
 * Future Implementation:
 * - The `TableComponent` can be uncommented and integrated to display report data in a tabular format.
 * 
 * Usage:
 * - The `ReportsPage` component is intended to be used in the admin or dashboard section of the application where users can view and manage various reports.
 * 
 * Example:
 * - This component is typically rendered when the user navigates to the "/reports" route in the application.
 */

import { Page } from '@shopify/polaris';
import TableComponent from '../../components/TableComponent';

const ReportsPage = () => {
  return (
    <Page
      fullWidth
      compactTitle
      title="Reports"
    >
      {/* <TableComponent /> */}
    </Page>
  );
};

export default ReportsPage;
