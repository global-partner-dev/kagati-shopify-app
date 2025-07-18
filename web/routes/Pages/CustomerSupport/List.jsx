/**
 * CustomerSupportListPage Component
 * 
 * This component displays a list of customer support orders, allowing the user to view, filter, sort, and manage these orders.
 * It provides detailed information about each order, including its status, associated store, and other relevant details.
 * 
 * Features:
 * - Display orders with various details such as order number, split ID, store information, status, payment status, and creation date.
 * - Fetches and displays additional order data such as financial status and notes associated with each order.
 * - Allows filtering, sorting, and searching through the orders.
 * - Provides bulk actions for managing order status and reassigning orders.
 * - Includes navigation links to detailed views of orders and edit order pages.
 * 
 * Usage:
 * 
 * <CustomerSupportListPage />
 */

import { useState, useEffect } from "react";
import { useIndexResourceState, Page, IndexTable, Badge, Text, InlineStack, Link, Tooltip, Box, Icon } from "@shopify/polaris";
import { NoteIcon, PlusIcon, EditIcon } from "@shopify/polaris-icons";
import { api } from "../../../api";
import { useFindMany } from "@gadgetinc/react";
import { useNavigate, useLocation } from "react-router-dom";

import TableComponent from "../../../components/TableComponent";
import { dateFormatter, convertSortOrder } from "../../../util/commonFunctions";
import SpinnerComponent from "../../../components/SpinnerComponent";

const CustomerSupportListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const customerId = queryParams.get("customerId");
  const NumberOnPage = 50;
  const [cursor, setCursor] = useState({ first: NumberOnPage });
  const [filterBy, setFilterBy] = useState({});
  const [searchBy, setSearchBy] = useState("");
  const [sortSelected, setSortSelected] = useState(["createdAt desc"]);
  const [status, setStatus] = useState(false);
  const [reAssign, setReAssign] = useState(false);
  const [locations, setLocations] = useState([]);
  const [storeCode, setStoreCode] = useState([]);
  const [splitsData, setSplitsData] = useState([]);
  const [selectStoreCode, setSelectStoreCode] = useState("");
  const [storeOptions, setStoreOptions] = useState([]);
  const [orderDataState, setOrderDataState] = useState({});

  const searchParams = searchBy ? { search: searchBy } : {};
  console.log('========>filterBy', filterBy);

  const [{ data: splits, fetching: splitsFetching, error: splitsError }] = useFindMany(api.khagatiOrderSplit, {
    ...cursor,
    select: {
      id: true,
      orderReferenceId: true,
      orderStatus: true,
      reAssignStatus: true,
      onHoldStatus: true,
      storeName: true,
      storeCode: true,
      orderNumber: true,
      splitId: true,
      createdAt: true,
    },
    ...searchParams,
    filter: {
      // onHoldStatus: { notIn: [null, "null"] },
      // orderStatus: { in: ["on_hold", "cancel"] },
      orderStatus: { in: ["on_hold"] },
      ...filterBy,
    },
    sort: convertSortOrder(sortSelected),
  });

  const [{ data: locationData, fetching: locationsFetching, error: locationsError }] = useFindMany(api.shopifyLocation, {
    select: {
      id: true,
      name: true
    }
  });

  const [{ data: storeData, fetching: storesFetching, error: storesError }] = useFindMany(api.khagatiStores, {
    select: {
      id: true,
      storeCode: true,
      storeName: true
    },
    filter: {
      status: { in: ["Active"] }
    }
  });

  const resourceNameSplit = {
    singular: "customer support",
    plural: "customers support",
  };

  const splitHeadings = [
    { title: "Order" },
    { title: "Split Id" },
    { title: "Store Code" },
    { title: "Store Name" },
    { title: "Status" },
    { title: "On Hold Status" },
    { title: "Payment Status" },
    { title: "Date" },
    { title: "Edit" },
  ];

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(splitsData);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const newOrderData = {};
        for (const split of splits || []) {
          try {
            const orderData = await api.shopifyOrder.findOne(split.orderReferenceId, {
              select: {
                financialStatus: true,
                note: true,
              }
            });
            newOrderData[split.orderReferenceId] = orderData;
          } catch (error) {
            if (error instanceof RecordNotFoundError) {
              console.error(`Shopify order data not found for orderReferenceId: ${split.orderReferenceId}`);
              // Handle not found scenario, if required
              newOrderData[split.orderReferenceId] = null; // Set null or handle appropriately
            } else {
              console.error(`Error fetching Shopify order data: ${error.message}`);
              // Handle other errors
            }
          }
        }
        setOrderDataState(newOrderData);
      } catch (error) {
        console.error(`Error fetching order data: ${error.message}`);
        // Handle overall error for fetching order data, if needed
      }
    };

    if (splits && splits.length > 0) {
      fetchOrderData();
    }
  }, [splits, api]);

  const SplitRow = ({ split, selected, navigate, index }) => {
    if (!split) {
      return null;
    }
    const { id, orderReferenceId, orderStatus, reAssignStatus, onHoldStatus, storeName, storeCode, orderNumber, splitId, createdAt } = split;
    // const orderData = orderDataState[orderReferenceId];
    const convertDate = dateFormatter.format(createdAt);
    const date = convertDate.replace("PM", "pm").replace("AM", "am");

    const [{ data, fetching, error }] = useFindMany(api.khagatiOrder, {
      select: {
        // noteAttributes: true,
        note: true,
        financialStatus: true,
      },
      filter: {
        orderId: { equals: orderReferenceId },
      },
    });

    return (
      <>
        {data && data.length ? (
          <IndexTable.Row
            id={id}
            key={id}
            position={index}
            selected={selected}
          >
            <IndexTable.Cell>
              <Text as="h6" variant="headingSm">
                <InlineStack gap="200">
                  <Link
                    removeUnderline
                    monochrome
                    onClick={() => navigate(`/customer-support/detail/${orderReferenceId}/${id}`)}
                  >
                    <Text fontWeight="bold" as="span">{'#' + orderNumber}</Text>
                  </Link>
                  <Tooltip content={<Box>
                    <Text as="h6" variant="headingSm" alignment="center">Note</Text>
                    <Text alignment="center">{data && data[0]?.note}</Text>
                  </Box>}>
                    {data && data[0]?.note && <Icon source={NoteIcon} />}
                  </Tooltip>
                </InlineStack>
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <InlineStack align="start">
                <Text as="span" variant="bodyMd">
                  {splitId}
                  {/* {`${orderNumber}-${data && data[0]?.noteAttributes.find(({ name }) => name === "_storeCode")?.value}`} {reAssignStatus && <Badge tone="info">Reassign</Badge>} */}
                </Text>
              </InlineStack>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd">
                {storeCode}
                {/* {data && data[0]?.noteAttributes.find(({ name }) => name === "_storeCode")?.value} */}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd">
                {storeName}
                {/* {data && data[0]?.noteAttributes.find(({ name }) => name === "_storeName")?.value} */}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Badge
                tone={orderStatus === "confirm" ? "info" : orderStatus === "out_for_delivery" ? "warning" : orderStatus === "ready_for_pickup" ? "warning" : orderStatus === "cancel" ? "critical" : orderStatus === "delivered" ? "success" : orderStatus === "on_hold" ? "attention" : ""}>
                {statusOptions.find((option) => option.value === orderStatus)?.label}
              </Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Badge
                tone={onHoldStatus === "pending" ? "warning" : onHoldStatus === "closed" ? "success" : onHoldStatus === "open" ? "attention" : ""}>
                {onHoldStatus === "open" ? "Open" : onHoldStatus === "closed" ? "Closed" : onHoldStatus === "pending" ? "Pending" : ""}
              </Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Badge
                tone={data && data[0]?.financialStatus === "pending" ? "warning" : ""}
                progress={
                  data && data[0]?.financialStatus === "pending" ? "incomplete" : "complete"
                }
              >
                {data && data[0]?.financialStatus === "pending" ? "Payment pending" : "Paid"}
              </Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd">
                {date}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Link
                removeUnderline
                monochrome
                onClick={() => {
                  if (!(orderStatus === "cancel")) {
                    navigate(`/orders/edit/${orderReferenceId}`);
                  }
                }}
              >
                <Icon source={EditIcon} tone="base" />
              </Link>
            </IndexTable.Cell>
          </IndexTable.Row>
        ) : (
          null
        )}
      </>
    );
  };

  const rowMarkUpSplits = splitsData?.map((split, index) => (
    <SplitRow
      index={index}
      key={split.id}
      split={split}
      selected={selectedResources.includes(split.id)}
      navigate={navigate}
    />
  ));

  const splitFilterOptions = [
    { label: "All", value: {} },
    { label: "Open", value: { onHoldStatus: { equals: "open" } } },
    { label: "Closed", value: { onHoldStatus: { equals: "closed" } } },
    { label: "Pending", value: { onHoldStatus: { equals: "pending" } } },
  ];

  const splitSortOptions = [
    { label: "Date", value: "createdAt asc", directionLabel: "Oldest to newest" },
    { label: "Date", value: "createdAt desc", directionLabel: "Newest to oldest" },
    { label: "Id", value: "id asc", directionLabel: "Ascending" },
    { label: "Id", value: "id desc", directionLabel: "Descending" },
    { label: "Order number", value: "orderNumber asc", directionLabel: "Ascending" },
    { label: "Order number", value: "orderNumber desc", directionLabel: "Descending" },
    { label: "Split Id", value: "splitId asc", directionLabel: "A-Z" },
    { label: "Split Id", value: "splitId desc", directionLabel: "Z-A" },
    { label: "Store Code", value: "storeCode asc", directionLabel: "A-Z" },
    { label: "Store Code", value: "storeCode desc", directionLabel: "Z-A" },
    { label: "Store Name", value: "storeName asc", directionLabel: "A-Z" },
    { label: "Store Name", value: "storeName desc", directionLabel: "Z-A" },
    { label: "Order status", value: "orderStatus asc", directionLabel: "A-Z" },
    { label: "Order status", value: "orderStatus desc", directionLabel: "Z-A" },
  ];

  const statusBulkActions = [
    {
      content: 'Reassign Order',
      onAction: () => {
        setReAssign(!reAssign);
        const formattedStores = storeData.filter(store => store.storeCode !== selectStoreCode).map(store => ({ label: store.storeName, value: store.storeCode }));
        setStoreOptions(formattedStores);
      },
    },
    {
      content: 'Status',
      onAction: () => setStatus(!status),
    },
  ];

  const statusOptions = [
    { label: "New", value: "new" },
    { label: "Confirm", value: "confirm" },
    { label: "Ready For Pickup", value: "ready_for_pickup" },
    { label: "Out For Delivery", value: "out_for_delivery" },
    { label: "Delivered", value: "delivered" },
    { label: "On Hold", value: "on_hold" },
    { label: "Cancel", value: "cancel" },
  ];

  useEffect(() => {
    if (locationData) {
      const locations = locationData.map(({ id, name }) => ({ value: id, label: name }));
      setLocations(locations);
    }
  }, [locationData]);

  useEffect(() => {
    if (storeData) {
      const stores = storeData.map(({ storeCode, storeName }) => ({ value: storeCode, label: storeName }));
      stores.unshift({ value: "", label: "All locations" });
      setStoreCode(stores);
    }
  }, [storeData]);

  useEffect(() => {
    if (splits) {
      setSplitsData(splits);
    }
  }, [splits]);

  return (
    <Page
      fullWidth
      compactTitle
      title="Customer Support"
      primaryAction={{
        content: "Create order",
        icon: PlusIcon,
        onClick: () => navigate("/orders/draft/new"),
      }}
    >
      <TableComponent
        tableData={splitsData}
        tableHeadings={splitHeadings}
        tableRowMarkUp={rowMarkUpSplits}
        tableFilterOptions={splitFilterOptions}
        tableSetCursor={setCursor}
        tableNumberOnPage={NumberOnPage}
        tableSetFilterBy={setFilterBy}
        tableSetSearchBy={setSearchBy}
        tableSelectedResources={selectedResources}
        tableAllResourcesSelected={allResourcesSelected}
        tableHandleSelectionChange={handleSelectionChange}
        tableResourceName={resourceNameSplit}
        tableSortOptions={splitSortOptions}
        tableSortSelected={sortSelected}
        tableSetSortSelected={setSortSelected}
        tablePromotedBulkActions={statusBulkActions}
      />
    </Page>
  );
};

export default CustomerSupportListPage;