/**
 * OrderDetailPage Component
 *
 * This component provides a detailed view of an individual order, allowing users to view and manage order details,
 * including order status, payment status, product line items, customer information, and shipping details. It also
 * supports reassigning the order to different stores, either manually or by selecting a backup store. Users can
 * interact with the order by editing it, reassigning order splits, and reviewing the associated tags and notes.
 *
 * Features:
 * - Displays order details such as financial status, fulfillment status, and order items.
 * - Allows reassigning products within the order to different stores based on stock availability.
 * - Supports reassigning the entire order to a backup store.
 * - Provides customer contact information and addresses for shipping and billing.
 * - Displays and manages order tags and notes.
 * - Utilizes the Shopify Polaris components for a consistent UI/UX.
 * - Integrates with the Gadget API for data fetching and actions related to orders and stores.
 *
 * Usage:
 *
 * <OrderDetailPage />
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, InlineGrid, BlockStack, InlineStack, Card, Link, Box, Text, Badge, Tag, Divider, Thumbnail, List, Button, Checkbox, ButtonGroup, Banner } from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import TextComponent from "../../../components/TextComponent";
import SpinnerComponent from "../../../components/SpinnerComponent";
import { useFindMany, useFindOne, useGlobalAction } from "@gadgetinc/react";
import { api } from "../../../api";
import { formaterDate, objectEqual, formaterTime , formaterDateOnly} from "../../../util/commonFunctions";
import SelectComponent from "../../../components/SelectComponent";
import ModalComponent from "../../../components/ModalComponent";
import OrderTimeline from "../../../components/Module/Timeline";

const OrderDetailPage = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState();
  const [priceOrder, setPriceOrder] = useState();
  const [reAssign, setReAssign] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [checked, setChecked] = useState(false);
  const [checkedProducts, setCheckedProducts] = useState([]);
  const [changeStores, setChangeStores] = useState([]);
  const [isError, setIsError] = useState({ id: '', status: false });
  const [productImages, setProductImages] = useState({});
  const [showProducts, setShowProducts] = useState(false);
  const [selectStore, setSelectStore] = useState(false);
  const [productItemTags,setProductItemTags]=useState([]);
  const [totalTaxes,setTotalTaxes]=useState(0.0);
  const [orderTimeStatus,setTorderTimeStatus]=useState([]);

  const [{ data, fetching, error }] = useFindMany(api.khagatiOrder, {
    select: {
      id: true,
      name: true,
      createdAt: true,
      orderNumber: true,
      email: true,
      phone: true,
      note: true,
      currency: true,
      currentSubtotalPrice: true,
      currentTotalTax: true,
      totalOutstanding:true,
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


  const [{ data: priceOrderData, fetching: priceOrderDataFetching, error: priceOrderDataError }] = useFindOne(api.shopifyOrder, id, {
    select: {
      id: true,
      orderNumber: true,
      financialStatus: true,
      email: true,
      shippingAddress: true,
      totalShippingPriceSet: true,
      totalOutstanding:true,
      fulfillmentStatus:true,
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
                  currentQuantity:true,
                  fulfillableQuantity:true,
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
      storeName: true,
      orderStatus: true,
      timeStamp:true,
      lineItems: true,
    },
    filter: {
      orderReferenceId: { equals: id },
    },
  });

 

  //const [{ data: productSyncData, fetching: productSyncFetching, error: productSyncError }, createProductSync] = useGlobalAction(api.orderStatusTest);

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

  const handleChange = useCallback(
    (newChecked) => setChecked(newChecked),
    [],
  );

  const filteredLineItems = orderData?.lineItems;

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
          primaryStock: { greaterThanOrEqual: item.currentQuantity },
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

  const handleReAssignClose = () => {
    setReAssign(false);
  };

  const openReAssignModal = () => {
    setReAssign(true);
  };

  const handleChangeCheckedProduct = useCallback((e, item) => {
    if (e) {
      setCheckedProducts((prevCheckedProducts) => [...prevCheckedProducts, item.id]);
      fetchStockData(item);
    } else {
      setCheckedProducts((prevCheckedProducts) =>
        prevCheckedProducts.filter((id) => id !== item.id)
      );
    }
  }, []);
  const formatTaxLines = (taxLines) => {
    return taxLines?.map(taxLine => `${taxLine.title} ${parseFloat(taxLine.rate) * 100} %`).join(', ');
  };
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
        storeName: backUpStore.storeName
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
            if(node.currentQuantity != 0){
            totalQuantity += parseInt(node.currentQuantity); 
            totalPrice += parseFloat(node.price)*parseInt(node.currentQuantity);
            // Assuming quantity is part of the node structure
  
            // Add tax amounts if they exist
            if (node.taxLines && node.taxLines.length > 0) {
                for (const taxLine of node.taxLines) {
                    totalTax += parseFloat(taxLine.price);
                }
            }
          }
        }
    }
  
    // Total shipping price'
  
            
    const totalShippingPrice = parseFloat(data.totalShippingPriceSet.shop_money.amount);
    const shippingTaxtaxAmount = totalShippingPrice - (totalShippingPrice * (100 / (100 + parseInt(18))));
    const totalDiscount = parseFloat(data.totalDiscountsSet.shop_money.amount);
  
    // Final total price calculation
    const finalTotalPrice = totalPrice + totalShippingPrice - totalDiscount;
    let paidAmount=finalTotalPrice;
    if(data.totalOutstanding != "0.00"){
      paidAmount=parseFloat(finalTotalPrice)-parseFloat(data.totalOutstanding);
    }

  
    return {
        totalPrice: totalPrice.toFixed(2),          // Format to 2 decimal places
        totalTax: totalTax.toFixed(2),                // Format to 2 decimal places
        totalDiscount: totalDiscount.toFixed(2),      // Format to 2 decimal places
        totalQuantity: totalQuantity,                   // Total quantity of line items
        finalTotalPrice: finalTotalPrice.toFixed(2),    // Format to 2 decimal places
        totalShippingPrice: totalShippingPrice.toFixed(2),
        totalPaid:paidAmount.toFixed(2),
        remainsBalance:data.totalOutstanding,
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
          console.log(item,imageUrl,"imageUrl")
          images[item.product] = imageUrl;
        }
        setProductImages(images);
      }
    };

    if (orderData) {
      fetchProductImages();
    }
  }, [orderData]);
  console.log(productImages,"productImages")

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
        const { id,variantId, product,price, quantity,currentQuantity } = node; 
        if (currentQuantity > 0 && product && Array.isArray(product.tags)) {
          const foundTag = product.tags.find(tag => targetTags.includes(tag)); 
          if (foundTag) {
            const taxRate = taxRates[foundTag] || 0; // Default to 0 if no tax rate found
            const totalProductCost = parseFloat(price) * parseInt(currentQuantity);
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
  useEffect(() => {
    if (data && data.length) {
      setOrderData(data[0]);
    }
    if(splits && splits.length>0 && splits[0].timeStamp !== null){
          const timeStamp=  splits[0].timeStamp;
          const validTimestamps = Object.entries(timeStamp).filter(
            ([key, value]) => value && !isNaN(new Date(value).getTime())
          );
          setTorderTimeStatus(validTimestamps)
    }
  }, [data,splits]);

  return (
    <Box paddingBlockEnd="400">
      {orderData ? (
        <Page
          fullWidth
          compactTitle
          backAction={{ content: "Orders", onAction: () => navigate(-1) }}
          title={orderData?.name}
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
              {priceOrderData?.fulfillmentStatus === null ? "Unfulfilled" : "Fulfilled"}
            </Badge>
          </InlineStack>}
          secondaryActions={<ButtonGroup>
            {/* <Button onClick={() => navigate(`/orders/refund/${id}`)}>Refund</Button> */}
            <Button disabled={splits && splits.length && splits.find(split => split.orderStatus === 'cancel')} onClick={() => navigate(`/orders/edit/${id}`)}>Edit</Button>
            {/* {splits && splits.length && <Button disabled={splits && splits.length && splits.find(split => split.orderStatus === 'cancel')} onClick={openReAssignModal}>Reassign Order</Button>} */}
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
                      {priceOrderData?.fulfillmentStatus === null ? "Unfulfilled" : "Fulfilled"}
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
                    {orderData?.lineItems?.filter((item) => item.currentQuantity > 0)?.map((item, index) => (

                      <BlockStack gap="400" key={index}>
                        <Divider />
                        <Box paddingBlockEnd="600">
                          <InlineStack align="space-between" blockAlign="center">
                            <Box>
                              <InlineStack align="start">
                                <Thumbnail
                                  source={productImages[item.product] || NoteIcon}
                                  alt="Black choker necklace"
                                  size="small"
                                />
                                <Box as="span" paddingInlineStart="300">
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
                              <InlineStack gap="900">
                                <TextComponent
                                  textAs="h6"
                                  textVariant="headingXs"
                                  textTitle={`₹ ${item?.price} x ${item?.currentQuantity}`}
                                />
                                <TextComponent
                                  textAs="h6"
                                  textVariant="headingXs"
                                  textTitle={`₹ ${item?.price * item?.currentQuantity}.00`}
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
                  <InlineStack align="space-between">
                    <Badge
                      tone={orderData?.financialStatus === "pending" || orderData?.financialStatus === "partially_paid"? "warning" : ""}
                      progress={
                        orderData?.financialStatus === "pending" || orderData?.financialStatus === "partially_paid" ? "incomplete" : "complete"
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
                          textTitle={`${priceOrder?.totalQuantity} items`}
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
                    <Box paddingBlock="50">
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
                          textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${priceOrder?.totalPaid}`}
                          textVariant="headingXs"
                          textAs="h6"
                        />
                        
                      </InlineStack>
                    </Box>
                    {priceOrder?.remainsBalance != "0.00" && (   <Box paddingBlock="150"><InlineStack align="space-between">
                        <TextComponent
                          textTitle="Payment Pending"
                          textVariant="headingXs"
                          textAs="h6"
                        />
                        <TextComponent
                          textTitle=""
                          textVariant="headingXs"
                          textAs="h6"
                        />
                        <TextComponent
                          textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${priceOrder?.remainsBalance}`}
                          textVariant="headingXs"
                          textAs="h6"
                        />
                      </InlineStack></Box>)}
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
                  <TextComponent
                    textTitle="Shipping Method"
                    textVariant="headingSm"
                    textAs="h6"
                  />
                  <TextComponent
                    textTitle="Delivery from:"
                    textVariant="headingSm"
                    textAs="h6"
                    textFontWeight="medium"
                  />
                  {splits && splits.length ? splits.map(({ id: orderSplitId, splitId, storeName, orderStatus, orderNumber }, index) => (
                    <Box paddingBlockStart="200">
                      <InlineStack gap="400">
                        <Button variant="plain" onClick={() => navigate(`/orders/split/${id}/${orderSplitId}`)}>
                          {splitId}
                          {/* {`${orderNumber}-${orderData?.noteAttributes.find(({ name }) => name === "_storeCode")?.value}`} */}
                        </Button>
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
                </BlockStack>
              </Card>
              <Card roundedAbove="sm">
                <BlockStack gap="100">
                  <InlineStack align="space-between">
                    <TextComponent
                      textTitle="Notes"
                      textVariant="headingSm"
                      textAs="h6"
                    />
                  </InlineStack>
                  <TextComponent
                    textVariant="bodyMd"
                    textAs="h3"
                    textTone="subdued"
                  >
                    {orderData?.note || "No notes from customer"}
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
              <Card roundedAbove="sm">
                <BlockStack gap="400">
                  <TextComponent
                    textTitle="Tags"
                    textVariant="headingSm"
                    textAs="h6"
                  />
                  <InlineStack gap="200">
                    {orderData?.tags?.length ? orderData?.tags?.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    )) : <TextComponent
                      textAs="span"
                      textVariant="bodyLg"
                      textTone="subdued"
                      textTitle="No tags"
                    />}
                  </InlineStack>
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
              {selectStore && <Banner status="critical" tone="critical">Please assign at least one product item to any store</Banner>}
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
    </Box>
  );
};

export default OrderDetailPage;