/**
 * TopSellingProducts Component
 * 
 * This component displays a summary of the top-selling products for a given date range. 
 * The component is designed to be used within a larger dashboard or analytics page. 
 * It includes a title, a total sales amount, and space for a chart to visualize the sales data.
 * 
 * Props:
 * - selectedDateRange (object): An object representing the selected date range for which the top-selling products will be displayed. This prop can be used to fetch and display data relevant to the specific date range.
 * 
 * Features:
 * - Displays a heading "Top selling products".
 * - Shows a placeholder for the total sales value. This value should be replaced with the actual total sales fetched from the backend.
 * - A placeholder for an ApexCharts line chart to visualize the sales data. This chart is currently commented out and should be implemented with actual data.
 * 
 * Usage:
 * 
 * <TopSellingProducts selectedDateRange={selectedDateRange} />
 */

import React from "react";
import ApexCharts from "react-apexcharts";
import {
  Page,
  BlockStack,
  Card,
  Text,
} from "@shopify/polaris";

const TopSellingProducts = ({ selectedDateRange }) => {
  return (
    <div className="totalsales">
      <Card roundedAbove="sm">
        <Text as="h2" variant="headingSm">
          Top selling products
        </Text>

        <BlockStack gap="200">
          <Text as="h3" variant="headingSm" fontWeight="medium">
            $3,52,5252
          </Text>
        </BlockStack>

        <BlockStack gap="200">
          <div>
            {/* Placeholder for ApexCharts */}
            {/* <ApexCharts type="line" height={400} /> */}
          </div>
        </BlockStack>
      </Card>
    </div>
  );
};

export default TopSellingProducts;