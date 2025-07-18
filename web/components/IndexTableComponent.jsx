/**
 * IndexTableComponent
 * 
 * This component renders an editable table using Shopify's Polaris IndexTable. It allows users to manage and edit a list of product variants,
 * including their prices, inventory quantities, and SKUs. The component synchronizes changes with the parent component through callback functions.
 * 
 * @param {array} data - The initial array of product variant objects to display in the table. Each object should contain `id`, `option1`, `option2`, `option3`, `price`, `inventory_quantity`, and `sku` fields.
 * @param {function} setVariants - Callback function to update the list of variants in the parent component.
 * @param {function} handleValues - Callback function to handle changes in the variant values. It receives an object with `name` and `value` properties.
 * @param {function} convertVariants - Function to convert the updated variant data into the desired format before passing it to `handleValues`.
 * 
 * @returns {JSX.Element} An IndexTable wrapped in a Polaris Card, allowing for the display and editing of product variant data.
 */

import React, { useEffect, useState } from 'react';
import {
    IndexTable,
    Card,
    Text,
    InlineStack,
    Box,
    TextField,
    Thumbnail,
} from '@shopify/polaris';

function IndexTableComponent({ data, setVariants, handleValues, convertVariants }) {
    const [items, setItems] = useState(data);

    // Define the resource name for the IndexTable
    const resourceName = {
        singular: 'item',
        plural: 'items',
    };

    // Handle changes in the price field for a specific variant
    const handlePriceChange = (index, newPrice) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], price: newPrice };
        setItems(updatedItems);
        setVariants(updatedItems);
        handleValues({ name: "variants", value: convertVariants(updatedItems) });
    };

    // Handle changes in the inventory quantity field for a specific variant
    const handleInventoryQuantityChange = (index, inventoryQuantity) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], inventory_quantity: inventoryQuantity };
        setItems(updatedItems);
        setVariants(updatedItems);
        handleValues({ name: "variants", value: convertVariants(updatedItems) });
    };

    // Handle changes in the SKU field for a specific variant
    const handleSkuChange = (index, newSku) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], sku: newSku };
        setItems(updatedItems);
        setVariants(updatedItems);
        handleValues({ name: "variants", value: convertVariants(updatedItems) });
    };

    // Generate the markup for each row in the IndexTable
    const rowMarkup = items?.map(
        (
            { id, option1, option2, option3, price, inventory_quantity, sku },
            index,
        ) => {
            let displayText = option1;
            if (option2) {
                displayText += ` / ${option2}`;
            }
            if (option3) {
                displayText += ` / ${option3}`;
            }
            return (
                <IndexTable.Row
                    id={id}
                    key={id}
                    position={index}
                >
                    <IndexTable.Cell>
                        <Box width="150">
                            <InlineStack>
                                <Thumbnail
                                    source="https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
                                    alt="Black choker necklace"
                                    size="small"
                                />
                                <Box as="span" paddingBlock="400" paddingInlineStart="400">
                                    <Text as="span" variant="bodyMd" fontWeight="semibold" alignment="center">
                                        {displayText}
                                    </Text>
                                </Box>
                            </InlineStack>
                        </Box>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        <TextField
                            prefix="₹"
                            placeholder="0.00"
                            value={price || ''}
                            onChange={(value) => handlePriceChange(index, value)}
                        />
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        <TextField
                            placeholder="0"
                            value={inventory_quantity || ''}
                            onChange={(value) => handleInventoryQuantityChange(index, value)}
                        />
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        <TextField
                            placeholder="0000"
                            value={sku || ''}
                            onChange={(value) => handleSkuChange(index, value)}
                        />
                    </IndexTable.Cell>
                </IndexTable.Row>
            );
        },
    );

    // Update the items state when the data prop changes
    useEffect(() => {
        if (data) {
            setItems(data);
        }
    }, [data]);

    // Update the variants and handleValues when the items state changes
    useEffect(() => {
        if (items) {
            setVariants(items);
            handleValues({ name: "variants", value: convertVariants(items) });
        }
    }, [items, setVariants, handleValues, convertVariants]);

    return (
        <>
            {items.length ? (
                <Card>
                    <IndexTable
                        resourceName={resourceName}
                        itemCount={items.length}
                        headings={[
                            { title: 'Variant' },
                            { title: 'Price' },
                            { title: 'Available' },
                            { title: 'SKU' },
                        ]}
                        selectable={false}
                    >
                        {rowMarkup}
                    </IndexTable>
                </Card>
            ) : null}
        </>
    );
}

export default IndexTableComponent;