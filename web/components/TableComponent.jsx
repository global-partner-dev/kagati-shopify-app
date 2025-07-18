/**
 * TableComponent
 * 
 * This component renders a fully customizable and sortable table using Shopify's Polaris components, such as `IndexTable`, `Card`, `IndexFilters`, and `Pagination`.
 * It is designed to handle large datasets with pagination, filtering, and sorting capabilities. The table supports bulk actions, dynamic filter tabs, 
 * and responsive layout adjustments.
 * 
 * @param {array} tableData - The data to be displayed in the table. This should be an array of objects, each representing a row in the table.
 * @param {array} tableFilterOptions - Options for filtering the data, which are displayed as tabs. Each option should have a `label` and `value`.
 * @param {array} tableHeadings - An array of headings for the table columns, each being an object with a `title` property.
 * @param {ReactNode} tableRowMarkUp - The markup for rendering each row in the table, typically generated dynamically based on `tableData`.
 * @param {function} tableSetCursor - Callback function to set the cursor for pagination, either to fetch the next or previous set of rows.
 * @param {number} tableNumberOnPage - Number of rows to display per page.
 * @param {function} tableSetFilterBy - Callback function to set the current filter applied to the data, based on user selection.
 * @param {function} tableSetSearchBy - Callback function to set the search query, filtering the data based on user input.
 * @param {array} tableSelectedResources - An array of selected row identifiers, used for bulk actions.
 * @param {boolean} tableAllResourcesSelected - Boolean indicating whether all resources in the current view are selected.
 * @param {function} tableHandleSelectionChange - Callback function that handles changes to the selection of rows.
 * @param {object} tableResourceName - An object defining the singular and plural name of the resource (e.g., `{ singular: 'item', plural: 'items' }`).
 * @param {array} tableSortOptions - Options for sorting the data, typically displayed in a dropdown. Each option should have a `label` and `value`.
 * @param {string} tableSortSelected - The currently selected sort option.
 * @param {function} tableSetSortSelected - Callback function to set the selected sort option.
 * @param {array} tablePromotedBulkActions - An array of bulk action objects, each containing properties such as `content` and `onAction`.
 * 
 * @returns {JSX.Element} A customizable and feature-rich table component with filtering, sorting, pagination, and bulk actions.
 */

import {
  IndexTable,
  Card,
  IndexFilters,
  useSetIndexFiltersMode,
  Layout,
  Pagination,
  Spinner,
  Box,
  InlineStack,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

const TableComponent = ({
  tableData,
  tableFilterOptions,
  tableHeadings,
  tableRowMarkUp,
  tableSetCursor,
  tableNumberOnPage,
  tableSetFilterBy,
  tableSetSearchBy,
  tableSelectedResources,
  tableAllResourcesSelected,
  tableHandleSelectionChange,
  tableResourceName,
  tableSortOptions,
  tableSortSelected,
  tableSetSortSelected,
  tablePromotedBulkActions,
}) => {
  const [tone, setStatus] = useState(undefined);
  const [type, setType] = useState(undefined);
  const [queryValue, setQueryValue] = useState("");
  const [selected, setSelected] = useState(0);
  const numberOnPage = { tableNumberOnPage };
  const { mode, setMode } = useSetIndexFiltersMode();
  const [loading,setLoading]=useState(true);
  const filters = [];
  const appliedFilters = [];

  const getNextPage = useCallback(() => {
    tableSetCursor({ first: numberOnPage.tableNumberOnPage, after: tableData.endCursor });
  }, [tableData, tableSetCursor, numberOnPage.tableNumberOnPage]);

  const getPreviousPage = useCallback(() => {
    tableSetCursor({ last: numberOnPage.tableNumberOnPage, before: tableData.startCursor });
  }, [tableData, tableSetCursor, numberOnPage.tableNumberOnPage]);

  function disambiguateLabel(key, value) {
    switch (key) {
      case "type":
        return value.map((val) => `type: ${val}`).join(", ");
      case "tone":
        return value.map((val) => `tone: ${val}`).join(", ");
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }

  const tabs = tableFilterOptions?.map((item, index) => ({
    content: item.label,
    index,
    id: `${item.label}-${index}`,
    isLocked: index === 0,
    onAction: () => {
      tableSetFilterBy(item.value);
    },
  }));

  const onHandleCancel = () => {
    setQueryValue('')
    tableSetSearchBy('')
  };

  const handleFiltersQueryChange = useCallback(
    (value) => {
      setQueryValue(value)
      tableSetSearchBy(value)
    },
    []
  );

  const handleStatusRemove = useCallback(() => setStatus(undefined), []);

  const handleTypeRemove = useCallback(() => setType(undefined), []);

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);

  const handleFiltersClearAll = useCallback(() => {
    handleStatusRemove();
    handleTypeRemove();
    handleQueryValueRemove();
  }, [handleStatusRemove, handleQueryValueRemove, handleTypeRemove]);

  if (tone && !isEmpty(tone)) {
    const key = "tone";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, tone),
      onRemove: handleStatusRemove,
    });
  }

  if (type && !isEmpty(type)) {
    const key = "type";
   
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, type),
      onRemove: handleTypeRemove,
    });
  }
  // console.log(tableRowMarkUp,"tableRowMarkUp")
setTimeout(() => setLoading(false), 2000);
  return (
    <Layout>
      <Layout.Section>
        <Card padding="0">
          <IndexFilters
            sortOptions={tableSortOptions}
            sortSelected={tableSortSelected}
            onSort={tableSetSortSelected}
            queryValue={queryValue}
            queryPlaceholder="Searching in all"
            onQueryChange={handleFiltersQueryChange}
            onQueryClear={() => {
              setQueryValue('')
              tableSetSearchBy('')
            }}
            cancelAction={{
              onAction: onHandleCancel,
              disabled: false,
              loading: false,
            }}
            tabs={tabs}
            selected={selected}
            onSelect={setSelected}
            filters={filters}
            appliedFilters={appliedFilters}
            onClearAll={handleFiltersClearAll}
            mode={mode}
            setMode={setMode}
          />
          {loading && tableRowMarkUp != 'undefined' ? ( 
              <Box textalign="center" padding="500" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '250px',
              }}>
              <Spinner accessibilityLabel="Loading table data" size="large" /> 
            </Box>):(
             <IndexTable
                resourceName={tableResourceName}
                itemCount={tableData?.length || 0}
                selectedItemsCount={tableSelectedResources?.length}
                promotedBulkActions={tablePromotedBulkActions}
                onSelectionChange={tableHandleSelectionChange}
                sortable={[false, false, false, false, false, false]}
                headings={tableHeadings}
              >
                {tableRowMarkUp}
              </IndexTable>
          )}
         
          <Box padding="500" borderColor="border" borderBlockStartWidth="025">
            <InlineStack align="center">
              <Pagination
                hasPrevious={tableData?.hasPreviousPage}
                previousTooltip="Previous"
                onPrevious={getPreviousPage}
                hasNext={tableData?.hasNextPage}
                nextTooltip="Next"
                onNext={getNextPage}
              />
            </InlineStack>
          </Box>
        </Card>
      </Layout.Section>
    </Layout>
  );
};

export default TableComponent;