
/**
 * OrderListPage Component
 *
 * This component displays a list of customer orders and their associated splits, providing various functionalities
 * such as filtering, sorting, searching, exporting, importing, and bulk actions like reassigning orders or updating their status.
 * It serves as the main interface for managing orders and splits within the Shopify store.
 *
 * Features:
 * - Displays a paginated list of orders or order splits, depending on the selected store code or filter.
 * - Provides filtering options based on payment status, fulfillment status, and more.
 * - Supports sorting orders by various criteria, including date, total price, and fulfillment status.
 * - Allows searching for orders by customer name or order number.
 * - Export orders as a CSV file, with options for different formats.
 * - Import orders from a CSV file.
 * - Perform bulk actions on selected orders, such as reassigning to different stores or updating order status.
 * - Display split order information, including store details and current order status.
 * - Provides navigation to detailed order or split order pages for further management.
 *
 * Usage:
 *
 * <OrderListPage />
 *
 * Dependencies:
 * - React hooks (useState, useEffect, useCallback)
 * - Polaris components from Shopify (Page, IndexTable, Badge, etc.)
 * - Gadget API for fetching and updating data
 * - Utility functions for formatting dates and managing sorting/filtering logic
 *
 * Props:
 * - No props are required. The component manages its state internally and interacts with the Shopify and Gadget APIs.
 */

import { useState, useCallback, useEffect } from "react";
import {
  useIndexResourceState, Page, IndexTable, Badge, Text, InlineStack, BlockStack, Link, ChoiceList,
  Icon, Tooltip, Box, Button
} from "@shopify/polaris";
import { PlusIcon, EditIcon, NoteIcon } from "@shopify/polaris-icons";
import TableComponent from "../../../components/TableComponent";
import { api } from "../../../api";
import { useUser } from "@gadgetinc/react";
import { useFindMany, useGlobalAction } from "@gadgetinc/react";
import { useNavigate, useLocation } from "react-router-dom";
import { dateFormatter, convertSortOrder } from "../../../util/commonFunctions";
import ModalComponent from "../../../components/ModalComponent";
import SelectComponent from "../../../components/SelectComponent";
import ToolTipComponent from "../../../components/ToolTipComponent";
import * as Papa from "papaparse";
import OptionListComponent from "../../../components/OptionListComponent";
import SpinnerComponent from "../../../components/SpinnerComponent";

const OrderListPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Add this line
  const queryParams = new URLSearchParams(location.search);
  const customerId = queryParams.get("customerId");
  const NumberOnPage = 25;
  const [cursor, setCursor] = useState({ first: NumberOnPage });
  const [activeExport, setActiveExport] = useState(false);
  const [selectedExport, setSelectedExport] = useState(["current_page"]);
  const [selectedExportAs, setSelectedExportAs] = useState(["csv_excel"]);
  const [filterBy, setFilterBy] = useState({});
  console.log("filterBy------->", filterBy);
  const [searchBy, setSearchBy] = useState("");
  const [sortSelected, setSortSelected] = useState(["createdAt desc"]);
  const [status, setStatus] = useState(false);
  const [reAssign, setReAssign] = useState(false);
  const [activeImport, setActiveImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [locations, setLocations] = useState([]);
  const [storeCode, setStoreCode] = useState([]);
  const [splitsData, setSplitsData] = useState([]);
  const [selectStoreCode, setSelectStoreCode] = useState("");
  const [storeOptions, setStoreOptions] = useState([]);
  const [reassignSelectStoreCode, setReassignSelectStoreCode] = useState("");
  const [orderDatas, setOrderDatas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeAccess, setStoreAccess] = useState([]);
  const [storeModuleAccess, setStoreModuleAccess] = useState([]);
  const { selectedPreviousStoreCode } = location.state || {};

  const user = useUser();
  useEffect(() => {
    if (user.storeAccess) {
      setStoreAccess(user.storeAccess);
      setStoreModuleAccess(user.storeModuleAccess)
      setIsLoading(false);
    }
  }, [user.storeAccess]);

  const handleClose = () => {
    setActiveExport(false);
    setActiveImport(false);
  };

  const handleStatusClose = () => {
    setStatus(false);
  };

  const handleReAssignClose = () => {
    setReAssign(false);
  };

  const handleSelectedExport = useCallback(
    (value) => setSelectedExport(value),
    []
  );

  const handleSelectedExportAs = useCallback(
    (value) => setSelectedExportAs(value),
    []
  );

  const handleImport = useCallback((acceptedFiles) => {
    setImporting(true);
    const file = acceptedFiles[0];
    Papa.parse(file, {
      complete: function (results) {
        setImporting(false);
        setActiveImport(false);
      },
      header: true,
    });
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = () => {
    if (!orderDatas || orderDatas.length === 0) {
      alert("No orders to export.");
      return;
    }

    let csvContent = "";
    csvContent += "Id,Date,Customer Name,Channel,Total Price,Payment Status,Fulfillment Status,Items";

    // orderDatas.forEach((order) => {
    //   const optionsDate = { year: 'numeric', month: 'short', day: 'numeric' };
    //   const date = new Date(order.createdAt).toLocaleDateString('en-US');
    //   const row = [
    //     order.id,
    //     `${date}`,
    //     `${order.customer.firstName} ${order.customer.lastName}`,
    //     order.currency,
    //     order.currentTotalPrice,
    //     order.financialStatus,
    //     order.fulfillmentStatus || "Unfulfilled",
    //     order.lineItems.length,

    //   ].join(",");
    //   csvContent += row + "\n";
    // });

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: 'text/csv;charset=utf-8;' });
    const fileUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', 'exported_orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);

    handleClose();
  };

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

  const searchParams = searchBy ? { search: searchBy } : {};
  const [{ data: splitsOrder, fetching, error }] = useFindMany(api.khagatiOrderSplit, {
    ...cursor, // Add your cursor pagination here
    select: {
      id: true,
      orderReferenceId: true,
      orderStatus: true,
      reAssignStatus: true,
      storeName: true,
      storeCode: true,
      orderNumber: true,
      splitId: true,
      createdAt: true,
    },
    ...searchParams,
    filter: {
      // storeCode: { equals: selectStoreCode },
      ...filterBy,
    },
    sort: convertSortOrder(sortSelected),
    live: true
  });

  useEffect(() => {
    if (splitsOrder) {
      setSplitsData(splitsOrder);
    }
  }, [splitsOrder]);

  const customerFilter = customerId ? { customer: { id: { equals: customerId } } } : {};

  //   const [{ data: orders, fetching, error }] = useFindMany(api.khagatiOrder, {
  //     ...cursor,
  //     select: {
  //       id: true,
  //       name: true,
  //       createdAt: true,
  //       customer: true,
  //       lineItems: true,
  //       currentTotalPrice: true,
  //       currency: true,
  //       financialStatus: true,
  //       fulfillmentStatus: true,
  //       tags: true,
  //       note: true,
  //       orderId: true,
  //       noteAttributes: true,
  //     },
  //     ...searchParams,
  //     filter: {
  //       ...filterBy,
  //       ...customerFilter,
  //     },
  //     sort: convertSortOrder(sortSelected),
  //   });
  // useEffect(() => {
  //   setOrderDatas(orders)
  // }, [orderDatas, orders])
  // console.log("orders------->", orders);

  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const resourceNameSplit = {
    singular: "split",
    plural: "splits",
  };

  const headings = [
    { title: "Order" },
    { title: "Date" },
    { title: "Customer" },
    // { title: "Channel" },
    { title: "Total" },
    { title: "Payment status" },
    { title: "Fulfillment status" },
    { title: "Items" },
    // { title: "Delivery status" },
    // { title: "Delivery method" },
    // { title: "Status" },
    { title: "Shipping method" },
    // { title: "Tags" },
    { title: "Order Status" },
    { title: "Edit" },
  ];

  const splitHeadings = [
    { title: "Order" },
    { title: "Split Id" },
    { title: "Store Code" },
    { title: "Store Name" },
    { title: "Status" },
    { title: "Date" },
  ];

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(splitsData && splitsData.length ? splitsData : orderDatas);

  //   const OrderRow = ({ order, selected, navigate, index }) => {
  //     const { id, name, customer, tags, currency, currentTotalPrice, financialStatus, fulfillmentStatus, lineItems, createdAt, note, orderId, noteAttributes } = order;
  //     const convertDate = dateFormatter.format(createdAt);
  //     const date = convertDate.replace("PM", "pm").replace("AM", "am");
  //     let splitData;
  //     const [{ data: splits, fetching: splitFetching, error: splitError }] = useFindMany(api.khagatiOrderSplit, {
  //       select: {
  //         orderNumber: true,
  //         orderReferenceId: true,
  //         splitId: true,
  //         storeName: true,
  //         orderStatus: true,
  //       },
  //       filter: {
  //         orderReferenceId: { equals: orderId },
  //       },
  //     });

  //     if (splits && splits.length && noteAttributes) {
  //       const updatedSplits = splits.map(split => {
  //         return {
  //           orderReferenceId: split.orderReferenceId,
  //           splitId: `${split.orderNumber}-${noteAttributes.find(({ name }) => name === "_storeCode")?.value}`,
  //           storeName: noteAttributes.find(({ name }) => name === "_storeName")?.value,
  //           orderStatus: split.orderStatus
  //         };
  //       });
  //       splitData = updatedSplits;
  //     }

  //     return (
  //       <IndexTable.Row
  //         id={id}
  //         key={id}
  //         position={index}
  //         selected={selected}
  //       >
  //         <IndexTable.Cell>
  //           <Text as="h6" variant="headingSm">
  //             <InlineStack gap="200">
  //               <Link
  //                 removeUnderline
  //                 monochrome
  //                 onClick={() => navigate(`/orders/${orderId}`)}
  //               >
  //                 <Text fontWeight="bold" as="span">{name}</Text>
  //               </Link>
  //               <Tooltip content={<Box>
  //                 <Text as="h6" variant="headingSm" alignment="center">Note</Text>
  //                 <Text alignment="center">{note}</Text>
  //               </Box>}>
  //                 {note && <Icon source={NoteIcon} />}
  //               </Tooltip>
  //             </InlineStack>
  //           </Text>
  //         </IndexTable.Cell>
  //         <IndexTable.Cell>
  //           <InlineStack align="start">
  //             <Text as="span" variant="bodyMd">
  //               {date}
  //             </Text>
  //           </InlineStack>
  //         </IndexTable.Cell>
  //         <IndexTable.Cell>
  //           <Text as="span" variant="bodyMd">
  //             {customer?.firstName} {customer?.lastName}
  //           </Text>
  //         </IndexTable.Cell>
  //         {/* <IndexTable.Cell>
  //           <Text as="span" variant="bodyMd"></Text>
  //         </IndexTable.Cell> */}
  //         <IndexTable.Cell>
  //           <Text as="span" variant="bodyMd">
  //             {currency === "INR" ? "₹" : "$"}{currentTotalPrice}
  //           </Text>
  //         </IndexTable.Cell>
  //         <IndexTable.Cell>
  //           <Badge
  //             tone={financialStatus === "pending" ? "warning" : ""}
  //             progress={
  //               financialStatus === "pending" ? "incomplete" : "complete"
  //             }
  //           >
  //             {financialStatus === "pending" ? "Payment pending" : "Paid"}
  //           </Badge>
  //         </IndexTable.Cell>
  //         <IndexTable.Cell>
  //           <Badge
  //             tone={fulfillmentStatus === null ? "attention" : ""}
  //             progress={
  //               fulfillmentStatus === null ? "incomplete" : "complete"
  //             }
  //           >
  //             {fulfillmentStatus === null ? "Unfulfilled" : "Fulfilled"}
  //           </Badge>
  //         </IndexTable.Cell>
  //         <IndexTable.Cell>
  //           <Text as="span" variant="bodyMd">
  //             {lineItems.length}{" "}
  //             {lineItems.length > 1 ? "items" : "item"}
  //           </Text>
  //         </IndexTable.Cell>
  //         {/* <IndexTable.Cell>
  //           {splits && splits?.length ? '' : <Badge>
  //             New
  //           </Badge>}
  //         </IndexTable.Cell> */}
  //         <IndexTable.Cell>
  //           <Badge tone="warning">
  //             Shipping
  //           </Badge>
  //         </IndexTable.Cell>
  //         {/* <IndexTable.Cell>
  //           <InlineStack gap="100">
  //             {tags.map((tag, index) => (
  //               <Badge key={index}>{tag}</Badge>
  //             ))}
  //           </InlineStack>
  //         </IndexTable.Cell> */}
  //         <IndexTable.Cell >
  //           <ToolTipComponent
  //             toolTipName={splits && splits?.length ? splits?.length > 1 ? `${splits?.length} Routes` : `${splits?.length} Route` : ""}
  //             toolTipValues={splits && splits?.length ? splits : []}
  //             statusOptions={statusOptions}
  //           />
  //           {/* <ToolTipComponent
  //             toolTipName={noteAttributes && noteAttributes?.length ? "1 Route" : ""}
  //             toolTipValues={splitData && splitData?.length ? splitData : []}
  //             statusOptions={statusOptions}
  //           /> */}
  //         </IndexTable.Cell>
  //         <IndexTable.Cell>
  //           <Link
  //             removeUnderline
  //             monochrome
  //             onClick={() => {
  //               if (splits && splits.length && !(splits[0].orderStatus === "cancel")) {
  //                 navigate(`/orders/edit/${orderId}`);
  //               }
  //             }}
  //           >
  //             <div style={{ opacity: (splits && splits.length && !(splits[0].orderStatus === "cancel")) ? 1 : 0.1 }}>
  //               <Icon source={EditIcon} tone="base" />
  //             </div>
  //           </Link>
  //         </IndexTable.Cell>
  //       </IndexTable.Row>
  //     );
  //   };

  const SplitRow = ({ split, selected, navigate, index }) => {
    const { id, orderReferenceId, orderStatus, reAssignStatus, storeName, storeCode, orderNumber, splitId, createdAt } = split;
    const convertDate = dateFormatter.format(createdAt);
    const date = convertDate.replace("PM", "pm").replace("AM", "am");
    return (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
        selected={selected}
      >
        <IndexTable.Cell>
          <Link
            dataPrimaryLink
            removeUnderline
            monochrome
            onClick={() => navigate(`/orders/split/${orderReferenceId}/${id}`)}
          >
            <Text as="h6" variant="headingSm">
              <InlineStack gap="200">
                {'#' + orderNumber}
              </InlineStack>
            </Text>
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack align="start">
            <Text as="span" variant="bodyMd">
              {splitId} {reAssignStatus && <Badge tone="info">Reassign</Badge>}
            </Text>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {storeCode}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {storeName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge
            tone={orderStatus === "confirm" ? "info" : orderStatus === "ready_for_pickup" || orderStatus === "out_for_delivery" ? "warning" : orderStatus === "delivered" ? "success" : orderStatus === "on_hold" || orderStatus === "cancel" ? "critical" : ""}>
            {statusOptions.find((option) => option.value === orderStatus)?.label}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {date}
          </Text>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  };

  const rowMarkUp = orderDatas?.map((order, index) => (
    <OrderRow
      index={index}
      key={order.id}
      order={order}
      selected={selectedResources.includes(order.id)}
      navigate={navigate}
    />
  ));

  const rowMarkUpSplits = splitsData?.map((split, index) => (
    <SplitRow
      index={index}
      key={split.id}
      split={split}
      selected={selectedResources.includes(split.id)}
      navigate={navigate}
    />
  ));

  const filterOptions = [
    { label: "All", value: {} },
    { label: "Paid", value: { financialStatus: { equals: "paid" } } },
    { label: "Unpaid", value: { financialStatus: { equals: "pending" } } },
    { label: "Fulfilled", value: { fulfillmentStatus: { equals: "fulfilled" } } },
    { label: "Unfulfilled", value: { fulfillmentStatus: { equals: null } } },
    { label: "Open", value: { closedAt: { equals: null } } },
    { label: "Closed", value: { closedAt: { notEquals: null } } },
  ];

  const splitFilterOptions = [
    { label: "All", value: { storeCode: { equals: selectStoreCode } } },
    { label: "New", value: { orderStatus: { equals: "new" } } },
    { label: "Confirm", value: { orderStatus: { equals: "confirm" } } },
    { label: "Ready For Pickup", value: { orderStatus: { equals: "ready_for_pickup" } } },
    { label: "Out For Delivery", value: { orderStatus: { equals: "out_for_delivery" } } },
    { label: "Delivered", value: { orderStatus: { equals: "delivered" } } },
    { label: "On Hold", value: { orderStatus: { equals: "on_hold" } } },
    { label: "Cancel", value: { orderStatus: { equals: "cancel" } } },
    // { label: "On Hold", value: { notEquals: "on_hold" } },
    // { label: "Cancel", value: { notEquals: "cancel" } },
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
    // { label: "Store Code", value: "storeCode asc", directionLabel: "A-Z" },
    // { label: "Store Code", value: "storeCode desc", directionLabel: "Z-A" },
    { label: "Store Name", value: "storeName asc", directionLabel: "A-Z" },
    { label: "Store Name", value: "storeName desc", directionLabel: "Z-A" },
    { label: "Order status", value: "orderStatus asc", directionLabel: "A-Z" },
    { label: "Order status", value: "orderStatus desc", directionLabel: "Z-A" },
  ];

  const sortOptions = [
    { label: "Date", value: "createdAt asc", directionLabel: "Oldest to newest" },
    { label: "Date", value: "createdAt desc", directionLabel: "Newest to oldest" },
    { label: "Order number", value: "id asc", directionLabel: "Ascending" },
    { label: "Order number", value: "id desc", directionLabel: "Descending" },
    // { label: "Items", value: "lineItems asc", directionLabel: "Ascending" },
    // { label: "Items", value: "lineItems desc", directionLabel: "Descending" },
    // { label: "Destination", value: "destination asc", directionLabel: "A-Z" },
    // { label: "Destination", value: "destination desc", directionLabel: "Z-A" },
    // { label: "Customer name", value: "customer asc", directionLabel: "A-Z" },
    // { label: "Customer name", value: "customer desc", directionLabel: "Z-A" },
    { label: "Payment status", value: "financialStatus asc", directionLabel: "A-Z" },
    { label: "Payment status", value: "financialStatus desc", directionLabel: "Z-A" },
    { label: "Fulfillment status", value: "fulfillmentStatus asc", directionLabel: "A-Z" },
    { label: "Fulfillment status", value: "fulfillmentStatus desc", directionLabel: "Z-A" },
    { label: "Total", value: "currentTotalPrice asc", directionLabel: "Highest to lowest" },
    { label: "Total", value: "currentTotalPrice desc", directionLabel: "Lowest to highest" },
    // { label: "Channel", value: "channel asc", directionLabel: "A-Z" },
    // { label: "Channel", value: "channel desc", directionLabel: "Z-A" },
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

  const handleStatus = (value) => {
    console.log("value", value);
  };

  const handleReAssign = (value) => {
    const reAssignStore = value.value;
    setReassignSelectStoreCode(reAssignStore);
  };

  const handleLocations = (value) => {
    const selectedStoreCode = value[0];
    setSelectStoreCode(selectedStoreCode);
    if (selectedStoreCode === "") {
      setFilterBy({});
    } else {
      setFilterBy((prevFilter) => ({
        ...prevFilter,
        storeCode: { equals: selectedStoreCode },
      }));
    }
    setCursor({ first: NumberOnPage })
  };

  useEffect(() => {
    if (locationData) {
      const locations = locationData.map(({ id, name }) => ({ value: id, label: name }));
      setLocations(locations);
    }
  }, [locationData]);

  useEffect(() => {
    if (storeData) {
      // Create a set of store access strings for quick lookup
      const storeAccessSet = new Set(storeAccess);

      // Filter stores based on storeAccess
      const filteredStores = storeData.filter(({ storeName, storeCode }) => {
        const accessString = `${storeName}-${storeCode}`;
        return storeAccessSet.has(accessString);
      });

      // Map to the desired format
      const stores = filteredStores.map(({ storeCode, storeName }) => ({
        value: storeCode,
        label: storeName,
      }));
      if (stores.length === storeData.length) {
        console.log("All locations---->>");
        stores.unshift({ value: "", label: "All locations" });
      }
      const initialStoreCode = selectedPreviousStoreCode ? selectedPreviousStoreCode : stores[0]?.value;
      setSelectStoreCode(initialStoreCode);
      setStoreCode(stores);
    }
  }, [storeData, storeAccess]);

  useEffect(() => {
    if (selectStoreCode) {
      setFilterBy((prevFilter) => ({
        ...prevFilter,
        storeCode: { equals: selectStoreCode },
      }));
    }
  }, [selectStoreCode]);
  // useEffect(() => {
  //   if (selectStoreCode) {
  //     fetchSplits(selectStoreCode);
  //   } else {
  //     setSplitsData([]);
  //   }
  // }, [selectStoreCode, filterBy, location.pathname, cursor, sortSelected]);


  const submitReAssign = async () => {
    const selectedSplits = splitsData?.filter(split => selectedResources.includes(split.id));
    let requestReassign;
    if (selectedSplits.length > 0) {
      requestReassign = selectedSplits?.map(split => {
        return {
          id: split.id,
          storeCode: reassignSelectStoreCode,
          reAssignStatus: true,
          // splitId: `${split.orderNumber}-${reassignSelectStoreCode}`,
          storeName: storeData.find(store => store.storeCode === reassignSelectStoreCode).storeName
        };
      });
    }
    const khagatiOrderSplitRecords = await api.khagatiOrderSplit.bulkUpdate(requestReassign);
    if (khagatiOrderSplitRecords) {
      handleReAssignClose();
      fetchSplits(selectStoreCode);
      handleSelectionChange('page', false);
    }
  };

  const createProduct = async () => {
    const requestData = {
      title: "Test Product 123",
      body_html: "<strong>Good snowboard!</strong>",
      vendor: "Burton",
      product_type: "Snowboard",
      variants: [
        {
          "option1": "test variant 1",
          "price": "10.00",
          "sku": "sku123"
        },
        {
          "option1": "test variant 2",
          "price": "20.00",
          "sku": "sku456"
        }
      ],
    };
    const responseData = await productCreate({
      requestData: JSON.stringify(requestData)
    });
  };

  const updateProduct = async () => {
    const requestData = {
      title: "Updated Product Title 123",
      variants: [
        {
          id: 48916986036514,
          price: "1000.00",
          sku: "12345"
        },
        {
          id: 48916986069282,
          price: "2000.00",
          sku: "67890"
        }
      ]
    };
    const responseData = await productUpdate({
      productId: "9400730616098",
      requestData: JSON.stringify(requestData)
    });
  };

  const updateVariant = async () => {
    const requestData = {
      price: "10.00",
      sku: "vivek"
    };
    const responseData = await variantUpdate({
      variantId: "48916986036514",
      requestData: JSON.stringify(requestData)
    });
  };

  const primaryAction =
    !isLoading && storeModuleAccess.includes("Order Add")
      ? {
        content: "Create order",
        icon: PlusIcon,
        onClick: () => navigate("/orders/draft/new"),
      }
      : null;

  const secondaryActions = [
    { content: "Refresh", onAction: handleRefresh },
    storeModuleAccess.includes("Order Export")
      ? { content: "Export", onAction: handleExport }
      : null, // Add Export only if "Order Export" is in storeModuleAccess
  ].filter(Boolean);

  return (
    <Page
      fullWidth
      compactTitle
      title="Orders:"
      titleMetadata={
        <OptionListComponent
          locations={storeCode}
          selectedLocation={selectedPreviousStoreCode}
          onValueChange={handleLocations}
        />
      }
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    /*pagination={{
      hasNext: true,
    }}*/
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
      {activeImport && (
        <Modal
          open={activeImport}
          onClose={() => setActiveImport(false)}
          title="Import Orders from CSV"
          primaryAction={{
            content: "Import",
            onAction: () => { }, // No action needed here, the DropZone handles the file input
          }}
          secondaryActions={[{ content: "Cancel", onAction: () => setActiveImport(false) }]}
        >
          <Modal.Section>
            <DropZone allowMultiple={false} onDrop={handleImport}>
              <DropZone.FileUpload />
            </DropZone>
            {importing && <Spinner />}
          </Modal.Section>
        </Modal>
      )}
      {activeExport && (
        <ModalComponent
          modalTitle="Export orders"
          modalPrimaryButton="Export orders"
          modalSecondaryButton="Export transaction histories"
          modalActive={activeExport}
          handleModalClose={handleClose}
        >
          <BlockStack vertical gap="400">
            <InlineStack>
              <ChoiceList
                title="Export"
                choices={[
                  { label: "Current page", value: "current_page" },
                  { label: "All orders", value: "all_orders" },
                  {
                    label: "Selected: 0 orders",
                    value: "selected_orders",
                    disabled: true,
                  },
                  {
                    label: "3 orders matching your search",
                    value: "three_orders",
                    disabled: true,
                  },
                  { label: "Orders by date", value: "orders_by_date" },
                ]}
                selected={selectedExport}
                onChange={handleSelectedExport}
              />
            </InlineStack>
            <InlineStack>
              <ChoiceList
                title="Export as"
                choices={[
                  {
                    label:
                      "CSV for Excel, Numbers, or other spreadsheet programs",
                    value: "csv_excel",
                  },
                  { label: "Plain CSV file", value: "csv_plain" },
                ]}
                selected={selectedExportAs}
                onChange={handleSelectedExportAs}
              />
            </InlineStack>
          </BlockStack>
        </ModalComponent>
      )}
      {status && (
        <ModalComponent
          modalTitle="Status"
          modalPrimaryButton="Save"
          modalActive={status}
          handleModalClose={handleStatusClose}
        >
          <BlockStack vertical gap="400">
            <SelectComponent
              fieldName="status"
              selectOptions={statusOptions}
              selectPlaceHolder="New"
              onValueChange={handleStatus}
            />
          </BlockStack>
        </ModalComponent>
      )}
      {reAssign && (
        <ModalComponent
          modalTitle="Reassign Order"
          modalPrimaryButton="Reassign"
          modalActive={reAssign}
          handleModalClose={handleReAssignClose}
          handleModelSave={submitReAssign}
        >
          <BlockStack vertical gap="400">
            <SelectComponent
              fieldName="Reassign Order"
              selectValue={storeOptions[0]}
              selectOptions={storeOptions}
              onValueChange={handleReAssign}
            />
          </BlockStack>
        </ModalComponent>
      )}
    </Page>
  );
};

export default OrderListPage;