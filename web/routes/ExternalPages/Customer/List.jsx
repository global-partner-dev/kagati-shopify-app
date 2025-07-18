/**
 * CustomersListPage Component
 * 
 * This component displays a list of customers in an indexed table format, allowing the user to view, sort, filter, 
 * and export customer data. It also includes options to add new customers and handle bulk import/export of customer data.
 * 
 * Features:
 * - Display customer details such as name, email, subscription status, order count, and total spent.
 * - Supports sorting, filtering, and searching customers.
 * - Allows exporting customer data as a CSV file.
 * - Handles pagination and selection of customers.
 * - Provides actions like viewing customer details, adding new customers, and refreshing the list.
 * - Includes modals for exporting and importing customers.
 * 
 * Usage:
 * 
 * <CustomersListPage />
 */

import { useState, useCallback } from 'react';
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
  Spinner,
  Thumbnail,
  Box
} from '@shopify/polaris';
import { ViewIcon, RefreshIcon, NoteIcon } from '@shopify/polaris-icons';
import TableComponent from '../../../components/TableComponent';
import { api } from '../../../api';
import { useFindMany } from '@gadgetinc/react';
import { useNavigate } from 'react-router-dom';
import ModalComponent from '../../../components/ModalComponent';
import ActionModalComponent from '../../../components/ActionModalComponent';
import { convertSortOrder } from '../../../util/commonFunctions';

import '../../../assets/styles/List.css'; // Ensure this path is correct

const CustomersListPage = () => {
  const navigate = useNavigate();
  const NumberOnPage = 50;
  const [cursor, setCursor] = useState({ first: NumberOnPage });
  const [activeExport, setActiveExport] = useState(false);
  const [activeImport, setActiveImport] = useState(false);
  const [selectedExport, setSelectedExport] = useState(['current_page']);
  const [selectedExportAs, setSelectedExportAs] = useState(['csv_excel']);
  const [filterBy, setFilterBy] = useState({});
  const [searchBy, setSearchBy] = useState("");
  const [sortSelected, setSortSelected] = useState(["firstName asc"]);

  const handleClose = () => {
    setActiveExport(false);
    setActiveImport(false);
  };

  const handleSelectedExport = useCallback((value) => setSelectedExport(value), []);
  const handleSelectedExportAs = useCallback((value) => setSelectedExportAs(value), []);


  const handleExportAndDownload = () => {
    if (!customers || customers.length === 0) {
      alert("No customers to export.");
      return;
    }

    let csvContent = "";
    csvContent += "First Name,Last Name,Email,Marketing Opt In Level,Orders Count,Total Spent\n";

    customers.forEach(({ firstName, lastName, email, marketingOptInLevel, ordersCount, totalSpent }) => {
      csvContent += `${firstName},${lastName},${email},${marketingOptInLevel},${ordersCount},${totalSpent}\n`;
    });

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: 'text/csv;charset=utf-8;' });

    const fileUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', 'exported_customers.csv');
    document.body.appendChild(link); // Required for FF
    link.click(); // Trigger download

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);

    // Close the export modal
    handleClose();
  };


  const searchParams = searchBy ? { search: searchBy } : {};

  const [{ data: customers, fetching, error }] = useFindMany(api.shopifyCustomer, {
    ...cursor,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      marketingOptInLevel: true,
      ordersCount: true,
      totalSpent: true,
    },
    ...searchParams,
    filter: filterBy,
    sort: convertSortOrder(sortSelected),
  });

  const resourceName = {
    singular: "customer",
    plural: "customers",
  };

  const headings = [
    { title: '' },
    { title: 'Customer' },
    { title: 'Email' },
    { title: 'Email Subscription' },
    { title: 'Orders Count' },
    { title: 'Total Spent' },
    { title: 'Refresh' },
  ];

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(customers);

  const rowMarkup = customers?.map(({ id, firstName, lastName, email, marketingOptInLevel, ordersCount, totalSpent }, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
      className="indexTableRow"
    >
      <IndexTable.Cell></IndexTable.Cell>
      <IndexTable.Cell>
        <InlineStack align="start">
          <Link
            dataPrimaryLink
            removeUnderline
            monochrome
            onClick={() => navigate(`/customers/${id}`)}
          >
            <Text as="span" variant="bodyMd">
              {`${firstName} ${lastName}`}
            </Text>
          </Link>
          <Icon source={ViewIcon} tone="base" className="viewIcon" />
        </InlineStack>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {email}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone="success">{marketingOptInLevel ? 'Subscribed' : 'Not-Subscribed'}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {ordersCount}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {totalSpent}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Icon source={RefreshIcon} tone="base" />
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  //  if (fetching) return <Spinner />;

  if (error) return <div>Error loading customers: {error.message}</div>;

  return (
    <Page
      fullWidth
      compactTitle
      title="Customers"
      primaryAction={{
        content: 'Add Customer',
        onClick: () => navigate('/customers/new'),
      }}
      secondaryActions={[
        {
          content: 'Export',
          onAction: () => setActiveExport(!activeExport),
        },
        // {
        //   content: 'Import',
        //   onAction: () => setActiveImport(true),
        // },
      ]}
    >
      <TableComponent
        style={{ "width": "100% !important" }}
        tableData={customers}
        tableHeadings={headings}
        tableRowMarkUp={rowMarkup}
        tableSortOptions={[
          { label: 'Customer', value: 'firstName asc', directionLabel: 'A-Z' },
          { label: 'Customer', value: 'firstName desc', directionLabel: 'Z-A' },
          { label: 'Order Count', value: 'ordersCount asc', directionLabel: 'Ascending' },
          { label: 'Order Count', value: 'ordersCount desc', directionLabel: 'Descending' },
          { label: 'Total Spent', value: 'totalSpent asc', directionLabel: 'Ascending' },
          { label: 'Total Spent', value: 'totalSpent desc', directionLabel: 'Descending' },
        ]}
        tableFilterOptions={[
          { label: "All", value: {} },
          { label: "Active", value: {} },
          { label: "Draft", value: {} },
          { label: "Archived", value: {} },
        ]}
        tableSetCursor={setCursor}
        tableNumberOnPage={NumberOnPage}
        tableSetFilterBy={setFilterBy}
        tableSetSearchBy={setSearchBy}
        tableSelectedResources={selectedResources}
        tableAllResourcesSelected={allResourcesSelected}
        tableHandleSelectionChange={handleSelectionChange}
        tableResourceName={resourceName}
        tableSortSelected={sortSelected}
        tableSetSortSelected={setSortSelected}
      />
      {activeExport && (
        <ActionModalComponent
          modalTitle="Export customers"
          modalPrimaryButton="Export customers"
          modalActive={activeExport}
          handleModalClose={handleClose}
          onPrimaryAction={handleExportAndDownload}
        >
          <BlockStack vertical gap="400">
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
                  { label: "All customers", value: "all_customers" },
                  {
                    label: "Selected: 0 customers",
                    value: "selected_customers",
                    disabled: true,
                  },
                  {
                    label: "50+ customers matching your search",
                    value: "fifty_plus_customers",
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

export default CustomersListPage;
