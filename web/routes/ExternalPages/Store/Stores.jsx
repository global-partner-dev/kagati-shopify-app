/**
 * StoresPage Component
 * 
 * This component provides an interface for managing a list of stores. It includes functionality for viewing store details,
 * adding new stores, importing and exporting store data, and syncing store information. The component leverages the Shopify 
 * Polaris UI components for a consistent look and feel.
 * 
 * State:
 * - `cursor` (object): Manages pagination, determining which set of results to fetch.
 * - `activeExport` (boolean): Controls the visibility of the export modal.
 * - `activeImport` (boolean): Controls the visibility of the import modal.
 * - `selectedExport` (array): Tracks the user's choice for which stores to export.
 * - `selectedExportAs` (array): Tracks the user's choice for the export file format.
 * - `filterBy` (object): Stores the current filter criteria for the list of stores.
 * - `searchBy` (string): Stores the current search query used to filter stores.
 * - `sortSelected` (array): Stores the current sort order for the list of stores.
 * - `importing` (boolean): Indicates whether a file is currently being imported.
 * - `selectedFile` (File|null): Stores the file selected for import.
 * - `isBanner` (boolean): Controls the visibility of the banner indicating store sync status.
 * 
 * Hooks:
 * - `useNavigate`: React Router hook for programmatic navigation to different pages.
 * - `useFindMany`: Hook from the `@gadgetinc/react` library to fetch a list of stores from the API.
 * - `useAction`: Hook from the `@gadgetinc/react` library for performing actions like creating a store.
 * - `useGlobalAction`: Hook from the `@gadgetinc/react` library for executing global actions like syncing stores.
 * - `useCallback`: React hook used to memoize event handler functions for performance optimization.
 * - `useEffect`: React hook used to manage side effects, such as showing a banner during a store sync.
 * 
 * Handlers:
 * - `handleModalClose`: Closes both the export and import modals.
 * - `handleSelectedExport`: Updates the selected export option.
 * - `handleSelectedExportAs`: Updates the selected export file format.
 * - `handleAddStoreClick`: Navigates to the "Add Store" page.
 * - `handleRowClick`: Navigates to the "Store Details" page for editing a specific store.
 * - `handleFileUpload`: Handles the file upload process and sets the selected file.
 * - `processFile`: Processes the uploaded file, parsing it and creating new store records in the system.
 * - `handleExport`: Exports the current list of stores as a CSV file.
 * - `storeSync`: Initiates a sync of store data, updating information from external sources.
 * 
 * Render:
 * - The component renders a `Page` layout with a table of stores. The table includes options to filter, sort, and search through the stores.
 * - Provides buttons for adding a store, exporting stores, importing stores, and syncing store data.
 * - Modals are used for importing and exporting data, with a file upload interface for CSV imports and a choice list for export options.
 * - A banner is displayed to indicate the progress of store data synchronization.
 * 
 * Usage:
 * - This component is intended for use in an admin or management interface where users need to manage a list of stores. It provides 
 *   essential features for creating, editing, importing, exporting, and syncing store data.
 */

import { useState, useCallback, useEffect } from "react";
import { useIndexResourceState, Page, IndexTable, Text, InlineStack, Icon, Spinner, BlockStack, ChoiceList, DropZone, ButtonGroup, Button, Box, Banner, Thumbnail } from "@shopify/polaris";
import { ViewIcon, RefreshIcon, PlusIcon, NoteIcon } from "@shopify/polaris-icons";
import { useFindMany, useAction, useGlobalAction } from "@gadgetinc/react";
import { useNavigate } from "react-router-dom";
import ActionModalComponent from "../../../components/ActionModalComponent";
import TableComponent from "../../../components/TableComponent";
import { api } from "../../../api";
import { convertSortOrder } from "../../../util/commonFunctions";
import Papa from 'papaparse'; // For CSV parsing


