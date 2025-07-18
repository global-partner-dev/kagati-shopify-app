/**
 * Shop Component
 * 
 * The `Shop` component is the main analytics dashboard for the application. It provides an overview
 * of key metrics such as total sales, total orders, average order value, and top-selling products.
 * The component also includes a date range picker to filter the data based on the selected period.
 * 
 * Features:
 * - **Navigation:**
 *   - Automatically redirects to the `/orders` page when the component is first rendered.
 * - **Date Range Selection:**
 *   - Includes a `DateRangePicker` component that allows users to select a specific time period for the analytics.
 * - **Analytics Display:**
 *   - Displays various analytics components such as `TotalSales`, `TotalOrders`, `AverageOrder`, and `TopSellingProducts`.
 * 
 * Hooks:
 * - `useEffect`: Triggers the navigation to the orders page when the component mounts.
 * - `useState`: Manages the state of the selected date range.
 * 
 * Props:
 * - None.
 * 
 * State:
 * - `selectedDateRange`: Holds the currently selected date range for filtering the displayed analytics.
 * 
 * Usage:
 * - This component is typically rendered within a route dedicated to shop analytics.
 * - It is accessed by users looking to monitor and analyze their shop's performance.
 * 
 * Example:
 * - This component could be rendered when the user navigates to `/analytics` or similar routes.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Grid } from "@shopify/polaris";
import TotalSales from "./Analytics/TotalSales";
import DateRangePicker from "./Analytics/DaterangePicker";
import TotalOrders from "./Analytics/TotalOrders";
import AverageOrder from "./Analytics/AverageOrder";
import TopSellingProducts from "./Analytics/TopSellingProducts";

const Shop = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/orders");
  }, []);

  const [selectedDateRange, setSelectedDateRange] = useState({
    title: "Today",
    alias: "today",
    period: {
      since: new Date(),
      until: new Date(),
    },
  });

  const handleDateRangeChange = (newDate) => {
    setSelectedDateRange(newDate);
    console.log("New Date Range:", newDate);
  };

  return (
    <div className="analyticpage">
      <Page fullWidth title="Analytics" style={{ marginTop: "-50px" }}>
        <div className="datepicker">
          <DateRangePicker onDateRangeChange={handleDateRangeChange} />
          <DateRangePicker />
        </div>
        <Grid height="300px">
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <TotalSales selectedDateRange={selectedDateRange} />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <TotalOrders selectedDateRange={selectedDateRange} />
          </Grid.Cell>
        </Grid>
        <div style={{ marginTop: "50px" }}>
          <Grid height="300px">
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <AverageOrder selectedDateRange={selectedDateRange} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <TopSellingProducts />
            </Grid.Cell>
          </Grid>
        </div>
      </Page>
    </div>
  );
};

export default Shop;