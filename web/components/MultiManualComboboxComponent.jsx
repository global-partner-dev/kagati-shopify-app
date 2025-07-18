/**
 * MultiManualComboboxComponent
 * 
 * This component provides a multi-select combobox functionality using Shopify's Polaris library. It allows users to select multiple options 
 * from a dropdown list and displays the selected options as removable tags. The combobox dynamically filters available options based on user input.
 * 
 * @param {string} fieldName - The name of the field associated with this combobox, used for identification in form handling.
 * @param {string} placeHolder - The placeholder text displayed in the combobox when no option is selected.
 * @param {array} chooses - An array of available options for the user to select from. Each option should be an object containing `label` and `value` properties.
 * @param {function} onValueChange - Callback function that is triggered when the selection changes. It receives an object with `name` (the fieldName) and `value` (the array of selected options).
 * 
 * @returns {JSX.Element} A multi-select combobox component with tag display for selected items and dynamic filtering of options.
 */

import {
  Tag,
  Listbox,
  Combobox,
  InlineStack,
  AutoSelection,
  Box,
} from "@shopify/polaris";
import { useState, useCallback, useMemo } from "react";

function MultiManualComboboxComponent({
  fieldName,
  placeHolder,
  chooses,
  onValueChange,
}) {
  // Memoize the deselected options to avoid unnecessary re-renders
  const deselectedOptions = useMemo(() => chooses, [chooses]);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  // Update the displayed options based on the input value
  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex)
      );
      setOptions(resultOptions);
    },
    [deselectedOptions]
  );

  // Update the selected options when a user selects or deselects an option
  const updateSelection = useCallback(
    (selected) => {
      const updatedSelectedOptions = selectedOptions.includes(selected)
        ? selectedOptions.filter((option) => option !== selected)
        : [...selectedOptions, selected];

      setSelectedOptions(updatedSelectedOptions);
      onValueChange({
        name: fieldName,
        value: updatedSelectedOptions,
      });
      updateText("");
    },
    [selectedOptions, onValueChange, updateText, fieldName]
  );

  // Remove a tag from the selected options
  const removeTag = useCallback(
    (tag) => () => {
      const updatedSelectedOptions = selectedOptions.filter(
        (option) => option !== tag
      );
      setSelectedOptions(updatedSelectedOptions);
      onValueChange({
        name: fieldName,
        value: updatedSelectedOptions,
      });
    },
    [selectedOptions, onValueChange, fieldName]
  );

  // Generate markup for each selected option as a tag
  const tagsMarkup = selectedOptions.map((option) => (
    <Tag key={`option-${option}`} onRemove={removeTag(option)}>
      {option}
    </Tag>
  ));

  // Generate markup for the options in the Listbox
  const optionsMarkup =
    options && options.length > 0
      ? options.map((option) => {
          const { label, value } = option;

          return (
            <Listbox.Option
              key={`${value}`}
              value={value}
              selected={selectedOptions.includes(value)}
              accessibilityLabel={label}
            >
              {label}
            </Listbox.Option>
          );
        })
      : null;

  return (
    <Box>
      <Box style={{ marginBottom: "10px" }}>
        <Combobox
          allowMultiple
          activator={
            <Combobox.TextField
              onChange={updateText}
              labelHidden
              value={inputValue}
              placeholder={placeHolder}
              autoComplete="off"
            />
          }
        >
          {optionsMarkup ? (
            <Listbox
              autoSelection={AutoSelection.None}
              onSelect={updateSelection}
            >
              {optionsMarkup}
            </Listbox>
          ) : null}
        </Combobox>
      </Box>
      <Box style={{ marginTop: "10px" }}>
        <InlineStack gap="200">{tagsMarkup}</InlineStack>
      </Box>
    </Box>
  );
}

export default MultiManualComboboxComponent;