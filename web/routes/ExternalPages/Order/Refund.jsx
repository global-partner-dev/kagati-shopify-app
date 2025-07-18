/**
 * RefundOrderPage Component
 *
 * This component provides a user interface for processing refunds on specific orders within a Shopify store.
 * It allows the user to select the items to be refunded, specify quantities, view a summary of the refund details,
 * and initiate the refund process with optional restocking and customer notification settings.
 *
 * Features:
 * - Fetches and displays order details including line items, their quantities, prices, and tax information.
 * - Allows users to input the quantity of each item to be refunded.
 * - Automatically calculates the total refund amount, including taxes.
 * - Provides options to restock refunded items and notify the customer via email.
 * - Includes a field to specify a reason for the refund, visible only to staff members.
 * - Displays a summary of the refund, including item subtotal, taxes, and total refund amount.
 * - Handles form validation, ensuring that a reason for refund is provided before processing the refund.
 *
 * Usage:
 *
 * <RefundOrderPage />
 *
 * Dependencies:
 * - React hooks (useState, useEffect, useCallback)
 * - Polaris components from Shopify (Page, Card, Button, TextField, Checkbox, etc.)
 * - Gadget API for fetching order data
 *
 * Props:
 * - No props are required. The component fetches the order data based on the order ID from the URL parameters.
 *
 * Example:
 * ```
 * <RefundOrderPage />
 * ```
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, InlineGrid, BlockStack, InlineStack, Card, Button, Icon, Link, Box, Text, Divider, Thumbnail, TextField, Badge, Checkbox } from "@shopify/polaris";
import { NoteIcon, CartAbandonedIcon } from "@shopify/polaris-icons";
import { useFindOne } from "@gadgetinc/react";
import { api } from "../../../api";

const RefundOrderPage = () => {
    let { id } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState();
    const [refundQuantities, setRefundQuantities] = useState({});
    const [refundAmount, setRefundAmount] = useState(0);
    const [refundTax, setRefundTax] = useState(0);
    const [restockItem, setRestockItem] = useState(true);
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [reasonForRefundValue, setReasonForRefundValue] = useState('');
    const [reasonForRefundError, setReasonForRefundError] = useState('');

    const handleReasonForRefundChange = useCallback((value) => {
        setReasonForRefundValue(value);
        setReasonForRefundError(''); // Clear error when user starts typing
    }, []);

    const [{ data, fetching, error }] = useFindOne(api.shopifyOrder, id, {
        select: {
            id: true,
            name: true,
            currentTotalPrice: true,
            lineItems: {
                edges: {
                    node: {
                        id: true,
                        title: true,
                        quantity: true,
                        sku: true,
                        price: true,
                        taxLines: true,
                        product: {
                            images: {
                                edges: {
                                    node: {
                                        source: true,
                                    },
                                },
                            },
                        }
                    },
                },
            },
        },
    });

    useEffect(() => {
        if (data) {
            setOrderData(data);
            const initialRefundQuantities = {};
            data.lineItems.edges.forEach(item => {
                initialRefundQuantities[item.node.id] = 0;
            });
            setRefundQuantities(initialRefundQuantities);
        }
    }, [data]);

    const handleQuantityChange = (id, value) => {
        const newRefundQuantities = { ...refundQuantities, [id]: value };
        setRefundQuantities(newRefundQuantities);
        calculateRefundAmount(newRefundQuantities);
    };

    const calculateRefundAmount = (quantities) => {
        let total = 0;
        let totalTax = 0;
        let totalQuantity = 0;

        orderData.lineItems.edges.forEach(item => {
            total += item.node.price * (quantities[item.node.id] || 0);
            totalTax += (item.node.taxLines[0].price / item.node.quantity) * (quantities[item.node.id] || 0);
            totalQuantity += quantities[item.node.id] || 0;
        });

        setRefundAmount(total);
        setRefundTax(totalTax);
    };

    const hasRefundableItems = () => {
        return Object.values(refundQuantities).some(quantity => quantity > 0);
    };

    const handleRefund = () => {
        if (!reasonForRefundValue) {
            setReasonForRefundError('Reason for refund is required');
        } else {
            // Process the refund logic here
            // For example, make an API call to process the refund
        }
    };

    return (
        <Box paddingBlockEnd="400">
            <Page
                compactTitle
                title="Refund"
                subtitle={orderData && orderData.name}
                backAction={{ content: "Orders", onAction: () => navigate(-1) }}
            >
                <InlineGrid columns={{ xs: 1, md: "2.75fr 1.25fr" }} gap="400">
                    <BlockStack gap="400">
                        <Card roundedAbove="sm">
                            <Box paddingBlockEnd="400">
                                <InlineStack align="space-between">
                                    <Badge tone="attention">
                                        <InlineStack align="start">
                                            <Icon source={CartAbandonedIcon} />
                                            Unfulfilled
                                        </InlineStack>
                                    </Badge>
                                    <Text variant="bodySm" as="p">Shop location</Text>
                                </InlineStack>
                            </Box>
                            {orderData && orderData.lineItems?.edges?.map((item) => (
                                <Box borderColor="border" borderWidth="025" padding="300" borderRadius="200" key={item.node.id}>
                                    <InlineStack align="space-between" blockAlign="center">
                                        <InlineStack align="start">
                                            <Thumbnail
                                                source={item?.node?.product?.images.edges.length ? item?.node?.product?.images.edges[0]?.node?.source : NoteIcon}
                                                alt="Black choker necklace"
                                                size="small"
                                                position="top"
                                            />
                                            <Box as="span" paddingInlineStart="400" width="300">
                                                <Link url="#" removeUnderline>
                                                    <Text as="span" variant="bodyMd" fontWeight="semibold" alignment="start">
                                                        {item?.node?.title}
                                                    </Text>
                                                </Link>
                                                <Text as="span" variant="bodyMd" alignment="start">
                                                    {item?.node?.sku}
                                                </Text>
                                                <Text as="span" variant="bodyMd" alignment="start">
                                                    ₹{item?.node?.price}
                                                </Text>
                                            </Box>
                                        </InlineStack>
                                        <InlineStack gap="800">
                                            <Box width="100">
                                                <TextField
                                                    type="number"
                                                    min={0}
                                                    max={item?.node?.quantity}
                                                    suffix={`/ ${item?.node?.quantity}`}
                                                    value={refundQuantities[item.node.id]}
                                                    onChange={(value) => handleQuantityChange(item.node.id, parseInt(value))}
                                                    autoComplete="off"
                                                />
                                            </Box>
                                            <Box width="80">
                                                <Text
                                                    as="span"
                                                    variant="bodyMd"
                                                    alignment="end"
                                                    numeric
                                                >
                                                    ₹{(item?.node?.price * (refundQuantities[item.node.id])).toFixed(2)}
                                                </Text>
                                            </Box>
                                        </InlineStack>
                                    </InlineStack>
                                </Box>
                            ))}
                            <Box paddingBlock="400">
                                <Text variant="bodyMd" as="span" tone="subdued">
                                    Refunded items will be removed from the order.
                                </Text>
                            </Box>
                            {hasRefundableItems() && (
                                <>
                                    <Divider />
                                    <Box paddingBlockStart="200">
                                        <Checkbox
                                            label="Restock item"
                                            checked={restockItem}
                                            onChange={(value) => setRestockItem(value)}
                                        />
                                    </Box>
                                </>
                            )}
                        </Card>
                        <Card roundedAbove="sm">
                            <Text variant="headingMd" as="h6">
                                Reason for refund
                            </Text>
                            <Box paddingBlock="200">
                                <TextField
                                    value={reasonForRefundValue}
                                    onChange={handleReasonForRefundChange}
                                    error={reasonForRefundError}
                                    autoComplete="off"
                                />
                            </Box>
                            <Text variant="bodyMd" as="span" tone="subdued">
                                Only you and other staff can see this reason.
                            </Text>
                        </Card>
                    </BlockStack>
                    <BlockStack gap="400">
                        <Card roundedAbove="sm">
                            <Text variant="headingMd" as="h6">
                                Summary
                            </Text>
                            {hasRefundableItems() ? (
                                <Box paddingBlockEnd="400">
                                    <Box paddingBlockStart="400">
                                        <InlineStack align="space-between">
                                            <Text variant="bodyMd" as="p">Item subtotal ({Object.values(refundQuantities).reduce((a, b) => a + b, 0)})</Text>
                                            <Text variant="bodyMd" as="p">₹{refundAmount.toFixed(2)}</Text>
                                        </InlineStack>
                                    </Box>
                                    <Box paddingBlockStart="400">
                                        <InlineStack align="space-between">
                                            <Text variant="bodyMd" as="p">Taxes</Text>
                                            <Text variant="bodyMd" as="p">₹{refundTax.toFixed(2)}</Text>
                                        </InlineStack>
                                    </Box>
                                    <Box paddingBlockStart="400">
                                        <InlineStack align="space-between">
                                            <Text variant="headingMd" as="h5">Refund total</Text>
                                            <Text variant="headingMd" as="h5">₹{(refundAmount + refundTax).toFixed(2)}</Text>
                                        </InlineStack>
                                    </Box>
                                </Box>
                            ) : (
                                <Box paddingBlockStart="400">
                                    <Text variant="bodyMd" as="span" tone="subdued">
                                        No items selected.
                                    </Text>
                                </Box>
                            )}
                            <Divider />
                            <Box paddingBlock="400">
                                <Text variant="headingMd" as="h6">
                                    Refund amount
                                </Text>
                                <Box paddingBlock="200">
                                    <Text variant="bodySm" as="p">
                                        (For Testing) Bogus Gateway
                                    </Text>
                                </Box>
                                <Text variant="bodySm" as="p">
                                    (•••• •• 1)
                                </Text>
                                <Box paddingBlock="200">
                                    <TextField
                                        prefix="₹"
                                        autoComplete="off"
                                        disabled
                                        value={(refundAmount + refundTax).toFixed(2)}
                                    />
                                </Box>
                                <Text variant="bodyMd" as="span" tone="subdued">
                                    ₹{orderData && orderData.currentTotalPrice} available for refund
                                </Text>
                                <Box paddingBlockStart="200">
                                    <Checkbox
                                        label="Send a notification to the customer"
                                        checked={notifyCustomer}
                                        onChange={(value) => setNotifyCustomer(value)}
                                    />
                                </Box>
                            </Box>
                            <Divider />
                            <Box paddingBlock="400">
                                <Button
                                    fullWidth
                                    variant="primary"
                                    textalign="center"
                                    disabled={refundAmount === 0}
                                    onClick={handleRefund}
                                >
                                    Refund ₹{refundAmount.toFixed(2)}
                                </Button>
                            </Box>
                        </Card>
                    </BlockStack>
                </InlineGrid>
            </Page>
        </Box>
    );
};

export default RefundOrderPage;