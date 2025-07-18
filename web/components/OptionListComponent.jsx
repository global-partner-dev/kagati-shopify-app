/**
 * OptionListComponent
 * 
 * This component provides a dropdown selection using Shopify's Polaris `Popover` and `OptionList` components. 
 * It allows users to select an option from a list of locations, with the selected option displayed in the button that activates the dropdown.
 * 
 * @param {array} locations - An array of location objects, each containing:
 *   - {string} label: The display name of the location.
 *   - {string} value: The unique identifier for the location.
 * @param {function} onValueChange - Callback function that is triggered when a new location is selected. It receives the selected value as its argument.
 * 
 * @returns {JSX.Element} A component that renders a button with a dropdown list of selectable options.
 */

import { Button, Popover, OptionList, Text } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';


const OptionListComponent = ({ locations, selectedLocation,onValueChange }) => {

  console.log(locations,selectedLocation,locations.findIndex((e) => String(e.value ) === String(selectedLocation)))
  const [selected, setSelected] = useState(() => {
    if (locations.length > 0 && selectedLocation) {
      const matchedIndex = locations.findIndex((e) => String(e.value) === String(selectedLocation));
      return matchedIndex != -1
        ? [locations[matchedIndex].value] // Use the matched location's value
        : [locations[0].value];          // Fallback to the first location's value
    }
    return locations.length > 0 ? [locations[0].value] : ''; // Fallback for empty locations
  });
  const [popoverActive, setPopoverActive] = useState(false);
  // Toggles the visibility of the popover
  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  // The button that activates the popover
  const activator = (
    <Button onClick={togglePopoverActive} disclosure>
      <Text variant="headingLg" as="h5">
        {selected.length && selected[0] !== '' ? locations.find((e) => e.value === selected[0]).label : "All locations"}
      </Text>
    </Button>
  );

  // Sets the default selected location when locations prop changes
  useEffect(() => {
    if (locations.length > 0 && selected.length === 0) {
      const matchedIndex = locations.findIndex((e) => String(e.value) === String(selectedLocation));
      if (matchedIndex !== -1) {
        setSelected([locations[matchedIndex].value]);
      } else {
        setSelected([locations[0].value]);
      }
      
    }
  }, [locations,selectedLocation,selected]);

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopoverActive}
    >
      <OptionList
        onChange={(value) => {
          setSelected(value);
          onValueChange(value);
        }}
        options={locations}
        selected={selected}
      />
    </Popover>
  );
}

export default OptionListComponent;