/**
 * FilesListPage Component
 * 
 * This component renders a page listing files with various actions such as export, import, and filtering based on file attributes.
 * It leverages Shopify's Polaris components for the UI and integrates with the Gadget API for data fetching and operations.
 * 
 * Features:
 * - **File Listing:** Displays a list of files with details like ID, Image, URL, File Size, Status, Created At, Type, Duration, and Updated At.
 * - **Filtering and Search:** Allows users to filter files by date and search through them.
 * - **Export and Import:** Provides functionality to export the listed files to a CSV and import files via CSV upload.
 * - **Date Picker:** Includes a date picker for filtering files based on their creation date range.
 * - **Polaris Components:** Utilizes Shopify Polaris components like Page, IndexTable, Badge, Text, Button, Modal, DropZone, etc., for a consistent UI.
 * - **Modals:** Includes modals for exporting and importing files with additional configuration options.
 * 
 * Hooks:
 * - `useNavigate`: React Router hook used for navigation between different pages.
 * - `useState`: React hook used for managing component state such as selected dates, filters, and modal visibility.
 * - `useCallback`: React hook used for optimizing callback functions.
 * - `useFindMany`: Gadget hook used for fetching a list of files from the backend.
 * - `useIndexResourceState`: Shopify Polaris hook for managing selection state within the IndexTable.
 * 
 * Render:
 * - Renders a page with a file list, export/import buttons, and modals for export/import actions.
 * - Integrates a table component (`TableComponent`) to display file details.
 * - Provides date filtering via a date picker.
 * 
 * Dependencies:
 * - `@shopify/polaris`: Used for UI components.
 * - `@gadgetinc/react`: Used for data fetching and form management.
 * - `react-router-dom`: Used for navigation within the app.
 * 
 * Usage:
 * - This component is typically used in an admin interface where users need to manage and view a list of files.
 * - The export and import functionalities facilitate batch operations on files.
 * 
 * Example Usage:
 * - `FilesListPage` can be rendered within a route like `/files` to provide a file management interface.
 * 
 * Notes:
 * - Ensure the API endpoints and data schema are correctly set up in the Gadget backend to support the file operations.
 * - The `TableComponent` should be correctly configured to display the file data as expected.
 */

import { useState, useCallback } from 'react';
import {
  useIndexResourceState,
  Page,
  IndexTable,
  Badge,
  Text,
  Button,
  DatePicker,
  Link,
  Icon,
  BlockStack,
  InlineStack,
  ChoiceList,
  Spinner,
  Modal,
  DropZone,
  TextField,
} from '@shopify/polaris';
import { RefreshIcon, ViewIcon } from '@shopify/polaris-icons';
import TableComponent from '../../components/TableComponent';
import { useNavigate } from 'react-router-dom';
import { useFindMany } from '@gadgetinc/react';
import ModalComponent from '../../components/ModalComponent';
import ActionModalComponent from '../../components/ActionModalComponent';
import { api } from "../../api";
import '../../assets/styles/List.css';

