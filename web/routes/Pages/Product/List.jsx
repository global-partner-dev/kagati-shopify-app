/**
 * ProductListPage Component
 * 
 * This component renders a page displaying a list of products. It includes features such as:
 * - Viewing product details and thumbnails.
 * - Filtering and sorting products based on various criteria.
 * - Exporting product data to CSV.
 * - Adding new products and managing the list.
 * 
 * Features:
 * - Displays products in a table format with options to view, filter, and sort.
 * - Allows exporting product data in CSV format with options for the current page or all products.
 * - Integrates modals for exporting and importing product data.
 * 
 * Dependencies:
 * - `@shopify/polaris`: Provides UI components and icons.
 * - `@gadgetinc/react`: For data fetching.
 * - `react-router-dom`: For navigation.
 * - Custom components: `TableComponent`, `ModalComponent`, `ActionModalComponent`.
 * 
 * Usage:
 * - Navigate to `/products` to view the list of products.
 * - Use the primary action button to add a new product.
 * - Use the secondary actions to export product data or manage imports.
 */

import { useState, useCallback } from "react";
import {
  useIndexResourceState,
  Page,
  IndexTable,
  Badge,
  Text,
  InlineStack,
  Link,
  Icon,
  BlockStack,
  ChoiceList,
  DropZone,
  Thumbnail,
  Box,
} from "@shopify/polaris";
import { ViewIcon, RefreshIcon, NoteIcon } from "@shopify/polaris-icons";
import TableComponent from "../../../components/TableComponent";
import { api } from "../../../api";
import { useFindMany } from "@gadgetinc/react";
import { useNavigate } from "react-router-dom";
import ModalComponent from "../../../components/ModalComponent";
import ActionModalComponent from "../../../components/ActionModalComponent";
import { capitalizeFirstLetter, convertSortOrder } from "../../../util/commonFunctions";

