/**
 * TotalSales Component
 * 
 * This component displays the total sales within a specified date range and renders a line chart 
 * to visualize the sales data. The data is fetched from an API based on the selected date range.
 * 
 * Props:
 * - selectedDateRange (object): An object representing the selected date range, which determines 
 *   the period for which the sales data is fetched and displayed.
 * 
 * State:
 * - salesData (array): An array of objects representing the sales data to be plotted on the chart.
 * - totalSales (number): The total sales amount within the selected date range.
 * 
 * Features:
 * - Fetches sales data from the API based on the selected date range.
 * - Calculates and displays total sales, either hourly (for "Today" and "Yesterday") 
 *   or daily (for "Last 7 days").
 * - Renders a line chart using ApexCharts to visualize sales trends.
 * - Formats the sales data for clear and informative presentation in the chart.
 * 
 * Usage:
 * 
 * <TotalSales selectedDateRange={selectedDateRange} />
 */

import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import {
  Page,
  Grid,
  BlockStack,
  Box,
  Button,
  Card,
  InlineGrid,
  Text,
  ButtonGroup,
} from "@shopify/polaris";
import {
  startOfDay,
  endOfDay,
  subDays,
  differenceInDays,
  addDays,
} from "date-fns";
import { useFindOne, useFindMany } from "@gadgetinc/react";
import { api } from "../../../api";

