/**
 * NewModal Component
 * 
 * This component renders a modal for selecting products from a paginated list. Users can search for products, 
 * select individual items, or select all items displayed on the current page. The selected products are then 
 * passed to a parent component upon submission.
 * 
 * Props:
 * - `isModalOpen` (boolean): Controls whether the modal is open or closed.
 * - `handleModalClose` (function): Callback function to close the modal.
 * - `onSave` (function): Callback function that receives the selected products when the user submits the form.
 * 
 * State:
 * - `displayedProducts` (array): List of products currently displayed in the modal, fetched from the API.
 * - `selectedProducts` (array): List of products selected by the user.
 * - `currentPage` (number): Tracks the current page of products displayed.
 * - `searchTerm` (string): The search term used to filter the products list.
 * - `selectAll` (boolean): Controls whether all products on the current page are selected.
 * 
 * Hooks:
 * - `useFindMany`: Hook from the `@gadgetinc/react` library used to fetch products from the API.
 * - `useEffect`: Hook used to update `displayedProducts` when the modal is opened or when the current page changes.
 * 
 * Handlers:
 * - `handleSearchChange`: Updates the `searchTerm` state and triggers a new API query.
 * - `toggleSelectAll`: Toggles the selection of all products on the current page.
 * - `handleProductSelection`: Adds or removes a product from the `selectedProducts` state based on user interaction.
 * - `handleNextPage`: Moves to the next page of products.
 * - `handlePreviousPage`: Moves to the previous page of products.
 * - `handleSubmit`: Closes the modal and passes the selected products to the `onSave` callback.
 * 
 * Render:
 * - The component renders a `Modal` containing a `TextField` for searching products, a `Checkbox` for selecting all 
 *   displayed products, a paginated `ResourceList` of products with selection checkboxes, and navigation buttons for 
 *   pagination.
 * 
 * Usage:
 * - This component is intended for use in scenarios where users need to select products from a list, such as adding 
 *   items to a shipping profile or product collection.
 */

import React, { useState, useEffect } from 'react';
import { useFindMany } from '@gadgetinc/react';
import { api } from "../../../api";
import {
  Modal,
  Button,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Checkbox,
  InlineStack,
  TextField,
  Icon,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

const NewModal = ({ isModalOpen, handleModalClose, onSave }) => {
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // Fetch products from the API
  const [{ data, fetching, error }] = useFindMany(api.shopifyProduct, {
    where: { title: { _ilike: `%${searchTerm}%` } },
    select: {
      id: true,
      title: true,
      images: {
        edges: {
          node: {
            source: true
          }
        }
      }
    },
    first: productsPerPage,
    skip: currentPage * productsPerPage,
  });

  console.log(data);


  // Set products when modal is opened or when currentPage is changed
  useEffect(() => {
    if (isModalOpen && data) {
      setDisplayedProducts(data);
    }
  }, [isModalOpen, data, currentPage]);

  // Handle the search term change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    if (newSelectAll) {
      const allProductIds = displayedProducts.map((product) => product.id);
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts([]);
    }
  }

  const handleProductSelection = (product, isChecked) => {
    if (!isChecked && selectAll) {
      setSelectAll(false);  // Unset the "Select All" if any product is deselected
    }
    const newSelectedProducts = isChecked
      ? [...selectedProducts, product]  // Add the full product object
      : selectedProducts.filter(p => p.id !== product.id);  // Remove the product by matching ID
    setSelectedProducts(newSelectedProducts);
  };


  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleSubmit = () => {
    handleModalClose();
    onSave(selectedProducts);
  };

  return (
    <Modal
      open={isModalOpen}
      onClose={handleModalClose}
      title="Select products"
      primaryAction={{
        content: 'Done',
        onAction: handleSubmit,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: handleModalClose,
        },
      ]}
    >
      <Modal.Section>
        <TextField
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search products"
          prefix={<Icon source={SearchIcon} color="inkLighter" />}
        />
        <Checkbox
          label="Select displayed items"
          checked={selectAll}
          onChange={toggleSelectAll}
        />
        {fetching ? (
          <div>Loading...</div>
        ) : (
          <ResourceList
            resourceName={{ singular: 'product', plural: 'products' }}
            items={displayedProducts}
            renderItem={(item) => {
              const { id, title, images } = item; // Replace with actual product properties
              const isChecked = selectedProducts.includes(id);

              return (
                <ResourceItem id={id}>
                  <InlineStack alignment="center">
                    <Thumbnail
                      source={images.edges[0]?.node?.source} // Replace with actual image source
                      alt={`Image of ${title}`}
                      size="small"
                    />
                    <Checkbox
                      checked={selectedProducts.some(p => p.id === item.id)}
                      onChange={(newChecked) => handleProductSelection(item, newChecked)}
                    />

                    <span>{title}</span> {/* Replace with actual title */}
                  </InlineStack>
                </ResourceItem>
              );
            }}
          />
        )}
        <InlineStack distribution="equalSpacing">
          <Button onClick={handlePreviousPage} disabled={currentPage === 0}>
            Previous
          </Button>
          <Button onClick={handleNextPage} disabled={!data || data.length < productsPerPage}>
            Next
          </Button>
        </InlineStack>
      </Modal.Section>
    </Modal>
  );
};

export default NewModal;