const StoresPage = () => {
  const navigate = useNavigate();
  const NumberOnPage = 50;

  // useState Hooks
  const [cursor, setCursor] = useState({ first: NumberOnPage });
  const [activeExport, setActiveExport] = useState(false);
  const [activeImport, setActiveImport] = useState(false);
  const [selectedExport, setSelectedExport] = useState(["current_page"]);
  const [selectedExportAs, setSelectedExportAs] = useState(["csv_excel"]);
  const [filterBy, setFilterBy] = useState({});
  const [searchBy, setSearchBy] = useState("");
  const [sortSelected, setSortSelected] = useState(["id desc"]);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isBanner, setIsBanner] = useState(false);

  const [{ data: storeUpdateData, fetching: storeUpdateFetching, error: storeUpdateError }, storeUpdate] = useGlobalAction(
    api.shopifyPinCodeStoreSync
  );

  const searchParams = searchBy ? { search: searchBy } : {};

  const [{ data: stores, fetching, error }] = useFindMany(api.khagatiStores, {
    ...cursor,
    select: {
      id: true,
      storeName: true,
      storeCode: true,
      erpStoreId: true,
      storeCluster: true,
      storeTier: true,
      pinCode: true,
      status: true,
      isBackupWarehouse: true,
    },
    ...searchParams,
    filter: {...filterBy},
    sort: convertSortOrder(sortSelected),
  });

  console.log('sortSelected------>>', sortSelected)

  const [{ data, error: creationError, fetching: fetchingCreate }, create] = useAction(api.khagatiStores.create);

  const resourceName = {
    singular: "store",
    plural: "stores",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(stores);

  // Handlers and callbacks
  const handleModalClose = useCallback(() => {
    setActiveExport(false);
    setActiveImport(false);
  }, []);

  const handleSelectedExport = useCallback((value) => {
    setSelectedExport(value);
  }, []);

  const handleSelectedExportAs = useCallback((value) => {
    setSelectedExportAs(value);
  }, []);


  const handleAddStoreClick = () => {
    navigate("/stores/new"); // Navigate to Add Store page
  };

  const handleRowClick = (id) => {
    navigate(`/stores/${id}`); // Navigate to Store Details page for editing
  };

  const handleFileUpload = useCallback((files) => {
    const file = files[0]; // Assuming single file upload
    setSelectedFile(file);
    // setImporting(true);
    // Papa.parse(file, {
    //   complete: async (result) => {
    //     const jsonData = result.data
    //     for (const row of jsonData) {
    //       const {
    //         "Store Code": storeId,
    //         "Store Name": storeName,
    //         " Store Code": storeCode, // Notice the leading space in the key
    //         " Store Tier": storeTier,
    //         " Store Pincode": pinCode
    //       } = row;

    //       try {
    //         await create({
    //           storeName,
    //           storeCode,
    //           storeTier,
    //           pinCode

    //         });
    //       } catch (error) {
    //         console.error("Error creating record:", error);
    //         // Handle the error appropriately
    //       }
    //     }
    //     setImporting(false);
    //     setActiveImport(false);
    //     // Optionally, refresh your list here
    //   },
    //   header: true,
    //   skipEmptyLines: true
    // });
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
    console.log("process started");
    if (!selectedFile) {
      alert("No file selected."); // Or handle this scenario more gracefully
      return;
    }

    setImporting(true); // Indicate the start of importing

    Papa.parse(selectedFile, {
      complete: async (result) => {
        const jsonData = result.data;

        for (const row of jsonData) {
          const {
            "Store Code": storeId,
            "storeName": storeName,
            "storeCode": storeCode,
            "storeCluster": storeCluster,
            "storeTier": storeTier,
            "pinCode": pinCode,
            "state": state,
            "address": address,
            "mobNumber": mobNumber,
            "erpStoreId": erpStoreId,
            "city": city,
            "selectBackupWarehouse": selectBackupWarehouse,
            "email": email,
            "lat": lat,
            "lng": lng,
            "googleMap": googleMap,
          } = row;
          // 
          // 
          // localDelivery:{
          //   "MON":"09:00 to 05:00",
          //   "TUE":"09:00 to 05:00",
          //   "WED":"09:00 to 05:00",
          //   "THU":"09:00 to 05:00",
          //   "FRI":"09:00 to 05:00",
          //   "SAT":"09:00 to 05:00",
          //   "SUN":"09:00 to 05:00",
          // },
          console.log(row);
          console.log(storeCode, storeName, storeTier, pinCode);
          try {
            await create({
              storeCode: storeCode,
              storeCluster: storeCluster,
              storeName: storeName,
              storeTier: storeTier,
              pinCode: pinCode,
              state: state,
              address: address,
              mobNumber: mobNumber,
              erpStoreId: erpStoreId,
              radius: { "R1": 5, "R2": 10, "R3": 20, "R4": 50, "R5": 100 },
              city: city,
              email: email,
              googleMap: googleMap,
              isBackupWarehouse: true,
              localDelivery: {
                "MON": "09:00 to 05:00",
                "TUE": "09:00 to 05:00",
                "WED": "09:00 to 05:00",
                "THU": "09:00 to 05:00",
                "FRI": "09:00 to 05:00",
                "SAT": "09:00 to 05:00",
                "SUN": "09:00 to 05:00",
              },
            });
            // Consider adding some feedback here for each successful creation
          } catch (error) {
            console.error("Error creating store record:", error);
            // Implement more user-friendly error handling as needed
          }
        }
        setImporting(false);
        setActiveImport(false);
        setSelectedFile(null); // Reset selected file
        // Optionally, refresh your store list here to display the newly added stores
      },
      header: true,
      skipEmptyLines: true,
    });
  }, [selectedFile]); // Ensure all dependencies are included

  const handleExport = () => {
    if (!stores || stores.length === 0) {
      alert("No stores to export.");
      return;
    }

    const handleClose = () => {
      setActiveExport(false);
      setActiveImport(false);
    };

    let csvContent = "";
    csvContent += "Store Id,Store Name, Store Code, Outlet Id, Store Cluster, Store Tier, Store Pincode\n"

    stores.forEach((store) => {
      const row = [
        store.id,
        store.storeName,
        store.storeCode,
        store.erpStoreId,
        store.storeCluster,
        store.storeTier,
        store.pinCode
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: 'text/csv;charset-utf-8' });
    const fileUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', 'exported_stores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);

    handleClose()
  };

  // if (fetching) return <Spinner />;
  if (error) return <div>Error loading stores: {error.message}</div>;

  const headings = [
    { title: "Store ID" },
    { title: "Store Name" },
    { title: "Store Code" },
    { title: "Outlet Id" },
    { title: "Cluster" },
    { title: "Store Tier" },
    { title: "Store Pincode" },
    { title: "Refresh" },
  ];

  const filterOptions = [
    { label: "All", value: {} },
    { label: "Active", value: { status : { equals : "Active" } } },
    { label: "Warehouse", value: { isBackupWarehouse : { equals : true } } },
    // { label: "Draft", value: {} },
    // { label: "Archived", value: {} },
  ];

  const sortOptions = [
    { label: "Store ID", value: "id asc", directionLabel: "Ascending" },
    { label: "Store ID", value: "id desc", directionLabel: "Descending" },
    // { label: "Store Code", value: "storeCode asc", directionLabel: "Oldest to newest" },
    // { label: "Store Code", value: "storeCode desc", directionLabel: "Newest to oldest" },
    { label: "Outlet(ERP Store) ID", value: "erpStoreId asc", directionLabel: "Ascending" },
    { label: "Outlet(ERP Store) ID", value: "erpStoreId desc", directionLabel: "Descending" },
    { label: "Cluster", value: "storeCluster asc", directionLabel: "A-Z" },
    { label: "Cluster", value: "storeCluster desc", directionLabel: "Z-A" },
    { label: "Store Tier", value: "storeTier asc", directionLabel: "A-Z" },
    { label: "Store Tier", value: "storeTier desc", directionLabel: "Z-A" },
    { label: "Store Pincode", value: "pinCode asc", directionLabel: "Ascending" },
    { label: "Store Pincode", value: "pinCode desc", directionLabel: "Descending" },
  ];

  const rowMarkup = stores?.map(({ id, storeName, storeCode, erpStoreId, storeCluster, storeTier, pinCode }, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
      onClick={() => handleRowClick(id)}
    >
      <IndexTable.Cell>
        <InlineStack align="start">
          <button
            type="button"
            className="Polaris-Button Polaris-Button--plain"
            onClick={() => navigate(`/stores/${id}`)}
          >
            <Text as="span" variant="bodyMd" decoration="none">
              <InlineStack gap="200">
                {id}<Icon source={ViewIcon} />
              </InlineStack>
            </Text>
          </button>
        </InlineStack>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">{storeName}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">{storeCode}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">{erpStoreId}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">{storeCluster}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">{storeTier}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">{pinCode}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Icon source={RefreshIcon} tone="base" />
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  const storeSync = async () => {
    await storeUpdate();
  }

l

  return (
    <Page
      fullWidth
      compactTitle
      title="Stores"
      primaryAction={{
        content: "Create Store",
        icon: PlusIcon,
        onClick: handleAddStoreClick,
      }}
      secondaryActions={<ButtonGroup segmented>
        <Button variant="primary" loading={storeUpdateFetching} onClick={() => storeSync()}>
          Store Sync
        </Button>
        <Button onClick={() => setActiveExport(true)}>Export</Button>
        <Button onClick={() => setActiveImport(true)}>Import</Button>
      </ButtonGroup>}
      pagination={{
        hasNext: true,
      }}
    >
      <Box paddingBlockEnd="200">
        {isBanner && <Banner
          title={!storeUpdateFetching ? "Pin Code & Store Completed" : "Pin Code & Store Sync is in progress"}
          tone={!storeUpdateFetching ? "success" : "warning"}
        />}
      </Box>
      <TableComponent
        tableData={stores}
        tableHeadings={headings}
        tableRowMarkUp={rowMarkup}
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
          modalTitle="Import Stores"
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
          modalTitle="Export Stores"
          modalPrimaryButton="Export Stores"
          modalActive={activeExport}
          handleModalClose={handleModalClose}
          onPrimaryAction={handleExport}
        >
          <BlockStack vertical gap="400">
            <InlineStack>
              <ChoiceList
                title="Export"
                choices={[
                  { label: "Current page", value: "current_page" },
                  { label: "All stores", value: "all_stores" },
                  // Add more choices as per your requirement
                ]}
                selected={selectedExport}
                onChange={handleSelectedExport}
              />
            </InlineStack>
            <InlineStack>
              <ChoiceList
                title="Export as"
                choices={[
                  { label: "CSV for Excel, Numbers, or other spreadsheet programs", value: "csv_excel" },
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

export default StoresPage;
