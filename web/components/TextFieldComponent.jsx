/**
 * TextFieldComponent
 * 
 * This component is a wrapper around Shopify's Polaris `TextField` component, providing a customizable input field with various options 
 * for label, placeholder, input type, prefix, multiline input, and more. It also manages the input value state internally and communicates 
 * changes back to a parent component through a callback function.
 * 
 * @param {string} textLabel - The label displayed above the text field.
 * @param {string} textPlaceHolder - The placeholder text displayed inside the text field when it is empty.
 * @param {string} textName - The name of the text field, used for form handling and identification.
 * @param {boolean} [textMultiLine=false] - A boolean indicating whether the text field should allow multiple lines of input.
 * @param {string} textType - The type of input, such as "text", "password", "email", etc.
 * @param {ReactNode} [textPrefix] - An optional prefix to display inside the text field, such as a currency symbol.
 * @param {boolean} [textLabelHidden=false] - A boolean to hide the label visually while still making it accessible to screen readers.
 * @param {string} textValue - The initial value of the text field.
 * @param {boolean} [textReadOnly=false] - A boolean indicating whether the text field should be read-only.
 * @param {string} [textAutoComplete="off"] - Specifies whether the browser should enable auto-completion for the text field.
 * @param {string} [textError] - An optional error message to display if the input value is invalid.
 * @param {function} onValueChange - Callback function that is triggered when the value of the text field changes. It receives an object with `name` and `value`.
 * @param {ReactNode} [children] - Additional elements to be connected to the right side of the text field.
 * 
 * @returns {JSX.Element} A customizable text field component with support for various input types, validation, and state management.
 */

import { TextField } from "@shopify/polaris";
import { useState, useCallback } from "react";

const TextFieldComponent = ({
  textLabel,
  textPlaceHolder,
  textName,
  textMultiLine = false,
  textType,
  textPrefix,
  textLabelHidden = false,
  textValue,
  textReadOnly = false,
  textAutoComplete = "off",
  textError,
  onValueChange,
  children,
}) => {
  const [value, setValue] = useState(textValue);

  const handleChange = useCallback(
    (newValue) => {
      setValue(newValue);
      onValueChange && onValueChange({ name: textName, value: newValue });
    },
    [onValueChange, textName]
  );

  return (
    <TextField
      name={textName}
      type={textType}
      prefix={textPrefix}
      label={textLabel}
      value={value}
      placeholder={textPlaceHolder}
      multiline={textMultiLine}
      onChange={handleChange}
      labelHidden={textLabelHidden}
      connectedRight={children}
      readOnly={textReadOnly}
      error={textError}
      autoComplete={textAutoComplete}
    />
  );
};

export default TextFieldComponent;