const FilesListPage = () => {
  const navigate = useNavigate();
  const NumberOnPage = 50;
  const [cursor, setCursor] = useState({ first: 50 });
  const [activeExport, setActiveExport] = useState(false);
  const [activeImport, setActiveImport] = useState(false);
  const [selectedExport, setSelectedExport] = useState(['current_page']);
  const [selectedExportAs, setSelectedExportAs] = useState(['csv_excel']);
  const [searchBy, setSearchBy] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null);
  const [{ month, year }, setDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  // Resource state management
  

  const handleClose = () => {
    setActiveExport(false);
    setActiveImport(false);
  };

  
  

  const handleMonthChange = useCallback((month, year) => {
    setDate({ month, year });
  }, []);

  const handleDateChange = useCallback((selectedDates) => {
    setSelectedDates(selectedDates);
  }, []);

  const handleSelectedExport = useCallback((value) => setSelectedExport(value), []);
  const handleSelectedExportAs = useCallback((value) => setSelectedExportAs(value), []);

  const [{ data: files, fetching, error }] = useFindMany(api.shopifyFile, {
    ...cursor,
    select: {
      id: true,
      image: true,
      originalFileSize: true,
      fileStatus: true,
      shopifyCreatedAt: true,
      type: true,
      updatedAt: true,
      alt: true,
      duration: true,
      fileErrors: true,
      originalSource: true,
      preview: true,
      sources: true,
      url: true
    },
    filter: {
      ...filterBy,
    },
  });

  const resourceName = {
    singular: 'file',
    plural: 'files'
  };
  
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(files);

  const filteredFiles = selectedDates ? files?.filter(file => {
    const createdAt = new Date(file.shopifyCreatedAt);
    return createdAt >= selectedDates.start && createdAt <= selectedDates.end;
  }) : files;


  const handleExportAndDownload = useCallback(() => {
    if (!filteredFiles || filteredFiles.length === 0) {
      alert("No files to export.");
      return;
    }
  
    // Start by creating CSV headers
    let csvContent = [
      ["ID", "Image URL", "File Size", "Status", "Created At", "Type", "Duration", "Updated At", "Alt Text", "URL"]
    ];  // Using array to simplify joining process
  
    // Populate CSV content
    filteredFiles.forEach(file => {
      const row = [
        file.id,
        file.image ? `"${file.image.originalSrc}"` : '',
        `"${file.originalFileSize} bytes"`,
        file.fileStatus,
        `"${new Date(file.shopifyCreatedAt).toLocaleDateString()}"`,
        file.type,
        file.duration ? `"${file.duration} sec"` : 'N/A',
        `"${new Date(file.updatedAt).toLocaleDateString()}"`,
        file.alt ? `"${file.alt.replace(/"/g, '""')}"` : '',
        file.url
      ];
      csvContent.push(row.join(","));
    });
  
    // Create Blob from CSV content
    const blob = new Blob([csvContent.join("\n")], { type: 'text/csv;charset=utf-8;' });
  
    // Create a link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "exported_files.csv");
    document.body.appendChild(link);  // Required for Firefox
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);  // Clean up to release object URL
  }, [filteredFiles]);
  

  if (error) return <div>Error loading files: {error.message}</div>;

  return (
    <Page fullWidth compactTitle title="Files">
      <Button onClick={() => setDatePickerOpen(!isDatePickerOpen)}>Search and Filters</Button>
    {isDatePickerOpen && (
      <>
        <DatePicker
          month={month}
          year={year}
          onChange={handleDateChange}
          onMonthChange={handleMonthChange}
          selected={selectedDates}
          allowRange
        />
        <Button onClick={() => setDatePickerOpen(false)}>Close</Button>
      </>
    )}
    <Button onClick={() => setActiveExport(!activeExport)}>Export</Button>
  <Button onClick={() => setActiveImport(!activeImport)}>Import</Button>
      <TableComponent
        style={{ "width": "100% !important" }}
        tableData={filteredFiles}
        tableHeadings={[
          { title: 'ID' },
          { title: 'Image' },
          { title: 'URL' },
          { title: 'File Size' },
          { title: 'Status' },
          { title: 'Created At' },
          { title: 'Type' },
          { title: 'Duration' },
          { title: 'Updated At' }
        ]}
        tableRowMarkUp={filteredFiles?.map(({
          id,
          image,
          url,
          originalFileSize,
          fileStatus,
          shopifyCreatedAt,
          type,
          updatedAt,
          alt,
          duration
        }, index) => (
          <IndexTable.Row
            id={id}
            key={id}
            selected={selectedResources.includes(id)}
            position={index}
            className="indexTableRow"
          >
            <IndexTable.Cell><Text as='span' variant='bodyMd'>{id}</Text></IndexTable.Cell>
            <IndexTable.Cell><img src={image ? image.originalSrc : ''} alt={alt || 'No image available'} /></IndexTable.Cell>
            <IndexTable.Cell><Text as="span" variant="bodyMd">{url ? `${url}` : 'Null'}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text as="span" variant="bodyMd">{`${originalFileSize} bytes`}</Text></IndexTable.Cell>
            <IndexTable.Cell><Badge status={fileStatus === 'active' ? 'success' : 'attention'}>{fileStatus}</Badge></IndexTable.Cell>
            <IndexTable.Cell><Text as="span" variant="bodyMd">{new Date(shopifyCreatedAt).toLocaleDateString()}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text as="span" variant="bodyMd">{type ? `${type}` : 'N/A'}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text as="span" variant="bodyMd">{duration ? `${duration} sec` : 'N/A'}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text as="span" variant="bodyMd">{new Date(updatedAt).toLocaleDateString()}</Text></IndexTable.Cell>
          </IndexTable.Row>
        ))}
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
      />
      {activeImport && (
        <ModalComponent
          modalTitle="Import Files by CSV"
          modalPrimaryButton="Upload and Preview"
          modalActive={activeImport}
          handleModalClose={handleClose}
        >
          <BlockStack vertical>
            <DropZone
              accept=".csv"
              errorOverlayText="File type must be .csv"
              type="file"
              onDrop={(files) => handleFileUpload(files)}
            >
              <DropZone.FileUpload />
            </DropZone>
          </BlockStack>
        </ModalComponent>
      )}
      {activeExport && (
        <ActionModalComponent
          modalTitle="Export Files"
          modalPrimaryButton="Export Files"
          modalActive={activeExport}
          handleModalClose={handleClose}
          onPrimaryAction={handleExportAndDownload}
        >
          <BlockStack vertical gap="400">
            <InlineStack>
              <Text variant="bodyLg" as="p">
                This CSV file will include all pertinent file information. To manage specific file attributes or for batch updates, refer to the{" "}
                <Link url="Example App">CSV file for file management.</Link>
              </Text>
            </InlineStack>
            <InlineStack>
              <ChoiceList
                title="Export"
                choices={[
                  { label: "Current page", value: "current_page" },
                  { label: "All files", value: "all_files" },
                  {
                    label: "Selected: 0 files",
                    value: "selected_files",
                    disabled: true,
                  },
                  {
                    label: "50+ files matching your search",
                    value: "fifty_plus_files",
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
                  { label: "CSV for Excel, Numbers, or other spreadsheet programs", value: "csv_excel" },
                  { label: "Plain CSV file", value: "csv_plain" },
                ]}
                selected={selectedExportAs}
                onChange={handleSelectedExportAs}
              />
            </InlineStack>
            <InlineStack>
              <Text variant="bodyLg" as="p">
                Learn more about{" "}
                <Link url="Example App">exporting files to a CSV file</Link> or
                explore <Link url="Example App">advanced file handling tools</Link>.
              </Text>
            </InlineStack>
          </BlockStack>
        </ActionModalComponent>
      )}
    </Page>
  );
};

export default FilesListPage;
