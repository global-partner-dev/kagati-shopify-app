/**
 * About Page Component
 * 
 * This functional component renders an "About" page within a Shopify Embedded App using the Shopify Polaris design system.
 * It provides users with information about the application and includes a back action button for navigation.
 * 
 * Hooks:
 * - `useNavigate`: React Router hook used for navigating between different routes in the application.
 * 
 * Features:
 * - **Navigation:** Provides a back action button that returns the user to the main Shop Information page.
 * 
 * Render:
 * - Renders a `Page` component from Shopify Polaris with a title ("About") and a `Text` component displaying the application details.
 * 
 * Usage:
 * - This component is typically used in a Shopify Embedded App to offer an informational page about the app.
 * - It is accessible via a route usually associated with an "About" or "Info" page.
 */

import { Page } from '@shopify/polaris';
import TableComponent from '../../components/TableComponent'

const AssignOrdersPage = () => {
  return (
    <Page
      fullWidth
      compactTitle
      title="Assign Orders"
    >
      {/* <TableComponent /> */}
    </Page>
  );
};

export default AssignOrdersPage;