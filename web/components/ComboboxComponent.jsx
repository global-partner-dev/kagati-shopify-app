/**
 * ComboboxComponent
 * 
 * This component is a customizable combobox built using Shopify's Polaris library. It allows users to search and select an option 
 * from a dropdown list. The component also supports dynamic filtering of options as the user types, and it can display an error state.
 * 
 * @param {string} fieldName - The name of the field associated with this combobox, used for identification in form handling.
 * @param {string} placeHolder - The placeholder text displayed inside the combobox when no option is selected.
 * @param {array} chooses - An array of objects representing the available options to select from. Each object should have a `label` and a `value`.
 * @param {string} [error] - An optional error message to display if there is a validation issue.
 * @param {string} [selectedOptionName] - The initial selected option's value.
 * @param {function} onValueChange - Callback function that is triggered when the selection changes. It receives an object with `name` and `value`.
 * @param {ReactNode} [children] - Optional children to be rendered as a prefix inside the combobox text field.
 * 
 * @returns {JSX.Element} A customizable combobox component.
 */

import { Listbox, Combobox, Box } from "@shopify/polaris";
import { useState, useCallback, useMemo, useEffect } from "react";

const ComboboxComponent = ({
  fieldName,
  placeHolder,
  chooses,
  error,
  selectedOptionName,
  onValueChange,
  children,
}) => {
  // Memoized deselected options to prevent unnecessary re-renders
  const deselectedOptions = useMemo(() => chooses, [chooses]);

  const [selectedOption, setSelectedOption] = useState();
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState();

  // Updates the input value and filters the options based on the input
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

  // Updates the selected option and triggers the onValueChange callback
  const updateSelection = useCallback(
    (selected) => {
      const matchedOption = chooses.find((option) => {
        return option.value.match(selected);
      });
      setSelectedOption(selected);
      onValueChange({
        name: fieldName,
        value: selected,
      });
      setInputValue((matchedOption && matchedOption.label) || "");
    },
    [chooses, onValueChange]
  );

  // Generate the markup for each option in the listbox
  const optionsMarkup =
    options && options.length > 0
      ? options.map((option) => {
        const { label, value } = option;

        return (
          <Listbox.Option
            key={`${value}`}
            value={value}
            selected={selectedOption === value}
            accessibilityLabel={label}
          >
            {label}
          </Listbox.Option>
        );
      })
      : null;

  // Initialize the options list and selected option on mount and when dependencies change
  useEffect(() => {
    setOptions(chooses);
  }, [chooses]);

  useEffect(() => {
    setSelectedOption(selectedOptionName);
    setInputValue((selectedOptionName) || "");
  }, [selectedOptionName]);

  return (
    <Box>
      <Combobox
        activator={
          <Combobox.TextField
            prefix={children}
            onChange={updateText}
            labelHidden
            value={inputValue}
            placeholder={placeHolder}
            autoComplete="off"
            error={error}
          />
        }
      >
        {options && options.length > 0 ? (
          <Listbox onSelect={updateSelection}>{optionsMarkup}</Listbox>
        ) : null}
      </Combobox>
    </Box>
  );
};

export default ComboboxComponent;