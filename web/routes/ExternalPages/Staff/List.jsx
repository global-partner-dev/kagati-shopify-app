/**
 * StaffListPage Component
 * 
 * This component displays a paginated and sortable list of staff members. Users can filter, sort, and search through 
 * the list, as well as select multiple staff members for bulk actions. It also provides a primary action to navigate 
 * to a page for creating a new staff member.
 * 
 * State:
 * - `cursor` (object): Determines the pagination settings, such as the number of items per page.
 * - `filterBy` (object): Stores the current filter criteria applied to the list of staff members.
 * - `searchBy` (string): Stores the search query used to filter the staff list.
 * - `sortSelected` (array): Stores the current sort order selected by the user.
 * 
 * Hooks:
 * - `useNavigate`: React Router hook used for programmatic navigation, e.g., navigating to the staff detail or creation pages.
 * - `useFindMany`: Hook from the `@gadgetinc/react` library used to fetch staff data from the API.
 * - `useIndexResourceState`: Shopify Polaris hook used to manage the selection state of the resources (staff members) in the table.
 * 
 * Handlers:
 * - `handleSelectionChange`: Manages the selection of staff members for potential bulk actions.
 * 
 * Render:
 * - The component renders a `Page` layout containing an `IndexTable` that lists the staff members. The table is integrated 
 *   with a custom `TableComponent` that handles pagination, sorting, filtering, and search functionalities.
 * - Each row in the table provides details about a staff member, including their ID, email, first name, last name, role, 
 *   and status, with links to view or edit individual staff member details.
 * 
 * Usage:
 * - This component is used in an admin or management section of an application where users need to manage a list of staff 
 *   members. It provides essential features like sorting, filtering, and searching to easily find and manage staff.
 */

import { useState } from "react";
import {
    useIndexResourceState,
    Page,
    IndexTable,
    Text,
    InlineStack,
    Link,
    Badge
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import TableComponent from "../../../components/TableComponent";
import { api } from "../../../api";
import { useFindMany } from "@gadgetinc/react";
import { useNavigate } from "react-router-dom";
import { convertSortOrder } from "../../../util/commonFunctions";

const StaffListPage = () => {
    const navigate = useNavigate();
    const NumberOnPage = 50;
    const [cursor, setCursor] = useState({ first: NumberOnPage });
    const [filterBy, setFilterBy] = useState({});
    const [searchBy, setSearchBy] = useState("");
    const [sortSelected, setSortSelected] = useState(["id desc"]);

    const searchParams = searchBy ? { search: searchBy } : {};

    const [{ data: staffs, fetching, error }] = useFindMany(api.user, {
        ...cursor,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            roleName: true,
            status: true,
        },
        ...searchParams,
        filter: filterBy,
        sort: convertSortOrder(sortSelected),
    });

    const resourceName = {
        singular: "staff",
        plural: "staffs",
    };

    const headings = [
        { title: "id" },
        { title: "Email" },
        { title: "First Name" },
        { title: "Last Name" },
        { title: "Role" },
        { title: "Status" },
    ];

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(staffs);

    const rowMarkUp = staffs?.map(({ id, email, firstName, lastName, roleName, status }, index) => {
        return (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <Link
                        dataPrimaryLink
                        removeUnderline
                        monochrome
                        onClick={() => navigate(`/staffs/${id}`)}
                    >
                        <Text as="h6" variant="headingSm">
                            {id}
                        </Text>
                    </Link>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <InlineStack align="start">
                        <Text as="span" variant="bodyMd">
                            {email}
                        </Text>
                    </InlineStack>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd">
                        {firstName}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd">
                        {lastName}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd">
                        {roleName}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {status ? <Badge tone={status === "Active" ? "success" : "info"}>
                        {status === "Active" ? "Active" : "Inactive"}
                    </Badge> : ''}
                </IndexTable.Cell>
            </IndexTable.Row>
        );
    });

    const filterOptions = [
        { label: "All", value: {} },
        { label: "Active", value: { status: { equals: "Active" } } },
        { label: "Inactive", value: { status: { equals: "Inactive" } } },
    ]

    const sortOptions = [
        { label: "Id", value: "id asc", directionLabel: "Ascending" },
        { label: "Id", value: "id desc", directionLabel: "Descending" },
        { label: "Email", value: "email asc", directionLabel: "A-Z" },
        { label: "Email", value: "email desc", directionLabel: "Z-A" },
        { label: "First Name", value: "firstName asc", directionLabel: "A-Z" },
        { label: "First Name", value: "firstName desc", directionLabel: "Z-A" },
        { label: "Last Name", value: "lastName asc", directionLabel: "A-Z" },
        { label: "Last Name", value: "lastName desc", directionLabel: "Z-A" },
        { label: "Role Name", value: "roleName asc", directionLabel: "A-Z" },
        { label: "Role Name", value: "roleName desc", directionLabel: "Z-A" },
    ];

    return (
        <Page
            fullWidth
            compactTitle
            title="Staff"
            primaryAction={{
                content: "Create staff",
                icon: PlusIcon,
                onClick: () => navigate("/staffs/new"),
            }}
        >
            <TableComponent
                tableData={staffs}
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
        </Page>
    );
};

export default StaffListPage;
