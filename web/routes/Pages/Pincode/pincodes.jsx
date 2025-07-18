/**
 * PinCodeListPage Component
 *
 * This component displays a paginated list of pin codes with options for creating, exporting, and importing pin codes.
 * It provides functionalities to filter, search, and sort the list of pin codes. Users can perform bulk actions
 * such as exporting the list to a CSV file or importing pin codes from a CSV file. The component also supports 
 * synchronization of pin codes with a remote store and handles the display of appropriate status messages and banners.
 *
 * Features:
 * - Displays a table with pin codes including Store ID, Store Code, and Pin Code.
 * - Allows filtering, searching, and sorting of pin codes.
 * - Provides options to create a new pin code, export pin codes, and import pin codes.
 * - Displays a loading spinner and error banners as needed during asynchronous operations.
 * - Supports bulk export and import of pin codes in CSV format.
 * - Handles synchronization of pin codes with a remote store and displays status updates.
 *
 * Usage:
 *
 * <PinCodeListPage />
 *
 * Dependencies:
 * - React hooks (useState, useCallback, useEffect)
 * - Polaris components from Shopify (Page, IndexTable, Text, InlineStack, BlockStack, Link, ChoiceList, DropZone, Spinner, ButtonGroup, Button, Icon, Banner, Box, Thumbnail)
 * - Gadget API for fetching, updating, and bulk creating pin code records
 * - PapaParse for parsing CSV files
 * - React Router for navigation (useNavigate)
 * - Custom components (TableComponent, ActionModalComponent)
 *
 * Example:
 * ```
 * <PinCodeListPage />
 * ```
 *
 * Props:
 * - No props are required. The component manages its internal state and handles actions and navigation internally.
 *
 * Note:
 * - Ensure that the API endpoints for fetching, bulk creating, and deleting pin codes (`api.khagatiPinCode.findMany`, `api.khagatiPinCode.bulkCreate`, `api.khagatiPinCode.delete`)
 *   are correctly configured in the Gadget API.
 */

import { useState, useCallback, useEffect } from "react";
import { useIndexResourceState, Page, IndexTable, Text, InlineStack, BlockStack, Link, ChoiceList, DropZone, Spinner, ButtonGroup, Button, Icon, Banner, Box, Thumbnail } from "@shopify/polaris";
import { PlusIcon, DeleteIcon, NoteIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useFindMany, useAction, useGlobalAction } from "@gadgetinc/react";
import { useNavigate } from "react-router-dom";
import Papa from 'papaparse';

