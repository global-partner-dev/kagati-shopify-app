/**
 * AddStaffPage Component
 * 
 * This component provides an interface for adding a new staff member. It allows users to input staff details such as 
 * email, first name, last name, password, role, status, and access permissions. The form includes fields for selecting 
 * access modules and store access, which are fetched from the API.
 * 
 * State:
 * - `postStaff` (object): Stores the values of the form fields for the new staff member.
 * - `storeOptions` (array): List of store options fetched from the API, formatted as "storeName-storeCode".
 * - `hover` (boolean): Tracks hover state for specific interactive elements (if needed in future).
 * 
 * Hooks:
 * - `useNavigate`: React Router hook used for programmatic navigation after successfully adding a staff member.
 * - `useFindMany`: Hook from the `@gadgetinc/react` library used to fetch store data from the API.
 * - `useEffect`: Hook used to set the store options after fetching store data.
 * 
 * Handlers:
 * - `handleValues`: Updates the `postStaff` state with the values entered in the form fields.
 * - `handleSubmit`: Prepares the data and sends a request to the API to create a new staff member. If successful, it 
 *   navigates back to the staff list page.
 * 
 * Render:
 * - The component renders a `Page` layout with two side-by-side `Card` components, each containing form fields for 
 *   inputting staff details.
 * - `ActionMultiSelectComponent` is used for multi-select fields such as "Access Modules" and "Select Store".
 * - A `ButtonGroup` at the bottom provides options to save or cancel the operation.
 * 
 * Usage:
 * - This component is used in an admin or management section of an application where users can add new staff members and 
 *   configure their roles and permissions.
 * - The form is designed to be flexible, allowing the selection of roles, status, and store access, which can be tailored 
 *   to the organization's needs.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Page,
  TextField,
  ButtonGroup,
  Button,
  Select,
  Card,
  InlineGrid,
  BlockStack,
  Box,
} from '@shopify/polaris';
import { api } from "../../../api";
import { useFindMany } from "@gadgetinc/react";
import ActionMultiSelectComponent from "../../../components/ActionMultiSelectComponent";

const AddStaffPage = () => {
  const navigate = useNavigate();
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

  const accessModulesOptions = ["Order List", "Order Add", "Order Edit", "Inventories", "Stores", "Pincodes", "Staffs", "Customer Support", "Shipping Profile"];


  const handleSubmit = async () => {
    const preparedStoreModuleAccess = postStaff.storeModuleAccess.includes('Select All') ? postStaff.storeModuleAccess.filter(option => option !== 'Select All') : postStaff.storeModuleAccess;
    const preparedStoreAccess = postStaff.storeAccess.includes('Select All') ? postStaff.storeAccess.filter(option => option !== 'Select All') : postStaff.storeAccess;

    const requestSignUpData = {
      email: postStaff.email,
      password: postStaff.password,
      firstName: postStaff.firstName,
      lastName: postStaff.lastName,
      roleName: postStaff.roleName,
      status: postStaff.status,
      storeModuleAccess: preparedStoreModuleAccess,
      storeAccess: preparedStoreAccess,
    };

    console.log(requestSignUpData, 'requestSignUpData');

    try {
      const responseSignUp = await api.user.create(requestSignUpData);
      if (responseSignUp) {
        navigate("/staffs");
      }
    } catch (error) {
      console.error("Failed to add staff:", error);
    }
  };

  useEffect(() => {
    if (stores) {
      const data = stores.map(store => {
        return `${store.storeName}-${store.storeCode}`;
      });
      setStoreOptions(data);
    }
  }, [stores]);

  return (
    <Page
      backAction={{ content: "Staff", onAction: () => navigate("/staffs") }}
      title="Add New Staff"
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
              selectOptions={accessModulesOptions}
              onValueChange={handleValues}
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
              selectOptions={storeOptions}
              onValueChange={handleValues}
            />
          </BlockStack>
        </Card>
      </InlineGrid>
      <Box paddingBlock="400">
        <ButtonGroup>
          <Button onClick={() => setPostStaff({})} >
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

export default AddStaffPage;