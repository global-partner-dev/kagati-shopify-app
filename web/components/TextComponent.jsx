/**
 * TextComponent
 * 
 * This component is a wrapper around Shopify's Polaris `Text` component, providing additional flexibility for displaying styled text. 
 * It allows customization of the text's variant, HTML element type, tone, font weight, and content, making it easy to adapt to different 
 * typography needs within the application.
 * 
 * @param {string} textTitle - The main text content to display. This will be rendered before any children elements.
 * @param {string} textVariant - The variant of the text, which controls the size and style. Possible values include "bodyLg", "bodyMd", "headingLg", etc.
 * @param {string} textAs - The HTML element to render the text as, such as "span", "p", "h1", etc.
 * @param {string} textTone - The color tone of the text, which can be "subdued", "critical", "positive", etc.
 * @param {string} textFontWeight - The weight of the font, such as "regular", "medium", or "bold".
 * @param {ReactNode} children - Additional content or elements to be rendered inside the text component, following the `textTitle`.
 * 
 * @returns {JSX.Element} A customizable text component that supports various typographic styles and additional content.
 */

import { Text } from "@shopify/polaris";

const TextComponent = ({
  textTitle,
  textVariant,
  textAs,
  textTone,
  textFontWeight,
  children,
}) => {
  return (
    <Text
      variant={textVariant}
      as={textAs}
      tone={textTone}
      fontWeight={textFontWeight}
    >
      {textTitle} {children}
    </Text>
  );
};

export default TextComponent;