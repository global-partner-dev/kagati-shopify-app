/**
 * ButtonComponent
 * 
 * This component is a customizable button built using Shopify's Polaris library. 
 * It allows for various styles and behaviors to be applied, including different variants, sizes, tones, icons, and alignment. 
 * The button also supports loading states and custom click handling.
 * 
 * @param {string} buttonTitle - The text displayed on the button.
 * @param {string} [buttonVariant] - The visual style of the button (e.g., "primary", "secondary").
 * @param {string} [buttonAlign] - The alignment of the button's text (e.g., "left", "center", "right").
 * @param {ReactNode} [buttonIcon] - An optional icon to be displayed within the button.
 * @param {string} [buttonSize] - The size of the button (e.g., "small", "medium", "large").
 * @param {string} [buttonTone] - The tone of the button, which can affect its color and style.
 * @param {function} [buttonOnClick] - Callback function to be executed when the button is clicked.
 * @param {boolean} [buttonLoading=false] - Boolean value indicating whether the button should display a loading state.
 * @param {ReactNode} [children] - Any additional content or elements to be displayed inside the button, alongside the title.
 * 
 * @returns {JSX.Element} A customizable button component.
 */

import { Button } from "@shopify/polaris";

const ButtonComponent = ({
  buttonTitle,
  buttonVariant,
  buttonAlign,
  buttonIcon,
  buttonSize,
  buttonTone,
  buttonOnClick,
  buttonLoading,
  children,
}) => {
  return (
    <Button
      variant={buttonVariant}
      textalign={buttonAlign}
      tone={buttonTone}
      icon={buttonIcon}
      size={buttonSize}
      loading={buttonLoading}
      onClick={buttonOnClick}
    >
      {buttonTitle} {children}
    </Button>
  );
};

export default ButtonComponent;