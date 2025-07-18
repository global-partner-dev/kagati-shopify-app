/**
 * OrderDetailPage Component
 *
 * This component provides a detailed view of a specific order, allowing users to review order details, manage the
 * order's status, reassign orders, and perform other related actions. The page supports operations such as confirming
 * orders, marking orders as ready for pickup, tracking orders out for delivery, delivering orders, and putting orders on hold.
 * Additionally, the component allows reassigning orders to different stores and managing inventory.
 *
 * Features:
 * - Displays order details including customer information, shipping and billing addresses, line items, and payment status.
 * - Allows updating the order status with options like Confirm, Ready For Pickup, Out For Delivery, Delivered, On Hold, and Cancel.
 * - Provides options to reassign orders to different stores based on available inventory.
 * - Supports placing orders on hold with additional comments and status tracking.
 * - Displays product images and other related information fetched dynamically.
 * - Integrates with the Gadget API to fetch and update order data.
 * - Includes a modal for reassignment of orders, with options to assign line items to different stores or to a backup store.
 *
 * Usage:
 *
 * <OrderDetailPage />
 *
 * Dependencies:
 * - React hooks (useState, useEffect, useCallback)
 * - Polaris components from Shopify (Page, Card, Badge, Button, Checkbox, Select, etc.)
 * - Gadget API for fetching and updating order data
 *
 * Props:
 * - No props are required. The component fetches the order data based on the order ID and split ID from the URL parameters.
 *
 * Example:
 * ```
 * <OrderDetailPage />
 * ```
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, InlineGrid, BlockStack, InlineStack, Card, Link, Box, Text, Badge, Tag, Divider, Thumbnail, Button, Checkbox, ButtonGroup, TextField, List } from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import TextComponent from "../../../components/TextComponent";
import SpinnerComponent from "../../../components/SpinnerComponent";
import { useFindMany,useFindOne, useGlobalAction, useUser } from "@gadgetinc/react";
import { api } from "../../../api";
import { formaterDate, objectEqual } from "../../../util/commonFunctions";
import SelectComponent from "../../../components/SelectComponent";
import ModalComponent from "../../../components/ModalComponent";
import OrderTimeline from "../../../components/Module/Timeline";

const OrderDetailPage = () => {
    const navigate = useNavigate();
    let { id, splitId } = useParams();
    const [orderData, setOrderData] = useState();
    const [selectedStatus, setSelectedStatus] = useState('');
   const [priceOrder, setPriceOrder] = useState();
    const [selectedOnHoldStatus, setSelectedonHoldStatus] = useState('open');
    const [isEditing, setIsEditing] = useState(false);
    const [reAssign, setReAssign] = useState(false);
    const [storeData, setStoreData] = useState([]);
    const [checked, setChecked] = useState(false);
    const [checkedProducts, setCheckedProducts] = useState([]);
    const [changeStores, setChangeStores] = useState([]);
    const [onHoldComment, setOnHoldComment] = useState("");
    const [isError, setIsError] = useState({ id: '', status: false });
    const [productImages, setProductImages] = useState({});
    const [showProducts, setShowProducts] = useState(false);
    const [selectStore, setSelectStore] = useState(false);
    const [storeAccess, setStoreAccess] = useState([]);
    const [storeModuleAccess, setStoreModuleAccess] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectStoreId,setSelectedStoreId]=useState('')
    const [productItemTags,setProductItemTags]=useState([]);
    const [totalTaxes,setTotalTaxes]=useState(0.0);
  
    const user = useUser();
    useEffect(() => {
      if (user.storeModuleAccess) {
        setStoreAccess(user.storeAccess);
        setStoreModuleAccess(user.storeModuleAccess)
        setIsLoading(false);
      }
    }, [user.storeModuleAccess]);
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
  console.log(":readyForPickupOrderData::", readyForPickupOrderData)

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
            createdAt: true,
            customer: true,
            lineItems: true,
            noteAttributes: true,
        },
        filter: {
            orderId: { equals: id },
        },
    });

    const [{ data: priceOrderData, fetching: priceOrderDataFetching, error: priceOrderDataError }] = useFindOne(api.shopifyOrder, id, {
      select: {
        id: true,
        orderNumber: true,
        financialStatus: true,
        email: true,
        shippingAddress: true,
        totalShippingPriceSet: true,
        totalDiscountsSet: true,
        taxLines: true,
        taxesIncluded:true,
        totalTax:true,
        lineItems: {
            edges: {
                node: {
                    id: true,
                    price: true,
                    quantity:true,
                    variantId:true,
                    product: { 
                      id: true,
                      tags:true,
                    },
                }
            },
        },
      }
    });

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
        tplMessage: true,
        tplTaskId: true,
        riderName: true,
        riderContact: true,
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
            // { label: "Cancel", value: "cancel" },
        ]
    } else if (splits && splits[0].orderStatus === 'confirm') {
        statusSelected = 'Confirm';
        statusOptions = [
            { label: "Ready For Pickup", value: "ready_for_pickup" },
            { label: "Out For Delivery", value: "out_for_delivery" },
            { label: "Delivered", value: "delivered" },
            { label: "On Hold", value: "on_hold" },
            // { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'ready_for_pickup') {
        statusSelected = 'Ready For Pickup';
        statusOptions = [
            { label: "Out For Delivery", value: "out_for_delivery" },
            { label: "Delivered", value: "delivered" },
            { label: "On Hold", value: "on_hold" },
            // { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'out_for_delivery') {
        statusSelected = 'Out For Delivery';
        statusOptions = [
            { label: "Delivered", value: "delivered" },
            { label: "On Hold", value: "on_hold" },
            // { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'delivered') {
        statusSelected = 'Delivered';
        statusOptions = [
            { label: "On Hold", value: "on_hold" },
            // { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'on_hold') {
        statusSelected = 'On Hold';
        statusOptions = [
            { label: "Confirm", value: "confirm" },
            { label: "Ready For Pickup", value: "ready_for_pickup" },
            { label: "Out For Delivery", value: "out_for_delivery" },
            { label: "Delivered", value: "delivered" },
            // { label: "Cancel", value: "cancel" },
        ];
    } else if (splits && splits[0].orderStatus === 'cancel') {
        statusSelected = 'Cancel';
        statusOptions = [
            { label: "Confirm", value: "confirm" },
            { label: "Ready For Pickup", value: "ready_for_pickup" },
            { label: "Out For Delivery", value: "out_for_delivery" },
            { label: "Delivered", value: "delivered" },
            { label: "On Hold", value: "on_hold" },
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

  const formatTaxLines = (taxLines) => {
    return taxLines?.map(taxLine => `${taxLine.title} ${parseFloat(taxLine.rate) * 100} %`).join(', ');
  };
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
            const res = await confirmOrder({ splitOrderData: JSON.stringify(splits) });
            console.log(res, 'test')
        } else if (selectedStatus === "ready_for_pickup") {
          const response = await readyForPickupOrder({ id: splitId })
          console.log("---------------------")
          console.log("splitID-----", splitId)
          console.log(response)
          console.log("readyForPickupOrderFetching---->", readyForPickupOrderFetching)
          console.log("readyForPickupOrderError---->", readyForPickupOrderError)
        } else if (selectedStatus === "out_for_delivery") {
           const response = await outForDeliveryOrder({ id: splitId })
          console.log(">>>>>>>>>>>>>>>>>>>>>>")
          console.log("splitID-----", splitId)
          console.log(response)
          console.log("outForDeliveryOrderFetching---->", outForDeliveryOrderFetching)
          console.log("outForDeliveryOrderError---->", outForDeliveryOrderError)
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
        navigate("/orders");
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
   useEffect(() => {
      if (priceOrderData) {
        const priceDatas = calculateOrderTotals(priceOrderData)
        setPriceOrder(priceDatas)
        const lineItems =priceOrderData.lineItems.edges;
      const targetTags = ["tax_18", "tax_12", "tax_5", "tax_0"];
      const taxRates = {
        tax_18: 18,  
        tax_12: 12,  
        tax_5: 5,  
        tax_0: 0.0,    
      };

      const variantTagMapping = lineItems.reduce((acc, edge) => {
        const { node } = edge; 
        const { id,variantId, product,price, quantity } = node; 
        if (product && Array.isArray(product.tags)) {
          const foundTag = product.tags.find(tag => targetTags.includes(tag)); 
          if (foundTag) {
            const taxRate = taxRates[foundTag] || 0; // Default to 0 if no tax rate found
            const totalProductCost = parseFloat(price) * parseInt(quantity);
            const taxAmount = totalProductCost- (totalProductCost * (100 / (100 + parseInt(taxRate))));
            
            acc[id] ={ tags: foundTag, taxamount:taxAmount.toFixed(2)};
          }
        }
        return acc;
      }, {});

      let totalTaxes =0.0;
      if(productItemTags){
        totalTaxes = Object.values(variantTagMapping).reduce((sum, item) => {
          return sum + parseFloat(item.taxamount || 0); // Ensure taxamount is treated as a number
        }, 0);
      }

      if(priceDatas?.shippingTaxAmount){
        totalTaxes=parseFloat(totalTaxes)+parseFloat(priceDatas.shippingTaxAmount);
      }
      setTotalTaxes(totalTaxes.toFixed(2))
      setProductItemTags(variantTagMapping)
      }
   }, [priceOrderData])
   const calculateOrderTotals = (data) => {
      let totalPrice = 0;
      let totalTax = 0;
      let totalQuantity = 0;
      
      if (data.lineItems && data.lineItems.edges) {
          const lineItems = data.lineItems.edges;
   
          // Loop through each line item
          for (const item of lineItems) {
              const node = item.node;
              // Add the price of the current item to totalPrice
              totalQuantity = node.quantity; 
              totalPrice += parseFloat(node.price)*parseInt(totalQuantity);
              // Assuming quantity is part of the node structure
    
              // Add tax amounts if they exist
              if (node.taxLines && node.taxLines.length > 0) {
                  for (const taxLine of node.taxLines) {
                      totalTax += parseFloat(taxLine.price);
                  }
              }
          }
      }
      console.log(totalTax,"totalTax")
    
      // Total shipping price
      const totalShippingPrice = parseFloat(data.totalShippingPriceSet.shop_money.amount);
      const shippingTaxtaxAmount = parseFloat(totalShippingPrice)- (parseFloat(totalShippingPrice) * (100 / (100 + parseInt(18))));
      const totalDiscount = parseFloat(data.totalDiscountsSet.shop_money.amount);
    
      // Final total price calculation
      const finalTotalPrice = totalPrice + totalShippingPrice - totalDiscount;
    
      return {
          totalPrice: totalPrice.toFixed(2),          // Format to 2 decimal places
          totalTax: totalTax.toFixed(2),                // Format to 2 decimal places
          totalDiscount: totalDiscount.toFixed(2),      // Format to 2 decimal places
          totalQuantity: totalQuantity,                   // Total quantity of line items
          finalTotalPrice: finalTotalPrice.toFixed(2),    // Format to 2 decimal places
          totalShippingPrice: totalShippingPrice.toFixed(2),
          shippingTaxAmount:shippingTaxtaxAmount.toFixed(2)
      };
    };

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
                    const imageUrl = await getProductImage(item.product);
                    images[item.product] = imageUrl;
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
                lineItems: filteredLineItems,
                currentSubtotalPrice: currentSubtotalPrice.toFixed(2),
                currentTotalTax: currentTotalTax.toFixed(2),
                currentTotalPrice: currentTotalPrice.toFixed(2)
            };

            setOrderData(finalData);
        }
        // setSelectedonHoldStatus(splits && splits[0].onHoldStatus !== "null" ? splits[0].onHoldStatus : 'open')
        // setOnHoldComment(splits && splits[0].onHoldComment)
    }, [data, splits]);


  
    useEffect(() => {
        if (onHoldComment && onHoldComment.trim().length != 0) {
            setIsEditing(true);
        } else{
          setIsEditing(false)
        }
    }, [onHoldComment, selectedOnHoldStatus]);
    const secondaryActions = !isLoading && storeModuleAccess.includes("Order Edit")
      ? (
        <ButtonGroup>
          <Button
            disabled={splits && splits?.length && splits[0]?.orderStatus === "cancel"}
            onClick={() => navigate(`/orders/refund/${id}`)}
          >
            Refund
          </Button>
          <Button
            disabled={splits && splits?.length && splits[0]?.orderStatus === "cancel"}
            onClick={openReAssignModal}
          >
            Reassign Order
          </Button>
        </ButtonGroup>
      )
      : (<></>);


  console.log(splits,"orderData")
    return (
        <>
            {orderData && splits && splits.length ? (
                <Page
                    fullWidth
                    backAction={{ content: "Orders", onAction: () => navigate("/orders",{
                        state: { selectedPreviousStoreCode: splits[0].storeCode},
                      }) }}
                    title={splits && splits[0]?.splitId}
                    // title={`${splits && splits[0]?.orderNumber}-${orderData?.noteAttributes.find(({ name }) => name === "_storeCode")?.value}`}
                    subtitle={<Text variant="bodyMd" as="span">{`${formaterDate(orderData?.createdAt)} from Draft Orders`}</Text>}
                    titleMetadata={<InlineStack gap="200">
                        <Badge
                            tone={orderData?.financialStatus === "pending" || orderData?.financialStatus === "partially_paid" ? "warning" : ""}
                            progress={
                                orderData?.financialStatus === "pending" || orderData?.financialStatus === "partially_paid"? "incomplete" : "complete"
                            }
                            >
                            {orderData?.financialStatus === "pending" 
                            ? "Payment pending" 
                            : orderData?.financialStatus === "partially_paid" 
                                ? "Payment pending" 
                                : orderData?.financialStatus === "refunded" 
                                ? "Refunded" 
                                : "Paid"}
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
                    secondaryActions={secondaryActions}
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
                                            <TextComponent
                                                textAs="h6"
                                                textVariant="headingXs"
                                                textTitle="Shop location"
                                            />
                                        </Box>
                                        {orderData?.lineItems?.map((item, index) => (
                                            <BlockStack gap="400" key={index}>
                                                <Divider />
                                                <Box paddingBlockEnd="400">
                                                    <InlineStack align="space-between" blockAlign="center">
                                                        <Box>
                                                            <InlineStack align="start">
                                                                <Thumbnail
                                                                    source={productImages[item.product] || NoteIcon}
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
                                                            {productItemTags &&productItemTags[item?.id]?.tags !=undefined &&productItemTags[item?.id]?.tags !== 'tag_0' &&
                                
                                                                <InlineStack gap="800">
                                                                <TextComponent
                                                                    textAs="h6"
                                                                    textVariant="headingXs"
                                                                    textTitle={`Taxs (included) ${productItemTags[item?.id]?.tags.replace(/^tax_/, '')}%`}
                                                                />
                                                                <TextComponent
                                                                textAs="h6"
                                                                textVariant="headingXs"
                                                                textTitle={`₹ ${productItemTags[item.id].taxamount}`}
                                                                />
                                                            </InlineStack>
                                                            }
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
                                    <InlineStack gap="200">
                                      <TextComponent
                                          textTitle="Order details"
                                           textAs="h4"
                                          textVariant="headingLg"
                                          
                                        />
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
                                              textTitle={`${orderData?.lineItems?.reduce((sum, item) => sum + item.quantity, 0)} items`}
                                              textVariant="headingXs"
                                              textAs="h6"
                                            />
                                            <TextComponent
                                              textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${priceOrder?.totalPrice}`}
                                              textVariant="bodyLg"
                                              textAs="span"
                                            />
                                          </InlineStack>
                                        </Box>
                                        <Box paddingBlock="150">
                                          <InlineStack align="space-between">
                                            <TextComponent
                                              textTitle="Shipping"
                                              textVariant="bodyLg"
                                              textAs="span"
                                            />
                                           {priceOrder?.totalShippingPrice != "0.00" &&
                                                <TextComponent
                                                textTitle={`Tax ${orderData?.currency === "INR" ? "₹" : "$"}${priceOrder?.shippingTaxAmount} (included)`}
                                                textVariant="headingXs"
                                                textAs="h6"
                                            /> }
                        
                                          <TextComponent
                                            textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${priceOrder?.totalShippingPrice}`}
                                            textVariant="bodyLg"
                                            textAs="span"
                                          />
                                          </InlineStack>
                                        </Box>
                                        <Box paddingBlock="150">
                                          <InlineStack align="space-between">
                                            <TextComponent
                                              textTitle="Discounts"
                                              textVariant="bodyLg"
                                              textAs="h6"
                                            />
                                            <TextComponent
                                              textTitle=""
                                              textVariant="bodyLg"
                                              textAs="h6"
                                            />
                                            <TextComponent
                                              textTitle={`-${orderData?.currency === "INR" ? "₹" : "$"}${priceOrder?.totalDiscount}`}
                                              textVariant="headingSm"
                                              textAs="h6"
                                            />
                                          </InlineStack>
                                        </Box>
                                        {priceOrderData?.taxLines ? 
                                          <Box paddingBlock="150">
                                        <InlineStack align="space-between">
                                            <TextComponent
                                              textTitle="TotalTax"
                                              textVariant="bodyLg"
                                              textAs="span"
                                            />
                                            <InlineStack align="space-between">
                                            <TextComponent 
                                            textTitle={` ${ totalTaxes != 0.0 ? "(Included)" : ""}`} // Accessing the tax lines from the node
                                            textVariant="headingXs"
                                            textAs="h6" 
                                            />
                                        </InlineStack>
                                        <TextComponent
                                            textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${totalTaxes}`}
                                            textVariant="bodyLg"
                                            textAs="span"
                                        />
                                        </InlineStack>
                                          </Box> : null
                                        }
                                        
                                        <Box paddingBlock="150">
                                          <InlineStack align="space-between">
                                            <TextComponent
                                              textTitle="Total"
                                              textVariant="bodyLg"
                                              textAs="h6"
                                            />
                                            <TextComponent
                                              textTitle=""
                                              textVariant="bodyLg"
                                              textAs="h6"
                                            />
                                            <TextComponent
                                              textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${priceOrder?.finalTotalPrice}`}
                                              textVariant="bodyLg"
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
                                              textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${priceOrder?.finalTotalPrice}`}
                                              textVariant="headingXs"
                                              textAs="h6"
                                            />
                                          </InlineStack>
                                        </Box>
                                      </Card>
                                      
                                </BlockStack>
                            </Card>
                            <List gap="extraTight">
                                {/* //--------timeStamp ------// */}
                                <OrderTimeline orderId={id} />
                                {/* //////////////////////////// */}
                            </List>
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
                                        selectDisabled={splits && splits.length && (splits[0].orderStatus === "cancel" || splits[0].orderStatus === "on_hold")}
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
                                        autoComplete="off"
                                        disabled={splits && splits[0].orderStatus === "on_hold"}
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
                                        selectDisabled={true}
                                    // selectDisabled={splits && splits[0].orderStatus === "on_hold"}
                                    />
                                </BlockStack>
                            </Card>)}
                            <Card roundedAbove="sm">
                                <BlockStack gap="100">
                                    <InlineStack align="space-between">
                                        <TextComponent
                                            textTitle="Shipping Details"
                                            textVariant="headingSm"
                                            textAs="h6"
                                        />
                                    </InlineStack>
                                    <TextComponent
                                        textTitle="Driver information"
                                        textVariant="headingSm"
                                        textAs="h6"
                                    />
                                    {splits[0].tplMessage ? (
                                      <InlineStack align="space-between">
                                        <Badge
                                            tone={
                                              splits[0].tplMessage.status === "error"
                                                ? "critical"
                                                : splits[0].tplMessage.status === "info"
                                                ? "attention"
                                                : undefined // Default or other tone
                                            }
                                          >
                                            {splits[0].tplMessage.msg}
                                          </Badge>
                                        </InlineStack>
                                      ) : null}
                                    <TextComponent
                                      textAs="span"
                                      textVariant="bodyMd"
                                      textTone="subdued"
                                    >
                                      {splits[0].riderName ? (
                                        <>
                                          Rider Name:{" "}
                                          <Link url="#" removeUnderline>
                                            {splits[0].riderName}
                                          </Link>
                                        </>
                                      ) : (
                                        "No Rider"
                                      )}
                                    </TextComponent>
                                    <TextComponent
                                      textAs="span"
                                      textVariant="bodyMd"
                                      textTone="subdued"
                                    >
                                      {splits[0].riderContact ? (
                                        <>
                                          Rider Contact:{" "}
                                          <Link url="#" removeUnderline>
                                            +91 {splits[0].riderContact}
                                          </Link>
                                        </>
                                      ) : (
                                        "No phone number"
                                      )}
                                    </TextComponent>
                                    <TextComponent
                                      textAs="span"
                                      textVariant="bodyMd"
                                      textTone="subdued"
                                    >
                                      {splits[0].tplTaskId ? (
                                        <>
                                          Task No:{" "}
                                          <Link url="#" removeUnderline>
                                            {splits[0].tplTaskId}
                                          </Link>
                                        </>
                                      ) : (
                                        "No task number"
                                      )}
                                    </TextComponent>
                                </BlockStack>
                            </Card>
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

export default OrderDetailPage;