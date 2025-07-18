/**
 * DateRangePicker Component
 * 
 * This component renders a customizable date range picker that allows users to select predefined date ranges 
 * such as "Today", "Yesterday", "Last 7 days", or define a custom date range. The selected date range can be 
 * passed back to the parent component using the `onDateRangeChange` callback.
 * 
 * Features:
 * - Predefined date ranges: Users can quickly select from commonly used date ranges.
 * - Custom date range: Users can manually input start and end dates or select them from a calendar.
 * - Responsive design: The layout adjusts based on the screen size, displaying options as a dropdown on smaller screens.
 * - Calendar view: Users can pick dates using a calendar with support for month navigation.
 * - Input validation: Ensures that the input date strings follow the correct format and are valid dates.
 * - Popover: The date picker is presented in a popover that can be toggled with a button.
 * 
 * Props:
 * - onDateRangeChange (function): A callback function that receives the selected date range when the user applies the changes.
 * 
 * Usage:
 * 
 * <DateRangePicker onDateRangeChange={(range) => console.log(range)} />
 */

import React, { useEffect, useState, useRef } from "react";
import {
  useBreakpoints,
  BlockStack,
  Box,
  Button,
  InlineGrid,
  DatePicker,
  InlineStack,
  OptionList,
  Popover,
  TextField,
  Scrollable,
  Icon,
  Select,
} from "@shopify/polaris";
import { CalendarIcon, ArrowRightIcon } from "@shopify/polaris-icons";