const ProductListPage = () => {
  const navigate = useNavigate();
  const NumberOnPage = 50;
  const [cursor, setCursor] = useState({ first: NumberOnPage });
  const [activeExport, setActiveExport] = useState(false);
  const [activeImport, setActiveImport] = useState(false);
  const [selectedExport, setSelectedExport] = useState(["current_page"]);
  const [selectedExportAs, setSelectedExportAs] = useState(["csv_excel"]);
  const [filterBy, setFilterBy] = useState({});
  const [searchBy, setSearchBy] = useState("");
  const [sortSelected, setSortSelected] = useState(["title asc"]);

  const handleClose = () => {
    setActiveExport(false);
    setActiveImport(false);
  };

  const handleSelectedExport = useCallback(
    (value) => setSelectedExport(value),
    []
  );

  const handleSelectedExportAs = useCallback(
    (value) => setSelectedExportAs(value),
    []
  );

  const handleExportProducts = () => {
    if (!products || products.length === 0) {
      alert("No products to export.");
      return;
    }

    let csvContent = "";
    csvContent += "Product ID,Title,Product Type,Vendor,Status\n";

    products.forEach((product) => {
      const row = [
        product.id,
        product.title.replace(/,/g, ''),
        product.productType,
        product.vendor,
        product.status,
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: 'text/csv;charset=utf-8;' });
    const fileUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', 'exported_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);

    handleClose(); // Assuming this closes your export modal
  };



  const searchParams = searchBy ? { search: searchBy } : {};

  const [{ data: products, fetching, error }] = useFindMany(api.shopifyProduct, {
    ...cursor,
    select: {
      id: true,
      title: true,
      productType: true,
      vendor: true,
      status: true,
      images: {
        edges: {
          node: {
            source: true,
          },
        },
      },
      variants: {
        edges: {
          node: {
            inventoryQuantity: true,
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    ...searchParams,
    filter: filterBy,
    sort: convertSortOrder(sortSelected),
  });

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const headings = [
    { title: "" },
    { title: "Product" },
    { title: "Status" },
    { title: "Inventory" },
    { title: "Category" },
    { title: "Vendor" },
    { title: "Refresh" },
  ];

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  const rowMarkUp = products?.map(({
    id, title, images, status, productType, vendor, variants
  }, index) => {
    const sumOfInventory = variants.edges.reduce((total, edge) => {
      return total + edge.node.inventoryQuantity;
    }, 0);
    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Thumbnail
            source={images.edges.length ? images.edges[0]?.node?.source : NoteIcon}
            alt={"product thumbnail" + title}
            size="small"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Box className="IndexTable-Cell">
            <InlineStack align="start">
              <Link
                dataPrimaryLink
                removeUnderline
                monochrome
                onClick={() => navigate(`/products/${id}`)}
              >
                <Text as="span" variant="bodyMd" fontWeight="medium">
                  {title}
                </Text>
              </Link>
              <Box className="myCustomMargin myCustomIconView" as="span">
                <Icon
                  source={ViewIcon}
                  tone="base"
                  accessibilityLabel="Preview on Online Store"
                />
              </Box>
            </InlineStack>
          </Box>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={status === "active" ? "success" : "info"}>{capitalizeFirstLetter(status)}</Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {sumOfInventory === 0 ? (
            <Text as="span" variant="bodyMd">
              Inventory not tracked
            </Text>
          ) : <>
            <Text
              as="span"
              variant="bodyMd"
              tone={sumOfInventory >= 10 ? "" : "critical"}
            >
              {sumOfInventory} in stock{" "}
            </Text>
            <Text as="span" variant="bodyMd">
              for {variants.edges.length} variants
            </Text>
          </>}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {productType}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {vendor}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Icon source={RefreshIcon} tone="base" />
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  const filterOptions = [
    { label: "All", value: {} },
    { label: "Active", value: { status: { equals: "active" } } },
    { label: "Draft", value: { status: { equals: "draft" } } },
    { label: "Archived", value: { status: { equals: "archived" } } },
  ];

  const sortOptions = [
    { label: "Product title", value: "title asc", directionLabel: "A-Z" },
    { label: "Product title", value: "title desc", directionLabel: "Z-A" },
    { label: "Created", value: "createdAt asc", directionLabel: "Oldest first" },
    { label: "Created", value: "createdAt desc", directionLabel: "Newest first" },
    { label: "Updated", value: "updatedAt asc", directionLabel: "Oldest first" },
    { label: "Updated", value: "updatedAt desc", directionLabel: "Newest first" },
    // { label: "Inventory", value: "Inventory asc", directionLabel: "Lowest to highest" },
    // { label: "Inventory", value: "Inventory desc", directionLabel: "Highest to lowest" },
    { label: "Product type", value: "productType asc", directionLabel: "A-Z" },
    { label: "Product type", value: "productType desc", directionLabel: "Z-A" },
    { label: "Vendor", value: "vendor asc", directionLabel: "A-Z" },
    { label: "Vendor", value: "vendor desc", directionLabel: "Z-A" },
  ];

  return (
    <Page
      fullWidth
      compactTitle
      title="Products"
      primaryAction={{
        content: "Add product",
        onClick: () => navigate("/products/new"),
      }}
      secondaryActions={[
        {
          content: "Export",
          onAction: () => setActiveExport(!activeExport),
        },
        // {
        //   content: "Import",
        //   onAction: () => setActiveImport(true),
        // },
      ]}
    >
      <TableComponent
        tableData={products}
        tableHeadings={headings}
        tableRowMarkUp={rowMarkUp}
        tableFilterOptions={filterOptions}
        tableSetCursor={setCursor}
        tableNumberOnPage={NumberOnPage}
        tableSetFilterBy={setFilterBy}
        tableSetSearchBy={setSearchBy}
        tableSelectedResources={selectedResources}
        tableAllResourcesSelected={allResourcesSelected}
        tableHandleSelectionChange={handleSelectionChange}
        tableResourceName={resourceName}
        tableSortOptions={sortOptions}
        tableSortSelected={sortSelected}
        tableSetSortSelected={setSortSelected}
      />
      {activeExport && (
        <ActionModalComponent
          modalTitle="Export products"
          modalPrimaryButton="Export products"
          modalActive={activeExport}
          handleModalClose={handleClose}
          onPrimaryAction={handleExportProducts}
        >
          <BlockStack gap="400">
            <InlineStack>
              <Text variant="bodyLg" as="p">
                This CSV file can update all product information. To update just
                inventory quantities use the{" "}
                <Link url="Example App">CSV file for inventory.</Link>
              </Text>
            </InlineStack>
            <InlineStack>
              <ChoiceList
                title="Export"
                choices={[
                  { label: "Current page", value: "current_page" },
                  { label: "All products", value: "all_products" },
                  {
                    label: "Selected: 0 products",
                    value: "selected_products",
                    disabled: true,
                  },
                  {
                    label: "50+ products matching your search",
                    value: "fifty_plus_products",
                    disabled: true,
                  },
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
            <InlineStack>
              <Text variant="bodyLg" as="p">
                Learn more about{" "}
                <Link url="Example App">exporting products to CSV file</Link> or
                the <Link url="Example App">bulk editor</Link>.
              </Text>
            </InlineStack>
          </BlockStack>
        </ActionModalComponent>
      )}
      {activeImport && (
        <ModalComponent
          modalTitle="Import customers by CSV"
          modalPrimaryButton="Upload and preview"
          modalActive={activeImport}
          handleModalClose={handleClose}
        >
          <BlockStack vertical>
            <DropZone
              accept=".csv"
              errorOverlayText="File type must be .csv"
              type="file"
              onDrop={() => { }}
            >
              <DropZone.FileUpload />
            </DropZone>
          </BlockStack>
        </ModalComponent>
      )}
    </Page>
  );
};

export default ProductListPage;