const TotalSales = ({ selectedDateRange }) => {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    console.log("selecteddateRange", selectedDateRange);
    if (selectedDateRange) {
      fetchData(selectedDateRange);
    }
  }, [selectedDateRange]);

  const fetchData = async (selectedDateRange) => {
    console.log("title", selectedDateRange.title);
    // Fetch order data from the backend
    try {
      const today = new Date();
      let startDate, endDate;
      let salesData = [];

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
          const sevenDaysAgo = subDays(today, 7); // Exclude today from the 7 days count
          startDate = startOfDay(sevenDaysAgo);
          endDate = endOfDay(subDays(today, 1)); // Exclude today by subtracting 1 day from the end
          break;
        default:
          startDate = startOfDay(today);
          endDate = endOfDay(today);
          break;
      }

      console.log(
        `Fetching orders from ${startDate.toISOString()} to ${endDate.toISOString()}`
      );

      let page = 1;

      let response = await api.shopifyOrder.findMany({
        select: {
          createdAt: true,
          subtotalPrice: true,
          totalLineItemsPrice: true,
          totalDiscounts: true,
          originalTotalDutiesSet: true,
          totalTax: true,
          additionalFees: true,
          totalShippingPriceSet: true,
          currency: true,
        },
        filter: {
          AND: [
            { createdAt: { greaterThanOrEqual: startDate.toISOString() } },
            { createdAt: { lessThanOrEqual: endDate.toISOString() } },
          ],
        },
      });

      console.log("Fetched orders (page " + page + "):", response);

      let allOrders = [...response]; // Initialize allOrders with the first page of results

      // loop through additional pages to get all protected orders
      while (response.hasNextPage) {
        // paginate
        response = await response.nextPage();
        allOrders.push(...response);
      }

      console.log("All orders:", allOrders);
      console.log("All res:", response);

      const orders = response;
      // Process order data to aggregate sales totals

      if (
        selectedDateRange.title === "Today" ||
        selectedDateRange.title === "Yesterday"
      ) {
        // Calculate total sales on hourly basis
        salesData = calculateHourlySales(orders);
      } else if (selectedDateRange.title === "Last 7 days") {
        // Calculate total sales on daily basis for the last 7 days
        salesData = calculateDailySales(orders);
      }

      // Set the chart data
      setSalesData(salesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Function to calculate total sales on hourly basis
  const calculateHourlySales = (orders) => {
    const salesByHour = Array(24).fill(0);

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);

      const hour = orderDate.getHours();
      console.log("Order details:", order);
      console.log("Hour:", hour);

      // Calculate total sales for each order
      const totalSales =
        (parseFloat(order.totalLineItemsPrice) || 0) -
        (parseFloat(order.totalDiscounts) || 0) -
        (parseFloat(order.returns) || 0) +
        (parseFloat(order.totalShippingPriceSet.shop_money.amount) || 0) +
        (parseFloat(order.totalTax) || 0) +
        (parseFloat(order.totalDutiesSet) || 0) +
        (parseFloat(order.additionalFees) || 0);

      console.log("totalsales", totalSales);
      // Increment salesByHour array with totalSales
      salesByHour[hour] += totalSales;
    });
    console.log("salesByHour", salesByHour);

    // Calculate total sales from hourly totals

    const total = salesByHour.reduce((acc, val) => acc + val, 0).toFixed(2);
    const formattedTotal = total.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setTotalSales(formattedTotal);

    salesByHour.forEach((total, index) => {
      salesByHour[index] = parseFloat(total).toFixed(2);
    });
    // Convert aggregated sales data to format accepted by ApexCharts

    const totalsalesByHour = salesByHour.map((totalSales, hour) => {
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
        y: totalSales,
      };
    });
    return totalsalesByHour;
  };

  // Function to calculate total sales on daily basis for the last 7 days
  const calculateDailySales = (orders) => {
    const today = new Date();
    const startOfSelectedRange = startOfDay(subDays(today, 7));
    let salesByDay = Array(7).fill(0);

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const daysAgo = Math.abs(
        differenceInDays(orderDate, startOfSelectedRange)
      );

      if (daysAgo < 7) {
        // Calculate total sales for each order
        const totalSales =
          (parseFloat(order.totalLineItemsPrice) || 0) -
          (parseFloat(order.totalDiscounts) || 0) -
          (parseFloat(order.returns) || 0) +
          (parseFloat(order.totalShippingPriceSet.shop_money.amount) || 0) +
          (parseFloat(order.totalTax) || 0) +
          (parseFloat(order.totalDutiesSet) || 0) +
          (parseFloat(order.additionalFees) || 0);

        salesByDay[daysAgo] += totalSales;
      }
    });

    // Calculate total sales from daily totals
    const total = salesByDay.reduce((acc, val) => acc + val, 0).toFixed(2);
    const formattedTotal = total.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setTotalSales(formattedTotal);

    // Convert aggregated sales data to format accepted by ApexCharts
    const formattedSalesData = salesByDay.map((totalSales, index) => {
      const dayDate = addDays(startOfSelectedRange, index);
      const formattedDate = dayDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        x: formattedDate,
        y: totalSales.toFixed(2),
      };
    });
    return formattedSalesData;
  };

  console.log("chartdata", salesData);

  //Options for the gradient line chart
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
      // categories: [
      //   "12:00 AM",

      //   "4:00 AM",

      //   "8:00 AM",

      //   "12:00 PM",

      //   "4:00 PM",

      //   "8:00 PM",
      // ],
      labels: {
        rotate: 0,
      },

      //   show: true,
      //   color: "#efeeef",
      //   height: 1,
      //   width: "100%",
      //   offsetX: 0,
      //   offsetY: 0,
      // },
      axisTicks: {
        show: false,
        borderType: "dotted",
      },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          if (value >= 10000) {
            return `₹${(value / 1000).toFixed(0)}k`;
          } else {
            return `₹${value.toFixed(0)}`;
          }
        },
      },
    },
    tooltip: {
      marker: {
        show: false,
      },
      x: {
        show: true,
        format: " MMM dd, yyyy",
      },

      y: {
        formatter: function (value) {
          return `₹${value.toFixed(2)}`;
        },
        title: {
          formatter: (seriesName) => null,
        },
      },
      fixed: {
        enabled: false,
        position: "TopRight",
        offsetX: 0,
        offsetY: 0,
      },
    },
    fill: {
      colors: ["#0a97d580"],
      type: "solid",
    },
  };

  return (
    <div className="totalsales">
      <Card roundedAbove="sm">
        <Text as="h2" variant="headingSm">
          Total sales
        </Text>

        <BlockStack gap="200">
          <Text as="h3" variant="headingSm" fontWeight="medium">
            ₹{totalSales}
          </Text>
        </BlockStack>

        <BlockStack gap="200">
          <div>
            <ApexCharts
              options={chartOptions}
              series={[{ data: salesData }]}
              type="line"
              height={245}
            />
          </div>
        </BlockStack>
      </Card>
    </div>
  );
};

export default TotalSales;
