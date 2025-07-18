/**
 * TotalOrders Component
 * 
 * This component displays the total number of orders within a specified date range and renders a line chart 
 * to visualize the order data. The data is fetched from an API based on the selected date range.
 * 
 * Props:
 * - selectedDateRange (object): An object representing the selected date range, which determines the period 
 *   for which the order data is fetched and displayed.
 * 
 * State:
 * - orderData (array): An array of objects representing the order data to be plotted on the chart.
 * - totalOrders (number): The total count of orders within the selected date range.
 * 
 * Features:
 * - Fetches order data from the API based on the selected date range.
 * - Calculates and displays the total number of orders.
 * - Renders a line chart using ApexCharts to visualize order trends either hourly (for "Today" and "Yesterday") 
 *   or daily (for "Last 7 days").
 * 
 * Usage:
 * 
 * <TotalOrders selectedDateRange={selectedDateRange} />
 */

import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import {
  BlockStack,
  Card,
  Text,
} from "@shopify/polaris";
import {
  startOfDay,
  endOfDay,
  subDays,
  differenceInCalendarDays,
  addDays,
} from "date-fns";
import { api } from "../../../api";

const TotalOrders = ({ selectedDateRange }) => {
  const [orderData, setOrderData] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    if (selectedDateRange) {
      fetchData(selectedDateRange);
    }
  }, [selectedDateRange]);

  const fetchData = async (selectedDateRange) => {
    try {
      const today = new Date();
      let startDate, endDate;
      let orderData = [];

      // Determine the start and end dates based on the selected date range
      switch (selectedDateRange.title) {
        case "Today":
          startDate = startOfDay(today);
          endDate = endOfDay(today);
          break;
        case "Yesterday":
          const yesterday = subDays(today, 1);
          startDate = startOfDay(yesterday);
          endDate = endOfDay(yesterday);
          break;
        case "Last 7 days":
          const sevenDaysAgo = subDays(today, 7);
          startDate = startOfDay(sevenDaysAgo);
          endDate = endOfDay(subDays(today, 1));
          break;
        default:
          startDate = startOfDay(today);
          endDate = endOfDay(today);
          break;
      }

      // Fetch orders data from the API
      let response = await api.shopifyOrder.findMany({
        filter: {
          AND: [
            { createdAt: { greaterThanOrEqual: startDate.toISOString() } },
            { createdAt: { lessThanOrEqual: endDate.toISOString() } },
          ],
        },
      });

      let allOrders = [...response];

      // Fetch all pages of data if pagination is involved
      while (response.hasNextPage) {
        response = await response.nextPage();
        allOrders.push(...response);
      }

      const orders = allOrders;

      // Process the order data based on the selected date range
      if (
        selectedDateRange.title === "Today" ||
        selectedDateRange.title === "Yesterday"
      ) {
        orderData = calculateHourlyOrders(orders);
      } else if (selectedDateRange.title === "Last 7 days") {
        orderData = calculateDailyOrders(orders);
      }

      setOrderData(orderData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Calculate orders by hour for "Today" and "Yesterday" ranges
  const calculateHourlyOrders = (orders) => {
    const ordersByHour = Array(24).fill(0);
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      ordersByHour[hour]++;
    });
    setTotalOrders(orders.length);

    const totalordersByHour = ordersByHour.map((ordersCount, hour) => {
      const hourLabel =
        hour === 0
          ? "12 AM"
          : hour < 12
          ? `${hour} AM`
          : hour === 12
          ? "12 PM"
          : `${hour - 12} PM`;
      return {
        x: `${hourLabel} - ${
          hour === 23
            ? "11 PM"
            : hour === 11
            ? "12 PM"
            : hour < 11
            ? `${hour + 1} AM`
            : `${hour - 11} PM`
        }`,
        y: ordersCount,
      };
    });
    return totalordersByHour;
  };

  // Calculate orders by day for the "Last 7 days" range
  const calculateDailyOrders = (orders) => {
    const today = new Date();
    const startOfSelectedRange = startOfDay(subDays(today, 7));
    let ordersByDay = Array(7).fill(0);

    const filteredOrders = orders.filter((order) => {
      const orderDate = startOfDay(new Date(order.createdAt)); 
      const isInRange =
        orderDate >= startOfSelectedRange && orderDate < startOfDay(today);
      return isInRange;
    });

    filteredOrders.forEach((order) => {
      const orderDate = startOfDay(new Date(order.createdAt));
      const daysAgo = differenceInCalendarDays(orderDate, startOfSelectedRange); 
      if (daysAgo >= 0 && daysAgo < 7) {
        ordersByDay[daysAgo]++;
      }
    });

    setTotalOrders(filteredOrders.length);

    return ordersByDay.map((ordersCount, index) => {
      const dayDate = addDays(startOfSelectedRange, index);
      const formattedDate = dayDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        x: formattedDate,
        y: ordersCount,
      };
    });
  };

  // Configuration options for the ApexCharts line chart
  const chartOptions = {
    chart: {
      height: 245,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    xaxis: {
      labels: {
        rotate: 0,
      },
      axisTicks: {
        show: false,
        borderType: "dotted",
      },
    },
    fill: {
      colors: ["#0a97d580"],
      type: "solid",
    },
    tooltip: {
      marker: {
        show: false,
      },
      x: {
        show: true,
        format: " MMM dd, yyyy",
      },
      title: {
        formatter: (seriesName) => null,
      },
    },
  };

  return (
    <div className="totalsales">
      <Card roundedAbove="sm">
        <Text as="h2" variant="headingSm">
          Total Orders
        </Text>

        <BlockStack gap="200">
          <Text as="h3" variant="headingSm" fontWeight="medium">
            {totalOrders}
          </Text>
        </BlockStack>

        <BlockStack gap="200">
          <div>
            <ApexCharts
              options={chartOptions}
              series={[{ name: "Total Orders", data: orderData }]}
              type="line"
              height={245}
            />
          </div>
        </BlockStack>
      </Card>
    </div>
  );
};

export default TotalOrders;