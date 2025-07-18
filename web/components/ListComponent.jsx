/**
 * ListComponent
 * 
 * This component renders a list using Shopify's Polaris `List` component. Each list item can include a title and an optional description.
 * The list is displayed with bullet points by default.
 * 
 * @param {array} listData - An array of objects representing the list items. Each object should contain:
 *   - {string} title: The main text of the list item.
 *   - {string} [description]: An optional description or additional content to be displayed alongside the title.
 * 
 * @returns {JSX.Element} A bullet-point list where each item can have a title and an optional description.
 */

import { List, Text } from '@shopify/polaris';

const ListComponent = ({ listData }) => {
  return (
    <List type="bullet">
      {listData.map((item, index) => (
        <List.Item key={index}>
          <Text variant="bodyMd" as="span">{item.title}</Text>
          {item.description && item.description}
        </List.Item>
      ))}
    </List>
  );
}

export default ListComponent;