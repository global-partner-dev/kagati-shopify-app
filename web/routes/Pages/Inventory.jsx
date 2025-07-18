import { useState, useCallback, useEffect, useContext } from "react";
import {
  useIndexResourceState, Page, IndexTable, Text, InlineStack, Link, Tag, BlockStack, ChoiceList,
  DropZone, Thumbnail, Box, ButtonGroup, Button, Badge, Banner
} from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import TableComponent from "../../components/TableComponent";
import { api } from "../../api";
import { useAction, useFindMany, useGlobalAction } from "@gadgetinc/react";
import { useNavigate } from "react-router-dom";
import ModalComponent from "../../components/ModalComponent";
import { convertSortOrder } from "../../util/commonFunctions";
import OptionListComponent from "../../components/OptionListComponent";
import { SyncStatusContext } from '../../contexts/SyncStatusContext';

const InventoryPage = () => {
  const navigate = useNavigate();
  const NumberOnPage = 50;
  const [cursor, setCursor] = useState({ first: NumberOnPage });
  const [activeExport, setActiveExport] = useState(false);
  const [activeImport, setActiveImport] = useState(false);
  const [selectedExport, setSelectedExport] = useState(["current_page"]);
  const [selectedExportAs, setSelectedExportAs] = useState(["csv_excel"]);
  const [filterBy, setFilterBy] = useState({});
  const [searchBy, setSearchBy] = useState("");
  const [sortSelected, setSortSelected] = useState(["productTitle asc"]);
  const [storeCode, setStoreCode] = useState([]);
  const [refreshTable, setRefreshTable] = useState(false);
  const [isBanner, setIsBanner] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState({
    productVariantUpdate: null,
    productVariantPriceUpdate: null,
  });

  const { syncStatus, showBanner, dismissBanner, updateSyncStatus } = useContext(SyncStatusContext);

  const handleClose = () => {
    if (activeExport) setActiveExport(false);
    else if (activeImport) setActiveImport(false);
  };

  const handleSelectedExport = useCallback(
    (value) => setSelectedExport(value),
    []
  );

  const handleSelectedExportAs = useCallback(
    (value) => setSelectedExportAs(value),
    []
  );

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

  const [{ fetching: productVariantUpdateFetching }, createProductVariantUpdate] = useGlobalAction(api.productVariantUpdateFileFinalFull);
  const [{ fetching: productVariantPriceUpdateFetching }, createProductVariantPriceUpdate] = useGlobalAction(api.productVariantPriceUpdateFileFinalFull);
  const [{ fetching: khagatiSyncStatusUpdateFetching }, khagatiSyncStatusUpdate] = useAction(api.khagatiSyncStatus.update);

  const [{ data: storeData }] = useFindMany(api.khagatiStores, {
    select: {
      id: true,
      erpStoreId: true,
      storeCode: true,
      storeName: true,
      storeCluster: true,
    },
    filter: {
      status: { in: ["Active"] }
    }
  });

  const searchParams = searchBy ? { search: searchBy } : {};

  const [{ data: inventoriesData }] = useFindMany(api.khagatiOnlineHybridStock, {
    ...cursor,
    select: {
      id: true,
      outletId: true,
      productId: true,
      productTitle: true,
      productImage: true,
      variantId: true,
      variantTitle: true,
      sku: true,
      primaryStock: true,
      backUpStock: true,
      hybridStock: true,
    },
    ...searchParams,
    filter: { ...filterBy },
    sort: convertSortOrder(sortSelected),
    key: refreshTable,
  });

  const resourceName = {
    singular: "inventory",
    plural: "inventories",
  };

  const headings = [
    { title: "Product" },
    { title: "SKU" },
    { title: "Primary Stock" },
    { title: "Backup Stock" },
    { title: "Hybrid Stock" },
    { title: "Outlet Id" }
  ];

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(inventoriesData);

  const InventoryRow = ({ item, navigate, index }) => {
    const { id, productId, productTitle, productImage, variantTitle, sku, primaryStock, backUpStock, hybridStock, outletId } = item;
    const cluster = storeData && storeData.find(store => store.erpStoreId == outletId)?.storeCluster;

    return (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <InlineStack align="start" gap="400">
            <Thumbnail
              source={productImage ? productImage : NoteIcon}
              alt="Product image"
              size="small"
            />
            <Box align="start">
              <Link
                dataPrimaryLink
                removeUnderline
                monochrome
                onClick={() => navigate(`/products/${productId}`)}
              >
                <Text as="h6" variant="headingSm">
                  {productTitle}
                </Text>
                {variantTitle && <Tag>{variantTitle}</Tag>}
              </Link>
            </Box>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {sku ? sku : "No SKU"}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {primaryStock}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {backUpStock}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd">
            {hybridStock}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {cluster ? <Text as="span" variant="bodyMd">
            {outletId}{" "}{<Badge tone="attention">{cluster}</Badge>}
          </Text> : <Text as="span" variant="bodyMd">
            {outletId}
          </Text>}
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  };

  const rowMarkUp = inventoriesData?.map((item, index) => (
    <InventoryRow
      key={item.id}
      item={item}
      navigate={navigate}
      index={index}
    />
  ));

  const filterOptions = [
    { label: "All", value: {} }
  ];

  const sortOptions = [
    { label: "Product title", value: "productTitle asc", directionLabel: "A-Z" },
    { label: "Product title", value: "productTitle desc", directionLabel: "Z-A" },
    { label: "Variant title", value: "variantTitle asc", directionLabel: "A-Z" },
    { label: "Variant title", value: "variantTitle desc", directionLabel: "Z-A" },
    { label: "SKU", value: "sku asc", directionLabel: "Ascending" },
    { label: "SKU", value: "sku desc", directionLabel: "Descending" },
    { label: "Primary Stock", value: "primaryStock asc", directionLabel: "Lowest to highest" },
    { label: "Primary Stock", value: "primaryStock desc", directionLabel: "Highest to lowest" },
    { label: "Backup Stock", value: "backUpStock asc", directionLabel: "Lowest to highest" },
    { label: "Backup Stock", value: "backUpStock desc", directionLabel: "Highest to lowest" },
    { label: "Hybrid Stock", value: "hybridStock asc", directionLabel: "Lowest to highest" },
    { label: "Hybrid Stock", value: "hybridStock desc", directionLabel: "Highest to lowest" },
  ];

  const handleLocations = (value) => {
    if (value[0] === "") {
      setFilterBy({});
    } else {
      setFilterBy({ ...filterBy, outletId: { equals: Number(value[0]) } });
    }
  };

  const handleSync = async () => {
    try {
      // Just trigger the price sync action - it will handle everything
      const result = await createProductVariantPriceUpdate();
      
      if (!result?.data?.result) {
        console.error("Sync process failed to start");
      }
    } catch (error) {
      console.error("Failed to initialize sync process:", error);
    }
  };

  useEffect(() => {
    if (storeData) {
      const stores = storeData.map(({ storeName, erpStoreId }) => ({ value: erpStoreId, label: storeName }));
      stores.unshift({ value: "", label: "All locations" });
      setStoreCode(stores);
    }
  }, [storeData]);

  useEffect(() => {
    if (!productVariantUpdateFetching && !productVariantPriceUpdateFetching) {
      setRefreshTable(prev => !prev);
    }
  }, [productVariantUpdateFetching, productVariantPriceUpdateFetching]);

  // useEffect(() => {
  //   if ( productVariantUpdateFetching || productVariantPriceUpdateFetching) {
  //     setIsBanner(true);
  //   } else if(!productVariantUpdateFetching && !productVariantPriceUpdateFetching){
  //     const timer = setTimeout(() => {
  //       setIsBanner(false);
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [productVariantUpdateFetching, productVariantPriceUpdateFetching]);

  return (
    <Page
      fullWidth
      compactTitle
      title="Inventory:"
      titleMetadata={
        <OptionListComponent
          locations={storeCode}
          onValueChange={handleLocations}
        />
      }
      primaryAction={{
        content: "View product",
        onClick: () => navigate("/products"),
      }}
      secondaryActions={<ButtonGroup segmented>
        <Button 
          onClick={handleSync} 
          disabled={ syncStatus?.isSyncing}
          loading={syncStatus?.isSyncing}
        >
          {syncStatus?.isSyncing ? 'Syncing...' : 'Start Sync'}
        </Button>
        <Button onClick={() => setActiveExport(!activeExport)}>Export</Button>
        <Button onClick={() => setActiveImport(true)}>Import</Button>
      </ButtonGroup>}
    >
      {showBanner && syncStatus && (
        <Box paddingBlockEnd="200">
          <Banner
            title={
              syncStatus?.isSyncing
                ? `${syncStatus.syncTypes.priceSync.status === "running" 
                    ? "Price sync in progress..." 
                    : "Inventory sync in progress..."}`
                : `Sync ${syncStatus?.overallStatus} at ${new Date(syncStatus?.lastSyncCompletedAt).toLocaleString()}`
            }
            tone={
              syncStatus?.isSyncing
                ? "warning"
                : syncStatus?.overallStatus === "completed"
                ? "success"
                : "critical"
            }
            onDismiss={
              (!syncStatus?.isSyncing && (syncStatus?.overallStatus === "completed" || syncStatus?.overallStatus === "failed"))
                ? dismissBanner 
                : undefined
            }
          />
        </Box>
      )}

      <TableComponent
        tableData={inventoriesData}
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
        <ModalComponent
          modalTitle="Export products"
          modalPrimaryButton="Export products"
          modalActive={activeExport}
          handleModalClose={handleClose}
        >
          <BlockStack vertical gap="400">
            <InlineStack>
              <Text variant="bodyLg" as="p">
                This CSV file can update all product information. To update just
                inventory quantities use the{" "}
                <Link url="Example App">CSV file for </Link>
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
        </ModalComponent>
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
              onDrop={handleFileUpload}
            >
              {uploadedFile}
              {fileUpload}
            </DropZone>
          </BlockStack>
        </ModalComponent>
      )}
    </Page>
  );
};

export default InventoryPage;