import { useState, useCallback, useEffect } from "react";
import {
  useIndexResourceState, Page, IndexTable, Text, InlineStack, Link, Tag, BlockStack, ChoiceList,
  DropZone, Thumbnail, Box, ButtonGroup, Button, Badge, Banner
} from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import { useUser } from "@gadgetinc/react";
import TableComponent from "../../components/TableComponent";
import { api } from "../../api";
import { useFindMany, useGlobalAction } from "@gadgetinc/react";
import { useNavigate } from "react-router-dom";
import ModalComponent from "../../components/ModalComponent";
import { convertSortOrder } from "../../util/commonFunctions";
import OptionListComponent from "../../components/OptionListComponent";

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
  const [selectStoreCode, setSelectStoreCode] = useState("");
  const [storeAccess, setStoreAccess] = useState([]);
  const [storeModuleAccess, setStoreModuleAccess] = useState([]);
  const [status, setStatus] = useState({
    erpDataSync: null,
    erpProductSync: null,
    productVariantUpdate: null,
    productVariantPriceUpdate: null,
  });
  const user = useUser();
  useEffect(() => {
    if (user.storeAccess) {
      setStoreAccess(user.storeAccess);
      setStoreModuleAccess(user.storeModuleAccess)
    }
  }, [user.storeAccess]);

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

  const [{ data: stockSyncData, fetching: stockSyncFetching }, createErpDataSync] = useGlobalAction(api.erpDataSyncFull);
  console.log("erpDataSyncResult", stockSyncData)
  const [{ fetching: erpProductSyncFetching }, createErpProductSync] = useGlobalAction(api.erpProductSyncFull);
  const [{ fetching: productVariantUpdateFetching }, createProductVariantUpdate] = useGlobalAction(api.productVariantUpdateFileFinalFull);
  const [{ fetching: productVariantPriceUpdateFetching }, createProductVariantPriceUpdate] = useGlobalAction(api.productVariantPriceUpdateFileFinalFull);

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
  };

  // const handleSync = async () => {
  //   try {
  //     const erpDataSyncResult = await createErpDataSync();
  //     console.log("erpDataSyncResult", erpDataSyncResult)
  //     setStatus(prev => ({ ...prev, erpDataSync: erpDataSyncResult.result }));

  //     if (erpDataSyncResult.result) {
  //       const erpProductSyncResult = await createErpProductSync();
  //       setStatus(prev => ({ ...prev, erpProductSync: erpProductSyncResult.result }));

  //       if (erpProductSyncResult.result) {
  //         const productVariantUpdateResult = await createProductVariantUpdate();
  //         setStatus(prev => ({ ...prev, productVariantUpdate: productVariantUpdateResult.result }));

  //         if (productVariantUpdateResult.result) {
  //           const productVariantPriceUpdateResult = await createProductVariantPriceUpdate();
  //           setStatus(prev => ({ ...prev, productVariantPriceUpdate: productVariantPriceUpdateResult.result }));
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("An error occurred during the synchronization process:", error);
  //   }
  // };

const handleSync = () => {
    createErpDataSync()
    .then((erpDataSyncResult) => {
      console.log("ERP Data Sync Result:", erpDataSyncResult);
      setStatus(prev => ({ ...prev, erpDataSync: erpDataSyncResult?.data.result }));

      if (erpDataSyncResult.data.result) {
        return createErpProductSync();
      } else {
        throw new Error("ERP Data Sync failed.");
      }
    })
    .then((erpProductSyncResult) => {
      console.log("ERP Product Sync Result:", erpProductSyncResult);
      setStatus(prev => ({ ...prev, erpProductSync: erpProductSyncResult?.data.result }));

      if (erpProductSyncResult.data.result) {
        return createProductVariantUpdate();
      } else {
        throw new Error("ERP Product Sync failed.");
      }
    })
    .then((productVariantUpdateResult) => {
      console.log("Product Variant Update Result:", productVariantUpdateResult);
      setStatus(prev => ({ ...prev, productVariantUpdate: productVariantUpdateResult?.data.result }));

      if (productVariantUpdateResult.data.result) {
        return createProductVariantPriceUpdate();
      } else {
        throw new Error("Product Variant Update failed.");
      }
    })
    .then((productVariantPriceUpdateResult) => {
      console.log("Product Variant Price Update Result:", productVariantPriceUpdateResult);
      setStatus(prev => ({ ...prev, productVariantPriceUpdate: productVariantPriceUpdateResult?.data.result }));
    })
    .catch((error) => {
      console.error("An error occurred during the synchronization process:", error);
    });
};

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
      const initialStoreCode = stores[0]?.value;
        setSelectStoreCode(initialStoreCode);
        setStoreCode(stores);
      }
    }, [storeData, storeAccess]);

  useEffect(() => {
    if (!stockSyncFetching && !erpProductSyncFetching && !productVariantUpdateFetching && !productVariantPriceUpdateFetching) {
      setRefreshTable(prev => !prev);
    }
  }, [stockSyncFetching, erpProductSyncFetching, productVariantUpdateFetching, productVariantPriceUpdateFetching]);

  useEffect(() => {
    if (stockSyncFetching || erpProductSyncFetching || productVariantUpdateFetching || productVariantPriceUpdateFetching) {
      setIsBanner(true);
    } else if(!stockSyncFetching && !erpProductSyncFetching && !productVariantUpdateFetching && !productVariantPriceUpdateFetching){
      const timer = setTimeout(() => {
        setIsBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stockSyncFetching, erpProductSyncFetching, productVariantUpdateFetching, productVariantPriceUpdateFetching]);

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
        <Button onClick={handleSync} disabled={stockSyncFetching || erpProductSyncFetching || productVariantUpdateFetching || productVariantPriceUpdateFetching}>
          {(stockSyncFetching || erpProductSyncFetching || productVariantUpdateFetching || productVariantPriceUpdateFetching) ? 'Syncing...' : 'Start Sync'}
        </Button>
        <Button onClick={() => setActiveExport(!activeExport)}>Export</Button>
        <Button onClick={() => setActiveImport(true)}>Import</Button>
      </ButtonGroup>}
    >
      <Box paddingBlockEnd="200">
        {isBanner && (
          <Banner
            title={
              stockSyncFetching || erpProductSyncFetching || productVariantUpdateFetching || productVariantPriceUpdateFetching
                ? "Inventory Sync is in progress"
                : `Sync Results: 
                   ERP Data Sync - ${status.erpDataSync ? 'Success' : 'Failed'}, 
                   ERP Product Sync - ${status.erpProductSync ? 'Success' : 'Failed'}, 
                   Product Variant Update - ${status.productVariantUpdate ? 'Success' : 'Failed'}, 
                   Product Variant Price Update - ${status.productVariantPriceUpdate ? 'Success' : 'Failed'}`
            }
            tone={
              !stockSyncFetching && !erpProductSyncFetching && !productVariantUpdateFetching && !productVariantPriceUpdateFetching && Object.values(status).every(result => result)
                ? "success"
                : "warning"
            }
          />
        )}
      </Box>

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