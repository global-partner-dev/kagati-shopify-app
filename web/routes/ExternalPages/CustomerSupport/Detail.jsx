/**
 * CustomerSupportDetailPage Component
 *
 * This component provides detailed information and management options for a specific customer support order split.
 * It allows users to view and edit order details, manage order status, handle on-hold statuses, and reassign orders
 * to different stores. The component also includes functionalities for processing order transitions (e.g., confirming
 * orders, marking them as ready for pickup, etc.), as well as displaying product and customer details associated with
 * the order.
 *
 * Features:
 * - Display order split details, including status, on-hold status, order items, and financial status.
 * - Allows editing the status and on-hold status of the order split.
 * - Supports reassigning the order to different stores or a backup store.
 * - Displays detailed product information, including product images fetched from Shopify.
 * - Provides customer contact information, shipping, and billing address details.
 * - Allows saving changes to order status and other details.
 *
 * Usage:
 *
 * <CustomerSupportDetailPage />
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, InlineGrid, BlockStack, InlineStack, Card, Link, Box, Text, Badge, Tag, Divider, Thumbnail, Button, Checkbox, ButtonGroup, TextField } from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import TextComponent from "../../../components/TextComponent";
import SpinnerComponent from "../../../components/SpinnerComponent";
import { useFindMany, useGlobalAction } from "@gadgetinc/react";
import { api } from "../../../api";
import { formaterDate, objectEqual } from "../../../util/commonFunctions";
import SelectComponent from "../../../components/SelectComponent";
import ModalComponent from "../../../components/ModalComponent";

const CustomerSupportDetailPage = () => {
    const navigate = useNavigate();
    let { id, splitId } = useParams();
    const [orderData, setOrderData] = useState();
  console.log("split Id ======>", splitId)
  console.log("order datas in customerSupport====>>", orderData)
    const [selectedStatus, setSelectedStatus] = useState();
    const [selectedOnHoldStatus, setSelectedonHoldStatus] = useState('open');
    const [isEditing, setIsEditing] = useState(false);
    const [reAssign, setReAssign] = useState(false);
    const [storeData, setStoreData] = useState([]);
    const [checked, setChecked] = useState(false);
    const [checkedProducts, setCheckedProducts] = useState([]);
    const [changeStores, setChangeStores] = useState([]);
    const [onHoldComment, setOnHoldComment] = useState();
    const [isError, setIsError] = useState({ id: '', status: false });
    const [productImages, setProductImages] = useState({});
    const [showProducts, setShowProducts] = useState(false);
    const [selectStore, setSelectStore] = useState(false);

    const handleChange = useCallback(
        (newChecked) => setChecked(newChecked),
        [],
    );

    const handleOnHoldCommentChange = useCallback(
        (newValue) => setOnHoldComment(newValue),
        [],
    );

    const [{ data: confirmOrderData, fetching: confirmOrderFetching, error: confirmOrderError }, confirmOrder] = useGlobalAction(api.splitOrderConfirm);
    const [{ data: readyForPickupOrderData, fetching: readyForPickupOrderFetching, error: readyForPickupOrderError }, readyForPickupOrder] = useGlobalAction(api.splitOrderReadyForPickup);
    const [{ data: outForDeliveryOrderData, fetching: outForDeliveryOrderFetching, error: outForDeliveryOrderError }, outForDeliveryOrder] = useGlobalAction(api.splitOrderOutForDelivery);
    const [{ data: deliveredOrderData, fetching: deliveredOrderFetching, error: deliveredOrderError }, deliveredOrder] = useGlobalAction(api.splitOrderDelivered);
    const [{ data: onHoldOrderData, fetching: onHoldOrderFetching, error: onHoldOrderError }, onHoldOrder] = useGlobalAction(api.splitOrderOnHold);
    const [{ data: cancelOrderData, fetching: cancelOrderFetching, error: cancelOrderError }, cancelOrder] = useGlobalAction(api.splitOrderCancel);
    const [{ data: onHoldStatusData, fetching: onHoldStatusFetching, error: onHoldStatusError }, onHoldStatusHandle] = useGlobalAction(api.splitOrderOnHoldStatus);

    const handleReAssignClose = () => {
        setReAssign(false);
    };

    const [{ data, fetching, error }] = useFindMany(api.khagatiOrder, {
        select: {
            id: true,
            name: true,
            orderNumber: true,
            email: true,
            phone: true,
            note: true,
            createdAt: true,
            currency: true,
            currentSubtotalPrice: true,
            currentTotalTax: true,
            currentTotalPrice: true,
            taxLines: true,
            billingAddress: true,
            shippingAddress: true,
            tags: true,
            financialStatus: true,
            fulfillmentStatus: true,
            shopifyCreatedAt: true,
            customer: true,
            lineItems: true,
            noteAttributes: true,
        },
        filter: {
            orderId: { equals: id },
        },
    });
console.log("khagatiOrder in customer support----->", data)
    const [{ data: splits, fetching: splitFetching, error: splitError }] = useFindMany(api.khagatiOrderSplit, {
        select: {
            id: true,
            orderNumber: true,
            orderReferenceId: true,
            splitId: true,
            storeCode: true,
            storeName: true,
            orderStatus: true,
            onHoldStatus: true,
            onHoldComment: true,
            reAssignStatus: true,
            lineItems: true,
        },
        filter: {
            id: { equals: splitId },
        },
    });

    const [{ data: stores, fetching: storesFetching, error: storesError }] = useFindMany(api.khagatiStores, {
        select: {
            erpStoreId: true,
            storeCode: true,
            storeName: true,
            isBackupWarehouse: true,
        },
        filter: {
            status: { in: ["Active"] }
        }
    })

    const fetchStockData = async (item) => {
        let response;
        try {
            response = await api.khagatiOnlineHybridStock.findMany({
                select: {
                    outletId: true,
                    hybridStock: true,
                    primaryStock: true,
                    backUpStock: true,
                    sku: true,
                },
                filter: {
                    sku: { equals: item.sku },
                    productId: { equals: String(item.product) },
                    primaryStock: { greaterThanOrEqual: item.quantity },
                },
            });
        } catch (error) {
            // setIsError(true);
            return;
        }
        if (!response.length) {
            setIsError({ id: item.id, status: true });
            return;
        }
        const storeLists = await api.khagatiStores.findMany({
            select: {
                erpStoreId: true,
                storeCode: true,
                storeName: true,
                isBackupWarehouse: true,
            },
            filter: {
                status: { in: ["Active"] }
            }
        })
        const storeData = response.map((stock) => {
            const findStore = storeLists.find((store) => store.erpStoreId == stock.outletId);
            if (findStore) {
                return {
                    label: `${findStore.storeName} (${stock.primaryStock})`,
                    value: `${item.id}_${findStore.storeCode}_${stock.outletId}_${item.sku}_${item.quantity}`,
                };
            }
            return null;
        }).filter(item => item !== null);
        setStoreData(prev => [...prev, ...storeData]);
    }

    let statusOptions = [];
    let onHoldStatusOptions = [];
    let statusSelected = ''
    let onHoldStatusSelected = ''

    if (splits && splits[0].orderStatus === 'new') {
        statusSelected = 'New';
        statusOptions = [
            { label: "Confirm", value: "confirm" },
            { label: "On Hold", value: "on_hold" },
            { label: "Cancel", value: "cancel" },
        ]
    } else if (splits && splits[0].orderStatus === 'confirm') {
        statusSelected = 'Confirm';
        statusOptions = [
            { label: "Ready For Pickup", value: "ready_for_pickup" },
            { label: "Out For Delivery", value: "out_for_delivery" },
            { label: "Delivered", value: "delivered" },
            { label: "On Hold", value: "on_hold" },
            { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'ready_for_pickup') {
        statusSelected = 'Ready For Pickup';
        statusOptions = [
            { label: "Out For Delivery", value: "out_for_delivery" },
            { label: "Delivered", value: "delivered" },
            { label: "On Hold", value: "on_hold" },
            { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'out_for_delivery') {
        statusSelected = 'Out For Delivery';
        statusOptions = [
            { label: "Delivered", value: "delivered" },
            { label: "On Hold", value: "on_hold" },
            { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'delivered') {
        statusSelected = 'Delivered';
        statusOptions = [
            { label: "On Hold", value: "on_hold" },
            { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'on_hold') {
        statusSelected = 'On Hold';
        statusOptions = [
            { label: "Confirm", value: "confirm" },
            // { label: "Ready For Pickup", value: "ready_for_pickup" },
            // { label: "Out For Delivery", value: "out_for_delivery" },
            // { label: "Delivered", value: "delivered" },
            { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'cancel') {
        statusSelected = 'Cancel';
        statusOptions = [
            // { label: "Confirm", value: "confirm" },
            // { label: "Ready For Pickup", value: "ready_for_pickup" },
            // { label: "Out For Delivery", value: "out_for_delivery" },
            // { label: "Delivered", value: "delivered" },
            // { label: "On Hold", value: "on_hold" },
        ]
    }

    if (splits && splits[0].onHoldStatus === 'pending') {
        onHoldStatusSelected = 'Pending';
        onHoldStatusOptions = [
            { label: "Open", value: "open" },
            { label: "Closed", value: "closed" },
        ]
    } else if (splits && splits[0].onHoldStatus === 'open') {
        onHoldStatusSelected = 'Open';
        onHoldStatusOptions = [
            { label: "Pending", value: "pending" },
            { label: "Closed", value: "closed" },
        ]
    } else if (splits && splits[0].onHoldStatus === 'closed') {
        onHoldStatusSelected = 'Closed';
        onHoldStatusOptions = [
            { label: "Pending", value: "pending" },
            { label: "Open", value: "open" },
        ]
    } else {
        onHoldStatusSelected = 'Open';
        onHoldStatusOptions = [
            { label: "Pending", value: "pending" },
            { label: "Closed", value: "closed" },
        ]
    }

    const handleStatus = (value) => {
        setSelectedStatus(value.value);
        if (value.value !== "on_hold" && !onHoldComment) {
            setIsEditing(true);
        } else if (value.value === "on_hold" && !onHoldComment) {
            setIsEditing(false);
        } else if (splits && splits[0].orderStatus !== value.value && onHoldComment) {
            setIsEditing(true);
        }
    };

    const handleOnHoldStatus = async (value) => {
        setSelectedonHoldStatus(value.value);
        if (splits && splits[0].onHoldStatus === value.value) {
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

    const handleReAssign = (value) => {
        setChangeStores((prev) => {
            const existingValueIndex = prev.findIndex((item) => item.name === value.name);
            if (existingValueIndex !== -1) {
                return prev.map((item, index) => {
                    if (index === existingValueIndex) {
                        return value;
                    }
                    return item;
                });
            } else {
                return [...prev, value];
            }
        });
        setSelectStore(false);
    };

    const filteredLineItems = orderData?.lineItems;

    const handleSubmit = async () => {
        if (selectedStatus === "confirm") {
            // await confirmOrder({ splitOrderData: JSON.stringify(splits) })
            await api.khagatiOrderSplit.update(splitId, {
                orderStatus: "new"
            });
        } else if (selectedStatus === "ready_for_pickup") {
            await readyForPickupOrder({ id: splitId })
        } else if (selectedStatus === "out_for_delivery") {
            await outForDeliveryOrder({ id: splitId })
        } else if (selectedStatus === "delivered") {
            await deliveredOrder({ id: splitId })
        } else if (selectedStatus === "on_hold") {
            await onHoldOrder({
                id: splitId,
                onHoldStatus: selectedOnHoldStatus,
                onHoldComment: onHoldComment
            })
        } else if (selectedStatus === "cancel") {
            await cancelOrder({ splitOrderData: JSON.stringify(splits) })
        }
        if (selectedOnHoldStatus !== splits[0].onHoldStatus) {
            await onHoldStatusHandle({ id: splitId, onHoldStatus: selectedOnHoldStatus });
        }
        navigate("/customer-support");
    }

    const openReAssignModal = () => {
        setReAssign(true);
    };

    const handleChangeCheckedProduct = useCallback((e, item) => {
        if (e) {
            setCheckedProducts((prevCheckedProducts) => [...prevCheckedProducts, item.id]);
            fetchStockData(item, splits);
        } else {
            setCheckedProducts((prevCheckedProducts) =>
                prevCheckedProducts.filter((id) => id !== item.id)
            );
        }
    }, [splits]);

    const groupByValue = (entries) => {
        const allParts = entries.map(entry => entry.value.split('_')[1]);
        const partCount = allParts.reduce((acc, part) => {
            acc[part] = (acc[part] || 0) + 1;
            return acc;
        }, {});
        const grouped = entries.reduce((acc, entry) => {
            const key = entry.value.split('_')[1];
            if (partCount[key] > 1) {
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(entry);
            } else {
                acc[key] = entry;
            }
            return acc;
        }, {});
        const result = [];
        Object.keys(grouped).forEach(key => {
            if (Array.isArray(grouped[key])) {
                result.push(grouped[key]);
            } else {
                result.push([grouped[key]]);
            }
        });
        return result;
    };

    const submitReAssign = async () => {
        if (checked) {
            setSelectStore(false);
            const backUpStore = stores?.find(store => store.isBackupWarehouse === true)
            const khagatiOrderSplitRecords = await api.khagatiOrderSplit.update(splits[0].id, {
                storeCode: backUpStore.storeCode,
                reAssignStatus: true,
                splitId: `${splits[0].orderNumber}-${backUpStore.storeCode}`,
                storeName: backUpStore.storeName,
                orderStatus: "new",
            });
            if (khagatiOrderSplitRecords) {
                handleReAssignClose();
                navigate("/orders");
            }
        } else {
            if (changeStores.length) {
                setSelectStore(false);
                const removableIds = new Set(changeStores.map(item => item.name));
                const removableIdsArray = [...removableIds];
                if (removableIdsArray.length) {
                    if (splits && splits[0] && splits[0].lineItems) {
                        const filteredLineItems = splits[0].lineItems.filter(item => !removableIdsArray.includes(item.id));
                        if (filteredLineItems.length) {
                            const updateData = {
                                lineItems: filteredLineItems
                            };
                            await api.khagatiOrderSplit.update(splits[0].id, updateData);
                        } else {
                            await api.khagatiOrderSplit.delete(splits[0].id);
                        }
                    }
                }
                const filteredEntries = groupByValue(changeStores);
                const finalRequestData = filteredEntries.map(group => {
                    const firstItem = group[0];
                    const valueParts = firstItem.value.split('_');
                    const storeCode = valueParts[1];
                    const erpStoreId = valueParts[2];
                    const store = stores?.find(store => store.storeCode === storeCode);
                    return {
                        erpStoreId: erpStoreId,
                        splitId: `${splits && splits.length > 0 ? splits[0].orderNumber : 'Unknown'}-${storeCode}`,
                        storeCode: storeCode,
                        storeName: store ? store.storeName : 'Default Store Name',
                        orderNumber: splits && splits.length > 0 ? splits[0].orderNumber : 'Unknown',
                        orderReferenceId: splits && splits.length > 0 ? splits[0].orderReferenceId : 'Unknown',
                        orderStatus: "new",
                        reAssignStatus: true,
                        lineItems: group.map(item => {
                            const itemValueParts = item.value.split('_');
                            return {
                                id: item.name,
                                itemReferenceCode: itemValueParts[3],
                                outletId: itemValueParts[2],
                                quantity: parseInt(itemValueParts[4], 10)
                            };
                        })
                    };
                });
                const khagatiOrderSplitRecords = await api.khagatiOrderSplit.bulkCreate(finalRequestData);
                if (khagatiOrderSplitRecords) {
                    handleReAssignClose();
                    navigate("/orders");
                }
            } else {
                setSelectStore(true);
            }
        }
    }

    const getProductImage = async (productId) => {
        const shopifyProductRecords = await api.shopifyProduct.findMany({
            select: {
                images: {
                    edges: {
                        node: {
                            source: true,
                        },
                    },
                },
            },
            filter: { id: { equals: productId } },
        });

        const imageUrl = shopifyProductRecords[0]?.images?.edges[0]?.node?.source;
        return imageUrl || null;
    };

    useEffect(() => {
        const fetchProductImages = async () => {
            if (orderData?.lineItems) {
                const images = {};
                for (const item of orderData.lineItems) {
                    const imageUrl = await getProductImage(item.product_id);
                    images[item.product_id] = imageUrl;
                }
                setProductImages(images);
            }
        };

        if (orderData) {
            fetchProductImages();
        }
    }, [orderData]);

    useEffect(() => {
        if (data?.length && splits?.length) {
            const getData = data[0];
            const getSplits = splits[0];

            const filteredLineItems = getData.lineItems.filter((dataLineItem) => {
                return getSplits.lineItems.some((splitLineItem) => splitLineItem.id === dataLineItem.id);
            });

            const currentSubtotalPrice = filteredLineItems.reduce((subtotal, item) => {
                return subtotal + (parseFloat(item.price) * item.quantity);
            }, 0);

            const currentTotalTax = filteredLineItems.reduce((totalTax, item) => {
                const singleItemTax = parseFloat(item.taxLines?.[0]?.price) / item.quantity;
                return totalTax + (singleItemTax * item.quantity);
            }, 0);

            const currentTotalPrice = currentSubtotalPrice + currentTotalTax;

            const finalData = {
                ...getData,
                // lineItems: filteredLineItems,
                currentSubtotalPrice: currentSubtotalPrice.toFixed(2),
                currentTotalTax: currentTotalTax.toFixed(2),
                currentTotalPrice: currentTotalPrice.toFixed(2)
            };
console.log("finaldata--------<", finalData)
            setOrderData(finalData);
        }
        setSelectedonHoldStatus(splits && splits[0].onHoldStatus !== "null" ? splits[0].onHoldStatus : 'open')
        setOnHoldComment(splits && splits[0].onHoldComment)
    }, [data, splits, id]);

    useEffect(() => {
        if (onHoldComment) {
            setIsEditing(true);
        }
    }, [onHoldComment]);

    return (
        <>
            {orderData && splits && splits.length ? (
                <Page
                    fullWidth
                    backAction={{ content: "Orders", onAction: () => navigate(-1) }}
                    title={splits && splits[0]?.splitId}
                    // title={`${splits && splits[0]?.orderNumber}-${orderData?.noteAttributes.find(({ name }) => name === "_storeCode")?.value}`}
                    subtitle={<Text variant="bodyMd" as="span">{`${formaterDate(orderData?.createdAt)} from Draft Orders`}</Text>}
                    titleMetadata={<InlineStack gap="200">
                        <Badge
                            tone={orderData?.financialStatus === "pending" ? "warning" : ""}
                            progress={
                                orderData?.financialStatus === "pending" ? "incomplete" : "complete"
                            }
                        >
                            {orderData?.financialStatus === "pending" ? "Payment pending" : "Paid"}
                        </Badge>
                        <Badge
                            tone={orderData?.fulfillmentStatus === null ? "attention" : ""}
                            progress={
                                orderData?.fulfillmentStatus === null ? "incomplete" : "complete"
                            }
                        >
                            {orderData?.fulfillmentStatus === null ? "Unfulfilled" : "Fulfilled"}
                        </Badge>
                        {splits && splits[0]?.reAssignStatus && <Badge progress="partiallyComplete" tone="info">Reassign</Badge>}
                    </InlineStack>}
                    primaryAction={isEditing && <Button onClick={handleSubmit} variant='primary' loading={confirmOrderFetching || readyForPickupOrderFetching || outForDeliveryOrderFetching || deliveredOrderFetching || onHoldOrderFetching || cancelOrderFetching || onHoldStatusFetching}>Save</Button>}
                    secondaryActions={<ButtonGroup>
                        <Button disabled={splits && splits.length && splits[0].orderStatus === "cancel"} onClick={() => navigate(`/orders/edit/${id}`)}>Edit</Button>
                        <Button disabled={splits && splits.length && splits[0].orderStatus === "cancel"} onClick={() => navigate(`/orders/refund/${id}`)}>Refund</Button>
                        <Button disabled={splits && splits.length && splits[0].orderStatus === "cancel"} onClick={openReAssignModal}>Reassign Order</Button>
                    </ButtonGroup>}
                >
                    <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="400">
                        <BlockStack gap="400">
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">
                                    <InlineStack align="space-between">
                                        <Badge
                                            tone={orderData?.fulfillmentStatus === null ? "attention" : ""}
                                            progress={
                                                orderData?.fulfillmentStatus === null ? "incomplete" : "complete"
                                            }
                                        >
                                            {orderData?.fulfillmentStatus === null ? "Unfulfilled" : "Fulfilled"} ({splits && splits[0]?.lineItems?.length})
                                        </Badge>
                                    </InlineStack>
                                    <Card>
                                        <Box paddingBlockEnd="400">
                                            <TextComponent
                                                textAs="span"
                                                textTitle="Location"
                                                textTone="subdued"
                                            />
                                            {splits && splits.length ? splits.map(({ id: orderSplitId, splitId, storeName, orderStatus, orderNumber }, index) => (
                                              <Box paddingBlockStart="200">
                                                <InlineStack gap="400">
                                                  <Badge tone="attention">
                                                    {storeName}
                                                    {/* {orderData?.noteAttributes.find(({ name }) => name === "_storeName")?.value} */}
                                                  </Badge>
                                                  <Badge
                                                    tone={orderStatus === "confirm" ? "info" : orderStatus === "ready_for_pickup" || orderStatus === "out_for_delivery" ? "warning" : orderStatus === "delivered" ? "success" : orderStatus === "on_hold" || orderStatus === "cancel" ? "critical" : ""}>
                                                    {orderStatus === "confirm" ? "Confirm" : orderStatus === "ready_for_pickup" ? "Ready for Pickup" : orderStatus === "out_for_delivery" ? "Out for Delivery" : orderStatus === "delivered" ? "Delivered" : orderStatus === "on_hold" ? "On Hold" : orderStatus === "cancel" ? "Cancel" : "New"}
                                                  </Badge>
                                                </InlineStack>
                                              </Box>
                                            ))
                                              : <TextComponent
                                                textVariant="bodyMd"
                                                textAs="h3"
                                                textTone="subdued"
                                              >
                                                No delivery
                                              </TextComponent>}
                                        </Box>
                                        {orderData?.lineItems?.map((item, index) => (
                                            <BlockStack gap="400" key={index}>
                                                <Divider />
                                                <Box paddingBlockEnd="400">
                                                    <InlineStack align="space-between" blockAlign="center">
                                                        <Box>
                                                            <InlineStack align="start">
                                                                <Thumbnail
                                                                    source={productImages[item.product_id] || NoteIcon}
                                                                    alt="Black choker necklace"
                                                                    size="small"
                                                                />
                                                                <Box as="span" paddingInlineStart="400">
                                                                    <Box paddingBlockEnd="100">
                                                                        <Link url="#" removeUnderline>
                                                                            <Text as="span" variant="bodyMd" fontWeight="semibold" alignment="start">
                                                                                {item?.title}
                                                                            </Text>
                                                                        </Link>
                                                                    </Box>
                                                                    {item?.variant_title && <Box paddingBlockEnd="100">
                                                                        <Tag>
                                                                            {item?.variant_title}
                                                                        </Tag>
                                                                    </Box>}
                                                                    {item?.sku && <Text as="span" variant="bodyMd" alignment="start">
                                                                        SKU: {item?.sku}
                                                                    </Text>}
                                                                </Box>
                                                            </InlineStack>
                                                        </Box>
                                                        <Box>
                                                            <InlineStack gap="800">
                                                                <TextComponent
                                                                    textAs="h6"
                                                                    textVariant="headingXs"
                                                                    textTitle={`₹ ${item?.price} x ${item?.quantity}`}
                                                                />
                                                                <TextComponent
                                                                    textAs="h6"
                                                                    textVariant="headingXs"
                                                                    textTitle={`₹ ${item?.price * item?.quantity}.00`}
                                                                />
                                                            </InlineStack>
                                                        </Box>
                                                    </InlineStack>
                                                </Box>
                                            </BlockStack>
                                        ))}
                                    </Card>
                                </BlockStack>
                            </Card>
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">
                                    <InlineStack align="space-between">
                                        <Badge
                                            tone={orderData?.financialStatus === "pending" ? "warning" : ""}
                                            progress={
                                                orderData?.financialStatus === "pending" ? "incomplete" : "complete"
                                            }
                                        >
                                            {orderData?.financialStatus === "pending" ? "Payment pending" : "Paid"}
                                        </Badge>
                                    </InlineStack>
                                    <Card roundedAbove="sm">
                                        <Box paddingBlock="150">
                                            <InlineStack align="space-between">
                                                <TextComponent
                                                    textTitle="Subtotal"
                                                    textVariant="bodyLg"
                                                    textAs="span"
                                                />
                                                <TextComponent
                                                    textTitle={`${orderData?.lineItems?.length} items`}
                                                    textVariant="headingXs"
                                                    textAs="h6"
                                                />
                                                <TextComponent
                                                    textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${orderData?.currentSubtotalPrice}`}
                                                    textVariant="bodyLg"
                                                    textAs="span"
                                                />
                                            </InlineStack>
                                        </Box>
                                        {orderData?.taxLines?.length ? <Box paddingBlock="150">
                                            <InlineStack align="space-between">
                                                <TextComponent
                                                    textTitle="Tax"
                                                    textVariant="bodyLg"
                                                    textAs="span"
                                                />
                                                <TextComponent
                                                    textTitle={`${orderData?.taxLines[0]?.title} ${orderData?.taxLines[0]?.rate * 100}%`}
                                                    textVariant="headingXs"
                                                    textAs="h6"
                                                />
                                                <TextComponent
                                                    textTitle={orderData?.currentTotalTax}
                                                    textVariant="bodyLg"
                                                    textAs="span"
                                                />
                                            </InlineStack>
                                        </Box> : ''}
                                        <Box paddingBlock="150">
                                            <InlineStack align="space-between">
                                                <TextComponent
                                                    textTitle="Total"
                                                    textVariant="headingSm"
                                                    textAs="h6"
                                                />
                                                <TextComponent
                                                    textTitle=""
                                                    textVariant="headingSm"
                                                    textAs="h6"
                                                />
                                                <TextComponent
                                                    textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${orderData?.currentTotalPrice}`}
                                                    textVariant="headingSm"
                                                    textAs="h6"
                                                />
                                            </InlineStack>
                                        </Box>
                                        <Divider />
                                        <Box paddingBlock="150">
                                            <InlineStack align="space-between">
                                                <TextComponent
                                                    textTitle="Paid by customer"
                                                    textVariant="headingXs"
                                                    textAs="h6"
                                                />
                                                <TextComponent
                                                    textTitle=""
                                                    textVariant="headingXs"
                                                    textAs="h6"
                                                />
                                                <TextComponent
                                                    textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${orderData?.currentTotalPrice}`}
                                                    textVariant="headingXs"
                                                    textAs="h6"
                                                />
                                            </InlineStack>
                                        </Box>
                                    </Card>
                                </BlockStack>
                            </Card>
                        </BlockStack>
                        <BlockStack gap={{ xs: "400", md: "200" }}>
                            <Card roundedAbove="sm">
                                <BlockStack gap="100">
                                    <InlineStack align="space-between">
                                        <TextComponent
                                            textTitle="Status"
                                            textVariant="headingSm"
                                            textAs="h6"
                                        />
                                    </InlineStack>
                                    <SelectComponent
                                        selectPlaceHolder={statusSelected}
                                        fieldName="status"
                                        selectOptions={statusOptions}
                                        selectValue={splits && splits[0].orderStatus}
                                        onValueChange={handleStatus}
                                        selectDisabled={splits && splits.length && splits[0].orderStatus === "cancel"}
                                    />
                                </BlockStack>
                            </Card>
                            {((splits && splits[0].onHoldStatus !== null && splits[0].orderStatus === "on_hold") || selectedStatus === "on_hold") && (<Card roundedAbove="sm">
                                <BlockStack gap="100">
                                    <TextComponent
                                        textTitle="On Hold Notes"
                                        textVariant="headingSm"
                                        textAs="h6"
                                    />
                                    <TextField
                                        value={onHoldComment}
                                        onChange={handleOnHoldCommentChange}
                                    />
                                    <TextComponent
                                        textTitle="On Hold Status"
                                        textVariant="headingSm"
                                        textAs="h6"
                                    />
                                    <SelectComponent
                                        selectPlaceHolder={onHoldStatusSelected}
                                        fieldName="onHoldStatus"
                                        selectOptions={onHoldStatusOptions}
                                        selectValue={splits && splits[0].onHoldStatus}
                                        onValueChange={handleOnHoldStatus}
                                    />
                                </BlockStack>
                            </Card>)}
                            <Card roundedAbove="sm">
                                <BlockStack gap="100">
                                    <InlineStack align="space-between">
                                        <TextComponent
                                            textTitle="Customer"
                                            textVariant="headingSm"
                                            textAs="h6"
                                        />
                                    </InlineStack>
                                    <Link url="#" removeUnderline>
                                        <TextComponent
                                            textAs="span"
                                            textVariant="bodyMd"
                                            textFontWeight="semibold"
                                            textTitle={`${orderData?.customer?.firstName} ${orderData?.customer?.lastName}`}
                                        />
                                    </Link>
                                    <TextComponent
                                        textAs="span"
                                        textVariant="bodyMd"
                                        textTone="subdued"
                                        textTitle={`${orderData?.customer?.ordersCount === 1 ? "1 Order" : `${orderData?.customer?.ordersCount} Orders`}`}
                                    />
                                    <TextComponent
                                        textTitle="Contact information"
                                        textVariant="headingSm"
                                        textAs="h6"
                                    />
                                    {orderData.email ? (
                                        <Link url="#" removeUnderline>
                                            {orderData.email}
                                        </Link>
                                    ) : (
                                        <TextComponent
                                            textAs="span"
                                            textVariant="bodyMd"
                                            textTone="subdued"
                                            textTitle="No email provided"
                                        />
                                    )}
                                    {orderData?.shippingAddress?.phone ? (
                                        <Link url="#" removeUnderline>
                                            {orderData?.shippingAddress?.phone}
                                        </Link>
                                    ) : (
                                        <TextComponent
                                            textAs="span"
                                            textVariant="bodyMd"
                                            textTone="subdued"
                                            textTitle="No phone number"
                                        />
                                    )}
                                    <TextComponent
                                        textTitle="Shipping address"
                                        textVariant="headingSm"
                                        textAs="h6"
                                    />
                                    {orderData?.shippingAddress ? (
                                        <>
                                            {orderData?.shippingAddress?.name && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.shippingAddress?.name}
                                            ></TextComponent>}
                                            {orderData?.shippingAddress?.address1 && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.shippingAddress?.address1}
                                            ></TextComponent>}
                                            {orderData?.shippingAddress?.address2 && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.shippingAddress?.address2}
                                            ></TextComponent>}
                                            {orderData?.shippingAddress?.city && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.shippingAddress?.city}
                                            ></TextComponent>}
                                            {orderData?.shippingAddress?.province && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.shippingAddress?.province}
                                            ></TextComponent>}
                                            {orderData?.shippingAddress?.zip && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.shippingAddress?.zip}
                                            ></TextComponent>}
                                            {orderData?.shippingAddress?.country && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.shippingAddress?.country}
                                            ></TextComponent>}
                                        </>
                                    ) : (
                                        <TextComponent
                                            textAs="span"
                                            textVariant="bodyLg"
                                            textTone="subdued"
                                            textTitle="No shipping address provided"
                                        ></TextComponent>
                                    )}
                                    <TextComponent
                                        textTitle="Billing address"
                                        textVariant="headingSm"
                                        textAs="h6"
                                    />
                                    {orderData?.billingAddress ? (orderData?.billingAddress && orderData?.shippingAddress) && objectEqual(orderData?.billingAddress, orderData?.shippingAddress) ? (
                                        <TextComponent
                                            textAs="span"
                                            textVariant="bodyLg"
                                            textTone="subdued"
                                            textTitle="Same as shipping address"
                                        />
                                    ) : (
                                        <>
                                            {orderData?.billingAddress?.name && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.billingAddress?.name}
                                            ></TextComponent>}
                                            {orderData?.billingAddress?.address1 && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.billingAddress?.address1}
                                            ></TextComponent>}
                                            {orderData?.billingAddress?.address2 && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.billingAddress?.address2}
                                            ></TextComponent>}
                                            {orderData?.billingAddress?.city && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.billingAddress?.city}
                                            ></TextComponent>}
                                            {orderData?.billingAddress?.province && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.billingAddress?.province}
                                            ></TextComponent>}
                                            {orderData?.billingAddress?.zip && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.billingAddress?.zip}
                                            ></TextComponent>}
                                            {orderData?.billingAddress?.country && <TextComponent
                                                textAs="span"
                                                textVariant="bodyLg"
                                                textTone="subdued"
                                                textTitle={orderData?.billingAddress?.country}
                                            ></TextComponent>}
                                        </>
                                    ) : (
                                        <TextComponent
                                            textAs="span"
                                            textVariant="bodyLg"
                                            textTone="subdued"
                                            textTitle="No billing address provided"
                                        />
                                    )}
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </InlineGrid>
                    {reAssign && (
                        <ModalComponent
                            modalTitle="Reassign Order"
                            modalPrimaryButton="Reassign"
                            modalActive={reAssign}
                            handleModalClose={handleReAssignClose}
                            handleModelSave={submitReAssign}
                            handleShowProducts={setShowProducts}
                        >
                            {filteredLineItems && filteredLineItems.map((item) => {
                                return (
                                    <Box paddingBlockStart="400">
                                        <InlineGrid columns={{ xs: 1, md: "2fr 2fr" }} gap="400">
                                            <BlockStack gap="400">
                                                <Checkbox
                                                    label={item.title}
                                                    checked={checkedProducts.includes(item.id)}
                                                    onChange={(e) => handleChangeCheckedProduct(e, item)}
                                                    disabled={checked}
                                                />
                                            </BlockStack>
                                            {checkedProducts.includes(item.id) && (
                                                <BlockStack gap="400">
                                                    <SelectComponent
                                                        selectPlaceHolder={"Select Store"}
                                                        fieldName={item.id}
                                                        selectOptions={storeData.filter((option) => option.value.split("_")[0] === item.id)}
                                                        onValueChange={handleReAssign}
                                                        selectError={isError.id === item.id && isError.status && "No inventory in stores"}
                                                    />
                                                </BlockStack>
                                            )}
                                        </InlineGrid>
                                    </Box>
                                );
                            })}
                            <Box paddingBlockEnd="400"></Box>
                            <Divider />
                            <Box paddingBlockStart="400">
                                <Checkbox
                                    label="Reassign order to backup store"
                                    checked={checked}
                                    onChange={handleChange}
                                    disabled={checkedProducts.length}
                                />
                            </Box>
                        </ModalComponent>
                    )}
                </Page>
            ) : (
                <SpinnerComponent />
            )}
        </>
    );
};

export default CustomerSupportDetailPage;