import { api } from "../../../api";
import TableComponent from "../../../components/TableComponent";
import { convertSortOrder } from "../../../util/commonFunctions";
import ActionModalComponent from "../../../components/ActionModalComponent";
const PinCodeListPage = () => {
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const NumberOnPage = 50;
  const [cursor, setCursor] = useState({ first: NumberOnPage });
  const [activeExport, setActiveExport] = useState(false);
  const [selectedExport, setSelectedExport] = useState(["current_page"]);
  const [selectedExportAs, setSelectedExportAs] = useState(["csv_excel"]);
  const [activeImport, setActiveImport] = useState(false);
  const [filterBy, setFilterBy] = useState({});
  const [searchBy, setSearchBy] = useState("");
  const [sortSelected, setSortSelected] = useState(["id desc"]);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);
  const [isBanner, setIsBanner] = useState(false);

  const handleClose = () => {
    setActiveExport(false);
  };

  const handleSelectedExport = useCallback(
    (value) => setSelectedExport(value),
    []
  );

  const handleSelectedExportAs = useCallback(
    (value) => setSelectedExportAs(value),
    []
  );

  const [{ data: pinCodeSyncData, fetching: pinCodeSyncFetching, error: pinCodeSyncError }, pinCodeUpdate] = useGlobalAction(
    api.shopifyPinCodeStoreSync
  );

  const searchParams = searchBy ? { search: searchBy } : {};

  const [{ data, fetching, error }] = useFindMany(api.khagatiPinCode, {
    ...cursor,
    select: {
      id: true,
      storeId: true,
      storeCode: true,
      pinCode: true,
    },
    ...searchParams,
    filter: filterBy,
    sort: convertSortOrder(sortSelected),
  });

  const [{ databulkCreate, errorbulkCreate, fetchingbulkCreate }, bulkCreate] = useAction(api.khagatiPinCode.bulkCreate);

  const handleExport = useCallback(() => {
    if (!data) return;
    const csvHeader = "Store Id,Store Code,Pincode\n";
    const csvBody = data.map(({ storeId, storeCode, pinCode }) => `${storeId},${storeCode},${pinCode}`).join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${csvHeader}${csvBody}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pin_codes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  const handleFileUpload = useCallback((files) => {
    const file = files[0];
    setSelectedFile(file);
  }, []);

  const fileUpload = !selectedFile && <DropZone.FileUpload />;

  const uploadedFile = selectedFile && (
    <Box paddingBlock="400">
      <BlockStack inlineAlign="center">
        <Thumbnail
          size="small"
          alt={selectedFile.name}
          source={NoteIcon}
        />
        <Box>
          {selectedFile.name}{' '}
          <Text variant="bodySm" as="p">
            {selectedFile.size} bytes
          </Text>
        </Box>
      </BlockStack>
    </Box>
  );

  const processFile = useCallback(async () => {
    if (!selectedFile) {
      alert("No file selected");
      return;
    }
    setImporting(true);
    setErrorBanner(null);
    Papa.parse(selectedFile, {
      complete: async (result) => {
        const records = result.data.map(({ "storeId": storeId, "storeCode": storeCode, "pinCode": pinCode }) => ({ storeId, storeCode, pinCode }));

        const chunkSize = 50;
        for (let i = 0; i < records.length; i += chunkSize) {
          const chunk = records.slice(i, i + chunkSize);
          console.log(chunk)
          try {
            await bulkCreate(chunk);
          } catch (error) {
            console.error("Error creating records:", error);
            setErrorBanner(<Banner status="critical">Error importing records. Please try again.</Banner>);
          }
        }
        setImporting(false);
      },
      header: true,
    });
  }, [selectedFile, bulkCreate]);

  const resourceName = {
    singular: "pinCode",
    plural: "pinCodes",
  };

  const headings = [
    { title: "Store Id" },
    { title: "Store Code" },
    { title: "Pincode" },
    { title: "Actions" },
  ];

  const deletePinCode = async (id) => {
    try {
      await api.khagatiPinCode.delete(id);
    } catch (error) {
      console.log(error);
    }
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(data);

  const rowMarkUp = data?.map(({ id, storeId, storeCode, pinCode }, index) => {
    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Link
            removeUnderline
            monochrome
            onClick={() => navigate(`/pincodes/${id}`)}
          >
            <Text as="h6" variant="headingSm">
              {storeId}
            </Text>
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack align="start">
            <Text as="h6" variant="headingSm">
              {storeCode}
            </Text>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack align="start">
            <Text as="h6" variant="headingSm">
              {pinCode}
            </Text>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack align="start">
            <Text as="h6" variant="headingSm">
              <Link
                removeUnderline
                monochrome
                onClick={(e) => {
                  e.stopPropagation();
                  deletePinCode(id);
                }}
              >
                <Icon source={DeleteIcon} tone="base" />
              </Link>
            </Text>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  const filterOptions = [
    { label: "All", value: {} },
    { label: "Active", value: {} },
    { label: "Draft", value: {} },
    { label: "Archived", value: {} },
  ];

  const sortOptions = [
    { label: "Store ID", value: "store id asc", directionLabel: "Ascending" },
    { label: "Store ID", value: "store id desc", directionLabel: "Descending" },
  ];

  const pinCodeSync = async () => {
    const response = await pinCodeUpdate({ syncType: "pinCode" });
    console.log('response------>>', response)
    if (response.data.success) {
      shopify.toast.show(`${response.data.message.charAt(0).toUpperCase() + response.data.message.slice(1)}`, {
        duration: 5000,
      });
    } else {
      shopify.toast.show(`${response.data.message.charAt(0).toUpperCase() + response.data.message.slice(1)}`, {
        isError: true,
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    if (pinCodeSyncFetching) {
      setIsBanner(true);
    } else {
      const timer = setTimeout(() => {
        setIsBanner(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pinCodeSyncFetching]);

  return (
    <Page
      fullWidth
      compactTitle
      title="Pincodes"
      primaryAction={{
        content: "Create Pincode",
        icon: PlusIcon,
        onClick: () => navigate("/pincodes/new"),
      }}
      secondaryActions={
        <ButtonGroup segmented>
          <Button variant="primary" loading={pinCodeSyncFetching} onClick={() => pinCodeSync()}>
            Pincode Sync
          </Button>
          <Button onClick={() => setActiveExport(true)}>Export</Button>
          <Button onClick={() => setActiveImport(true)}>Import</Button>
        </ButtonGroup>
      }
      pagination={{
        hasNext: true,
      }}
    >
      <Box paddingBlockEnd="200">
        {isBanner && <Banner
          title={!pinCodeSyncFetching ? "Pin Code & Store Completed" : "Pin Code & Store Sync is in progress"}
          tone={!pinCodeSyncFetching ? "success" : "warning"}
        />}
      </Box>
      {errorBanner}
      <TableComponent
        tableData={data}
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
      {activeImport && (
        <ActionModalComponent
          modalTitle="Import Pincodes"
          modalPrimaryButton="Upload"
          modalActive={activeImport}
          handleModalClose={() => setActiveImport(false)}
          onPrimaryAction={processFile}
        >
          <DropZone
            accept=".csv"
            errorOverlayText="File type must be .csv"
            type="file"
            allowMultiple={false}
            onDrop={handleFileUpload}
          >
            {uploadedFile}
            {fileUpload}
          </DropZone>
          {importing && <Spinner size="small" />}
        </ActionModalComponent>
      )}

      {activeExport && (
        <ActionModalComponent
          modalTitle="Export pincodes"
          modalPrimaryButton="Export pincodes"
          modalSecondaryButton="Export transaction histories"
          modalActive={activeExport}
          handleModalClose={handleClose}
          onPrimaryAction={handleExport}
        >
          <BlockStack vertical gap="400">
            <InlineStack>
              <ChoiceList
                title="Export"
                choices={[
                  { label: "Current page", value: "current_page" },
                  { label: "All pincodes", value: "all_pincodes" },
                  {
                    label: "Selected: 0 pincodes",
                    value: "selected_pincodes",
                    disabled: true,
                  },
                  {
                    label: "3 pincodes matching your search",
                    value: "three_pincodes",
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
                    label: "CSV for Excel, Numbers, or other spreadsheet programs",
                    value: "csv_excel",
                  },
                  { label: "Plain CSV file", value: "csv_plain" },
                ]}
                selected={selectedExportAs}
                onChange={handleSelectedExportAs}
              />
            </InlineStack>
          </BlockStack>
        </ActionModalComponent>
      )}
    </Page>
  );
};

export default PinCodeListPage;