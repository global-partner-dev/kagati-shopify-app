/**
 * ToolTipComponent
 * 
 * This component renders a tooltip using Shopify's Polaris `Tooltip` component. The tooltip displays a list of order details, including order reference IDs, split IDs, store names, and order statuses. Each order item in the tooltip can be clicked to navigate to a detailed view of the order split.
 * 
 * @param {string} toolTipName - The text content that triggers the tooltip when hovered over.
 * @param {array} toolTipValues - An array of objects containing order details. Each object should have:
 *   - {string} orderReferenceId: The reference ID of the order.
 *   - {string} splitId: The split ID of the order.
 *   - {string} storeName: The name of the store associated with the order.
 *   - {string} orderStatus: The status of the order.
 * @param {array} statusOptions - An array of objects defining the possible order statuses and their display labels. Each object should have:
 *   - {string} value: The status value.
 *   - {string} label: The display label for the status.
 * 
 * @returns {JSX.Element} A tooltip component that displays order information and allows navigation to order details.
 */

import React from 'react';
import { Tooltip, InlineStack, Text, Box, Button, Badge } from '@shopify/polaris';

const ToolTipComponent = ({ toolTipName, toolTipValues, statusOptions }) => {
    return (
        <Box>
            <Tooltip
                content={
                    toolTipValues.map(({ orderReferenceId, splitId, storeName, orderStatus }, index) => (
                        <Box 
                            key={index} 
                            paddingBlockStart="200" 
                            onClick={() => navigate(`/orders/split/${orderReferenceId}/${splitId}`)}
                        >
                            <InlineStack gap="200">
                                <Button variant="plain" onClick={() => navigate(`/orders/split/${orderReferenceId}`)}>
                                    {splitId}
                                </Button>
                                <Badge tone="attention">{storeName}</Badge>
                                <Badge
                                    tone={
                                        orderStatus === "confirm" ? "info" 
                                        : orderStatus === "ready_for_pickup" || orderStatus === "out_for_delivery" ? "warning" 
                                        : orderStatus === "delivered" ? "success" 
                                        : orderStatus === "on_hold" || orderStatus === "cancel" ? "critical" 
                                        : ""
                                    }
                                >
                                    {statusOptions.find((option) => option.value === orderStatus)?.label}
                                </Badge>
                            </InlineStack>
                        </Box>
                    ))
                }
                preferredPosition="below"
                width="max-content"
            >
                <Text as="span" variant="bodyMd">
                    {toolTipName}
                </Text>
            </Tooltip>
        </Box>
    );
}

export default ToolTipComponent;