function DateRangePicker({ onDateRangeChange }) {
  const { mdDown, lgUp } = useBreakpoints();
  const shouldShowMultiMonth = lgUp;
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterday = new Date(
    new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0)
  );

  // Predefined date ranges
  const ranges = [
    {
      title: "Today",
      alias: "today",
      period: {
        since: today,
        until: today,
      },
    },
    {
      title: "Yesterday",
      alias: "yesterday",
      period: {
        since: yesterday,
        until: yesterday,
      },
    },
    {
      title: "Last 7 days",
      alias: "last7days",
      period: {
        since: new Date(
          new Date(new Date().setDate(today.getDate() - 7)).setHours(0, 0, 0, 0)
        ),
        until: yesterday,
      },
    },
  ];

  const [popoverActive, setPopoverActive] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState(ranges[0]);
  const [inputValues, setInputValues] = useState({});
  const [{ month, year }, setDate] = useState({
    month: activeDateRange.period.since.getMonth(),
    year: activeDateRange.period.since.getFullYear(),
  });

  const datePickerRef = useRef(null);

  // Validation regex for date strings in YYYY-MM-DD format
  const VALID_YYYY_MM_DD_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}/;

  // Utility functions for date validation and formatting
  function isDate(date) {
    return !isNaN(new Date(date).getDate());
  }

  function isValidYearMonthDayDateString(date) {
    return VALID_YYYY_MM_DD_DATE_REGEX.test(date) && isDate(date);
  }

  function isValidDate(date) {
    return date.length === 10 && isValidYearMonthDayDateString(date);
  }

  function parseYearMonthDayDateString(input) {
    const [year, month, day] = input.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  function formatDateToYearMonthDayDateString(date) {
    const year = String(date.getFullYear());
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());
    if (month.length < 2) {
      month = String(month).padStart(2, "0");
    }
    if (day.length < 2) {
      day = String(day).padStart(2, "0");
    }
    return [year, month, day].join("-");
  }

  function formatDate(date) {
    return formatDateToYearMonthDayDateString(date);
  }

  // Utility functions to manage node hierarchy within the popover
  function nodeContainsDescendant(rootNode, descendant) {
    if (rootNode === descendant) {
      return true;
    }
    let parent = descendant.parentNode;
    while (parent != null) {
      if (parent === rootNode) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }

  function isNodeWithinPopover(node) {
    return datePickerRef?.current
      ? nodeContainsDescendant(datePickerRef.current, node)
      : false;
  }

  // Handlers for input field changes and validation
  function handleStartInputValueChange(value) {
    setInputValues((prevState) => ({ ...prevState, since: value }));
    if (isValidDate(value)) {
      const newSince = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newSince <= prevState.period.until
            ? { since: newSince, until: prevState.period.until }
            : { since: newSince, until: newSince };
        return {
          ...prevState,
          period: newPeriod,
        };
      });
    }
  }

  function handleEndInputValueChange(value) {
    setInputValues((prevState) => ({ ...prevState, until: value }));
    if (isValidDate(value)) {
      const newUntil = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newUntil >= prevState.period.since
            ? { since: prevState.period.since, until: newUntil }
            : { since: newUntil, until: newUntil };
        return {
          ...prevState,
          period: newPeriod,
        };
      });
    }
  }

  function handleInputBlur({ relatedTarget }) {
    const isRelatedTargetWithinPopover =
      relatedTarget != null && isNodeWithinPopover(relatedTarget);
    if (isRelatedTargetWithinPopover) {
      return;
    }
    setPopoverActive(false);
  }

  // Handle month change in the calendar
  function handleMonthChange(month, year) {
    setDate({ month, year });
  }

  // Handle calendar date selection
  function handleCalendarChange({ start, end }) {
    const newDateRange =
      ranges.find(
        (range) =>
          range.period.since.valueOf() === start.valueOf() &&
          range.period.until.valueOf() === end.valueOf()
      ) || {
        alias: "custom",
        title: "Custom",
        period: {
          since: start,
          until: end,
        },
      };
    setActiveDateRange(newDateRange);
  }

  // Apply and cancel button handlers
  function apply() {
    onDateRangeChange(activeDateRange);
    setPopoverActive(false);
  }

  function cancel() {
    setPopoverActive(false);
  }

  // Effect to synchronize input fields and calendar with the active date range
  useEffect(() => {
    if (activeDateRange) {
      setInputValues({
        since: formatDate(activeDateRange.period.since),
        until: formatDate(activeDateRange.period.until),
      });
      function monthDiff(referenceDate, newDate) {
        return (
          newDate.month -
          referenceDate.month +
          12 * (referenceDate.year - newDate.year)
        );
      }
      const monthDifference = monthDiff(
        { year, month },
        {
          year: activeDateRange.period.until.getFullYear(),
          month: activeDateRange.period.until.getMonth(),
        }
      );
      if (monthDifference > 1 || monthDifference < 0) {
        setDate({
          month: activeDateRange.period.until.getMonth(),
          year: activeDateRange.period.until.getFullYear(),
        });
      }
    }
  }, [activeDateRange]);

  // Button value based on selected date range
  const buttonValue =
    activeDateRange.title === "Custom"
      ? `${activeDateRange.period.since.toDateString()} - ${activeDateRange.period.until.toDateString()}`
      : activeDateRange.title;

  return (
    <Popover
      active={popoverActive}
      autofocusTarget="none"
      preferredAlignment="left"
      preferredPosition="below"
      fluidContent
      sectioned={false}
      fullHeight
      activator={
        <Button
          size="slim"
          icon={CalendarIcon}
          onClick={() => setPopoverActive(!popoverActive)}
        >
          {buttonValue}
        </Button>
      }
      onClose={() => setPopoverActive(false)}
    >
      <Popover.Pane fixed>
        <InlineGrid
          columns={{
            xs: "1fr",
            mdDown: "1fr",
            md: "max-content max-content",
          }}
          gap={0}
          ref={datePickerRef}
        >
          <Box
            maxWidth={mdDown ? "516px" : "212px"}
            width={mdDown ? "100%" : "212px"}
            padding={{ xs: 500, md: 0 }}
            paddingBlockEnd={{ xs: 100, md: 0 }}
          >
            {mdDown ? (
              <Select
                label="dateRangeLabel"
                labelHidden
                onChange={(value) => {
                  const result = ranges.find(
                    ({ title, alias }) => title === value || alias === value
                  );
                  setActiveDateRange(result);
                }}
                value={activeDateRange?.title || activeDateRange?.alias || ""}
                options={ranges.map(({ alias, title }) => title || alias)}
              />
            ) : (
              <Scrollable style={{ height: "334px" }}>
                <OptionList
                  options={ranges.map((range) => ({
                    value: range.alias,
                    label: range.title,
                  }))}
                  selected={activeDateRange.alias}
                  onChange={(value) => {
                    setActiveDateRange(
                      ranges.find((range) => range.alias === value[0])
                    );
                    onDateRangeChange(activeDateRange);
                  }}
                />
              </Scrollable>
            )}
          </Box>
          <Box padding={{ xs: 500 }} maxWidth={mdDown ? "320px" : "516px"}>
            <BlockStack gap="400">
              <InlineStack gap="200">
                <div style={{ flexGrow: 1 }}>
                  <TextField
                    role="combobox"
                    label={"Since"}
                    labelHidden
                    prefix={<Icon source={CalendarIcon} />}
                    value={inputValues.since}
                    onChange={handleStartInputValueChange}
                    onBlur={handleInputBlur}
                    autoComplete="off"
                  />
                </div>
                <Icon source={ArrowRightIcon} />
                <div style={{ flexGrow: 1 }}>
                  <TextField
                    role="combobox"
                    label={"Until"}
                    labelHidden
                    prefix={<Icon source={CalendarIcon} />}
                    value={inputValues.until}
                    onChange={handleEndInputValueChange}
                    onBlur={handleInputBlur}
                    autoComplete="off"
                  />
                </div>
              </InlineStack>
              <div>
                <DatePicker
                  month={month}
                  year={year}
                  selected={{
                    start: activeDateRange.period.since,
                    end: activeDateRange.period.until,
                  }}
                  onMonthChange={handleMonthChange}
                  onChange={handleCalendarChange}
                  multiMonth={shouldShowMultiMonth}
                  allowRange
                />
              </div>
            </BlockStack>
          </Box>
        </InlineGrid>
      </Popover.Pane>
      <Popover.Pane fixed>
        <Popover.Section>
          <InlineStack align="end">
            <Button onClick={cancel}>Cancel</Button>
            <Button primary onClick={apply}>
              Apply
            </Button>
          </InlineStack>
        </Popover.Section>
      </Popover.Pane>
    </Popover>
  );
}

export default DateRangePicker;