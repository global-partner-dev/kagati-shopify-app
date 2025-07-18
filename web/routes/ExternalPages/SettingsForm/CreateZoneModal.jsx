/**
 * CreateZoneModal Component
 * 
 * This component provides a modal interface for creating a new shipping zone. Users can input a zone name, search for 
 * countries, and select countries and their provinces to include in the shipping zone. 
 * 
 * Props:
 * - `active` (boolean): Controls whether the modal is open or closed.
 * - `countriesData` (array): List of countries and their provinces available for selection.
 * - `handleSave` (function): Callback function to handle saving the selected zone data.
 * - `handleCancel` (function): Callback function to close the modal without saving.
 * 
 * State:
 * - `zoneName` (string): The name of the shipping zone being created.
 * - `selectedCountries` (object): An object where each key is a country name, and the value is an array of selected provinces.
 * - `openProvinces` (object): An object tracking which countries have their provinces list expanded.
 * - `searchTerm` (string): The term used to filter the list of countries.
 * 
 * Handlers:
 * - `handleZoneNameChange`: Updates the `zoneName` state when the zone name is changed.
 * - `handleSearchChange`: Updates the `searchTerm` state to filter the countries list.
 * - `toggleCountrySelection`: Toggles the selection of an entire country. If a country is selected, all its provinces are included.
 * - `toggleProvinceSelection`: Toggles the selection of individual provinces within a selected country.
 * - `toggleProvincesList`: Expands or collapses the list of provinces for a country.
 * - `handleSubmit`: Formats and submits the selected zone data to the `handleSave` callback and then closes the modal.
 * 
 * Render:
 * - The component renders a list of countries, each with a checkbox for selection. Countries with provinces also 
 *   display a toggle to show or hide the provinces, which can be individually selected.
 * - A search field allows users to filter the countries by name.
 * - The list of countries is scrollable to accommodate large datasets.
 * 
 * Usage:
 * - This component is used to create and configure shipping zones in a delivery or shipping management context.
 * - The modal can be triggered from a parent component, and once the user completes the zone creation, the data is passed 
 *   back to the parent via the `handleSave` callback.
 */

import React, { useState } from 'react';
import { Modal, FormLayout, TextField, Checkbox, Button, Text, Collapsible, Card, Scrollable, Icon } from '@shopify/polaris';
import { ChevronDownIcon, ChevronUpIcon } from '@shopify/polaris-icons';

function CreateZoneModal({ active, countriesData, handleSave, handleCancel }) {
  const [zoneName, setZoneName] = useState('');
  const [selectedCountries, setSelectedCountries] = useState({});
  const [openProvinces, setOpenProvinces] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleZoneNameChange = (value) => setZoneName(value);
  const handleSearchChange = (value) => setSearchTerm(value.trim());

  const toggleCountrySelection = (countryName) => {
    setSelectedCountries(prevCountries => ({
      ...prevCountries,
      [countryName]: !prevCountries[countryName] ? [] : undefined
    }));
  };

  const toggleProvinceSelection = (countryName, provinceName) => {
    setSelectedCountries(prevCountries => {
        // Initialize the array if it does not exist
        const existingProvinces = prevCountries[countryName] || [];
        return {
            ...prevCountries,
            [countryName]: existingProvinces.includes(provinceName)
                ? existingProvinces.filter(name => name !== provinceName)
                : [...existingProvinces, provinceName]
        };
    });
};


  const toggleProvincesList = (countryName) => {
    setOpenProvinces(prevProvinces => ({
      ...prevProvinces,
      [countryName]: !prevProvinces[countryName]
    }));
  };

  const handleSubmit = () => {
    const formattedData = Object.entries(selectedCountries).reduce((acc, [country, provinces]) => {
      if (provinces.length) {
        acc.push({ country, provinces });
      }
      return acc;
    }, []);

    handleSave({ zoneName, countries: formattedData });
    handleCancel();
  };

  const filteredCountries = searchTerm
    ? countriesData.filter(country => country.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : countriesData;

    const renderCountries = () => filteredCountries.map(country => (
      <div key={country.name} >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
          <Checkbox
            label={country.name}
            checked={!!selectedCountries[country.name]}
            onChange={() => toggleCountrySelection(country.name)}
          />
          <a href='#' style={{ textDecoration: "none" }} onClick={(e) => {
            e.preventDefault();
            toggleProvincesList(country.name);
          }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {country.provinces.length} provinces
              <Icon source={openProvinces[country.name] ? ChevronUpIcon : ChevronDownIcon} />
            </div>
          </a>
        </div>
        <Collapsible
          open={!!openProvinces[country.name]}
          transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
        >
          <div style={{ paddingLeft: '36px' }}>
            {country.provinces.map((province,index) => (
              <div key={index}>
              <Checkbox
                key={province.id}
                label={province.name}
                checked={selectedCountries[country.name]?.includes(province.name)}
                onChange={() => toggleProvinceSelection(country.name, province.name)}
              />
              </div>
            ))}
          </div>
        </Collapsible>
      </div>
    ));

  return (
    <Modal
      open={active}
      onClose={handleCancel}
      title="Create new shipping zone"
      primaryAction={{
        content: 'Done',
        onAction: handleSubmit,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: handleCancel,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <TextField
            label="Zone name"
            value={zoneName}
            onChange={handleZoneNameChange}
            helpText="Customers won’t see this."
          />
          <TextField
            label="Search countries"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search countries and regions by name or code"
            clearButton
            onClearButtonClick={() => setSearchTerm('')}
          />
          <Scrollable style={{ height: '400px' }}>
            {renderCountries()}
          </Scrollable>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}

export default CreateZoneModal;
