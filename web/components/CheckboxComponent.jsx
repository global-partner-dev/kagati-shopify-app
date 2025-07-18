/**
 * CheckboxComponent
 * 
 * This component renders a checkbox using Shopify's Polaris library. It includes a label and manages its checked state internally.
 * The component is customizable through props, allowing the initial checked state and label to be specified.
 * 
 * @param {string} checkBoxLabel - The label displayed next to the checkbox.
 * @param {boolean} checkBoxChecked - The initial checked state of the checkbox.
 * 
 * @returns {JSX.Element} A checkbox component with an associated label.
 */

import { Checkbox } from '@shopify/polaris';
import { useState, useCallback } from 'react';

const CheckboxComponent = ({ checkBoxLabel, checkBoxChecked ,handleChange}) => {

  const [checked, setChecked] = useState(checkBoxChecked);
  const onCheckboxChange = useCallback(
    (eventOrValue) => {
      // Check if it's an event object or direct value
      const newChecked =
        typeof eventOrValue === 'boolean' ? eventOrValue : eventOrValue.target.checked;

      setChecked(newChecked); // Update local state
      handleChange(newChecked); // Pass the updated value to the parent
    },
    [handleChange]
  );


  return (
    <Checkbox
      label={checkBoxLabel}
      checked={checked}
      onChange={onCheckboxChange}
    />
  );
}

export default CheckboxComponent;