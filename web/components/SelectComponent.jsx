/**
 * SelectComponent
 * 
 * This component renders a dropdown select input using Shopify's Polaris `Select` component. It allows users to choose an option 
 * from a list of provided options, and it handles changes by updating the internal state and triggering a callback function.
 * 
 * @param {string} selectLabel - The label displayed above the select dropdown.
 * @param {array} selectOptions - An array of options to display in the dropdown. Each option should be an object with `label` and `value` properties.
 * @param {string} selectPlaceHolder - The placeholder text displayed in the select dropdown before an option is selected.
 * @param {string} fieldName - The name of the field, which is passed along with the selected value in the onValueChange callback.
 * @param {function} onValueChange - Callback function that is triggered when the selected value changes. It receives an object with `name` (the fieldName) and `value` (the selected value).
 * @param {string} [selectValue] - The initial value of the select dropdown. (Currently not in use in this implementation)
 * @param {string} [selectError] - An optional error message to display if there is a validation error.
 * @param {boolean} [selectDisabled=false] - An optional boolean to disable the select dropdown.
 * 
 * @returns {JSX.Element} A select dropdown component with customizable options, label, and error handling.
 */

import { Select } from "@shopify/polaris";
import { useState, useCallback } from "react";

const SelectComponent = ({
  selectLabel,
  selectOptions,
  selectPlaceHolder,
  fieldName,
  onValueChange,
  selectValue,
  selectError,
  selectDisabled,
}) => {
  const [selected, setSelected] = useState('');

  // Handle changes in the select dropdown
  const handleSelectChange = useCallback(
    (value) => {
      setSelected(value);
      onValueChange({
        name: fieldName,
        value: value,
      });
    },
    [onValueChange, fieldName]
  );

  return (
    <Select
      label={selectLabel}
      placeholder={selectPlaceHolder}
      options={selectOptions}
      onChange={handleSelectChange}
      value={selected}
      error={selectError}
      disabled={selectDisabled}
    />
  );
};

export default SelectComponent;