/**
 * AverageOrder Component
 * 
 * This component calculates and displays the average order value over a selected date range using data from Shopify orders. 
 * The average is displayed in both a text format and a line chart, with the chart updating based on the selected date range.
 * 
 * @param {Object} selectedDateRange - The date range selected by the user. It includes:
 *   - {string} title: The title of the selected range (e.g., "Today", "Yesterday", "Last 7 days").
 * 
 * @returns {JSX.Element} A component displaying the total average order value and a line chart of the average order over time.
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
  differenceInCalendarDays,
  addDays,
} from "date-fns";
import { useFindOne, useFindMany } from "@gadgetinc/react";
import { api } from "../../../api";

const AverageOrder = ({ selectedDateRange }) => {
  const [averageOrderData, setAverageOrderData] = useState([]);
  const [totalAverageOrder, setTotalAverageOrder] = useState(0);

  useEffect(() => {
    if (selectedDateRange) {
      fetchData(selectedDateRange);
    }
  }, [selectedDateRange]);

  const fetchData = async (selectedDateRange) => {
    try {
      const today = new Date();
      let startDate, endDate;
      let averageOrderData = [];

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

      let response = await api.shopifyOrder.findMany({
        select: {
          createdAt: true,
          subtotalPrice: true,
          totalLineItemsPrice: true,

          totalDiscounts: true,
        },
        filter: {
          AND: [
            { createdAt: { greaterThanOrEqual: startDate.toISOString() } },
            { createdAt: { lessThanOrEqual: endDate.toISOString() } },
          ],
        },
      });

      let allOrders = [...response];

      while (response.hasNextPage) {
        response = await response.nextPage();
        allOrders.push(...response);
      }
      console.log("123", allOrders);
      const orders = response;

      if (
        selectedDateRange.title === "Today" ||
        selectedDateRange.title === "Yesterday"
      ) {
        averageOrderData = calculateHourlyAverageOrder(orders);
      } else if (selectedDateRange.title === "Last 7 days") {
        averageOrderData = calculateDailyAverageOrder(orders);
      }

      setAverageOrderData(averageOrderData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const calculateHourlyAverageOrder = (orders) => {
    const ordersByHour = Array(24).fill(0);
    const ordersCountByHour = Array(24).fill(0);
    const discountsByHour = Array(24).fill(0);

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const hour = orderDate.getHours();
      ordersByHour[hour] += Number(order.totalLineItemsPrice);
      ordersCountByHour[hour]++;
      discountsByHour[hour] += Number(order.totalDiscounts);
    });

    const averageOrderByHour = ordersByHour.map((total, index) => {
      const average =
        ordersCountByHour[index] > 0
          ? (total - discountsByHour[index]) / ordersCountByHour[index]
          : 0;
      console.log(" average", average);
      const hourLabel =
        index === 0
          ? "12 AM"
          : index < 12
          ? `${index} AM`
          : index === 12
          ? "12 PM"
          : `${index - 12} PM`;
      return {
        x: `${hourLabel} - ${
          index === 23
            ? "11 PM"
            : index === 11
            ? "12 PM"
            : index < 11
            ? `${index + 1} AM`
            : `${index - 11} PM`
        }`,
        y: average.toFixed(2),
      };
    });

    console.log(" averageOrderByHour", averageOrderByHour);

    const totalOrderValue = ordersByHour.reduce((acc, val, index) => {
      const total = val - discountsByHour[index]; // Subtract discounts from orders
      return acc + total;
    }, 0);

    const totalOrderCount = ordersCountByHour.reduce(
      (acc, val) => acc + val,
      0
    );

    const totalAverageOrder =
      totalOrderCount > 0
        ? (totalOrderValue / totalOrderCount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00";

    setTotalAverageOrder(totalAverageOrder);
    return averageOrderByHour;
  };

  const calculateDailyAverageOrder = (orders) => {
    const today = new Date();
    const startOfSelectedRange = startOfDay(subDays(today, 7));
    let ordersByDay = Array(7).fill(0);
    let ordersCountByDay = Array(7).fill(0);
    let discountsByDay = Array(7).fill(0);

    const filteredOrders = orders.filter((order) => {
      // const orderDate = new Date(order.createdAt);
      // return orderDate >= startOfSelectedRange && orderDate <= today;

      const orderDate = startOfDay(new Date(order.createdAt)); // Ensure order date starts at the beginning of the day
      return orderDate >= startOfSelectedRange && orderDate < startOfDay(today);
    });

    filteredOrders.forEach((order) => {
      // const orderDate = new Date(order.createdAt);
      // const daysAgo = differenceInDays(today, startOfDay(orderDate));
      const orderDate = startOfDay(new Date(order.createdAt));
      const daysAgo = differenceInCalendarDays(orderDate, startOfSelectedRange);
      ordersByDay[daysAgo] += Number(order.totalLineItemsPrice);
      ordersCountByDay[daysAgo]++;
      discountsByDay[daysAgo] += Number(order.totalDiscounts);
    });

    console.log(" ordersByDay", ordersByDay);
    console.log("ordersCountByDay", ordersCountByDay);
    console.log("discountsByDay12", discountsByDay);

    const averageOrderByDay = ordersByDay.map((total, index) => {
      const average =
        ordersCountByDay[index] > 0
          ? (total - discountsByDay[index]) / ordersCountByDay[index]
          : 0;
      console.log("avg12", average);

      const dayDate = addDays(startOfSelectedRange, index);
      const formattedDate = dayDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        x: formattedDate,
        y: average.toFixed(2),
      };
    });

    const totalOrderValue = ordersByDay.reduce((acc, val, index) => {
      const total = val - discountsByDay[index]; // Subtract discounts from orders
      return acc + total;
    }, 0);

    const totalOrderCount = ordersCountByDay.reduce((acc, val) => acc + val, 0);

    const totalAverageOrder =
      totalOrderCount > 0
        ? (totalOrderValue / totalOrderCount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00";

    setTotalAverageOrder(totalAverageOrder);

    return averageOrderByDay;
  };

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
          Total Average Order
        </Text>
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm" fontWeight="medium">
            ₹{totalAverageOrder}
          </Text>
        </BlockStack>
        <BlockStack gap="200">
          <div>
            <ApexCharts
              options={chartOptions}
              series={[{ name: "Average Order", data: averageOrderData }]}
              type="line"
              height={245}
            />
          </div>
        </BlockStack>
      </Card>
    </div>
  );
};

export default AverageOrder;
