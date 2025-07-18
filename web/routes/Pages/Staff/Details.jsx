/**
 * StaffDetailsPage Component
 * 
 * This component provides an interface for viewing and editing the details of an existing staff member. It allows users 
 * to modify staff information such as first name, last name, role, status, access modules, and store access. The form 
 * pre-fills with the current data for the staff member, which can then be updated.
 * 
 * State:
 * - `postStaff` (object): Stores the values of the form fields for the staff member being edited.
 * - `storeOptions` (array): List of store options fetched from the API, formatted as "storeName-storeCode".
 * 
 * Hooks:
 * - `useNavigate`: React Router hook used for programmatic navigation after successfully updating a staff member.
 * - `useParams`: React Router hook used to retrieve the `id` of the staff member from the URL.
 * - `useFindMany`: Hook from the `@gadgetinc/react` library used to fetch store data from the API.
 * - `useFindOne`: Hook from the `@gadgetinc/react` library used to fetch details of the specific staff member by ID.
 * - `useEffect`: Hook used to set the store options and pre-fill the staff form with the existing staff data.
 * 
 * Handlers:
 * - `handleValues`: Updates the `postStaff` state with the values entered in the form fields.
 * - `handleSubmit`: Prepares the data and sends a request to the API to update the staff member's details. If successful, 
 *   it navigates back to the staff list page.
 * 
 * Render:
 * - The component renders a `Page` layout with two side-by-side `Card` components, each containing form fields for 
 *   inputting staff details.
 * - `ActionMultiSelectComponent` is used for multi-select fields such as "Access Modules" and "Select Store".
 * - A `ButtonGroup` at the bottom provides options to save the changes or reset the form.
 * 
 * Usage:
 * - This component is used in an admin or management section of an application where users can view and edit details of 
 *   existing staff members. It provides a user-friendly interface for updating roles, permissions, and access settings.
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Page,
  TextField,
  ButtonGroup,
  Button,
  Select,
  InlineGrid,
  Card,
  BlockStack,
  Box
} from '@shopify/polaris';
import { useFindMany, useFindOne } from "@gadgetinc/react";
import { api } from "../../../api";
import ActionMultiSelectComponent from "../../../components/ActionMultiSelectComponent";

const StaffDetailsPage = () => {
  const navigate = useNavigate();
  let { id } = useParams();
  const [postStaff, setPostStaff] = useState({});
  const [storeOptions, setStoreOptions] = useState([]);

  const [{ data: stores, fetching: storesFetching, error: storesError }] = useFindMany(api.khagatiStores, {
    select: {
      storeCode: true,
      storeName: true,
    },
    filter: {
      status: { in: ["Active"] }
    }
  });

  const [{ data: staffs, fetching: staffsFetching, error: staffsError }] = useFindOne(api.user, id, {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      roleName: true,
      status: true,
      storeModuleAccess: true,
      storeAccess: true,
    }
  });

  const handleValues = (value, name) => {
    setPostStaff((prevStaff) => ({
      ...prevStaff,
      [name]: value,
    }));
  };

  const roleOptions = [
    { label: 'Super Admin', value: 'Super Admin' },
    { label: 'Store Admin', value: 'Store Admin' },
    { label: 'Store Manager', value: 'Store Manager' },
    { label: 'Store', value: 'Store' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  const accessModulesOptions = ["Order List", "Order Add", "Order Edit", "Inventories", "Stores", "Pincodes", "Staffs", "Customer Support", "Shipping Profile", "Order Export"];

  const handleSubmit = async () => {
    const preparedStoreModuleAccess = postStaff.storeModuleAccess && postStaff.storeModuleAccess.includes('Select All') ? postStaff.storeModuleAccess.filter(option => option !== 'Select All') : postStaff.storeModuleAccess;
    const preparedStoreAccess = postStaff.storeAccess && postStaff.storeAccess.includes('Select All') ? postStaff.storeAccess.filter(option => option !== 'Select All') : postStaff.storeAccess;

    const requestUpdateData = {
      firstName: postStaff.firstName,
      lastName: postStaff.lastName,
      roleName: postStaff.roleName,
      status: postStaff.status,
      storeModuleAccess: preparedStoreModuleAccess,
      storeAccess: preparedStoreAccess,
      ...(postStaff.password && { password: postStaff.password }),
    };

    console.log("requestUpdateData", requestUpdateData);

    try {
      const responseUpdate = await api.user.update(postStaff.id, requestUpdateData);
      if (responseUpdate) {
        navigate("/staffs");
      }
    } catch (error) {
      console.error("Failed to update staff:", error);
    }
  };

  const handleCancel = () => {
    setPostStaff(staffs);
    navigate("/staffs");
  };

  useEffect(() => {
    if (stores) {
      const data = stores.map(store => `${store.storeName}-${store.storeCode}`);
      setStoreOptions(data);
    }
  }, [stores]);

  useEffect(() => {
    if (staffs) {
      setPostStaff(staffs);
    }
  }, [staffs]);

  return (
    <Page
      backAction={{ content: "Staff", onAction: () => navigate("/staffs") }}
      title="Staff Details"
    >
      <InlineGrid columns={{ xs: 1, md: "2fr 2fr" }} gap="400">
        <Card>
          <BlockStack gap="400">
            <TextField
              type="text"
              label="Email"
              name="email"
              value={postStaff?.email || ''}
              onChange={(value) => handleValues(value, 'email')}
              readOnly
            />
            <TextField
              type="text"
              label="First Name"
              name="firstName"
              value={postStaff?.firstName || ''}
              onChange={(value) => handleValues(value, 'firstName')}
            />
            <Select
              label="Status"
              options={statusOptions}
              placeholder="Select Status"
              name="status"
              value={postStaff?.status || ''}
              onChange={(value) => handleValues(value, 'status')}
            />
            <ActionMultiSelectComponent
              fieldName="storeModuleAccess"
              labelName="Access Modules"
              selectOptions={['Select All', ...accessModulesOptions]}
              onValueChange={handleValues}
              defaultValue={postStaff?.storeModuleAccess || []}
            />
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="400">
            <TextField
              type="password"
              label="Password"
              name="password"
              value={postStaff?.password || ''}
              onChange={(value) => handleValues(value, 'password')}
            />
            <TextField
              type="text"
              label="Last Name"
              name="lastName"
              value={postStaff?.lastName || ''}
              onChange={(value) => handleValues(value, 'lastName')}
            />
            <Select
              label="Role"
              options={roleOptions}
              placeholder="Select Role"
              name="roleName"
              value={postStaff?.roleName || ''}
              onChange={(value) => handleValues(value, 'roleName')}
            />
            <ActionMultiSelectComponent
              fieldName="storeAccess"
              labelName="Select Store"
              selectOptions={['Select All', ...storeOptions]}
              onValueChange={handleValues}
              defaultValue={postStaff?.storeAccess || []}
            />
          </BlockStack>
        </Card>
      </InlineGrid>
      <Box paddingBlock="400">
        <ButtonGroup>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button submit variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </ButtonGroup>
      </Box>
    </Page>
  );
};

export default StaffDetailsPage;