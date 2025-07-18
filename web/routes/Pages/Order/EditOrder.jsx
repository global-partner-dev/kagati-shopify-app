/**
 * EditDraftOrderPage Component
 *
 * This component allows users to edit existing draft orders in the Shopify store. It provides an interface for modifying
 * order details such as customer information, product line items, store assignment, and order notes. Users can search and 
 * select products, update quantities, manage store stock levels, and adjust payment methods. The component also supports
 * creating new customers and reassigning orders to different stores manually or automatically.
 *
 * Features:
 * - Load and display existing draft order details for editing.
 * - Allows modification of customer information, including selecting an existing customer or creating a new one.
 * - Supports product browsing, searching, and selection with real-time stock updates.
 * - Manages store assignments with options for automatic or manual selection.
 * - Dynamic calculation of order totals, taxes, and item quantities.
 * - Saves changes to the draft order and updates it in the Shopify store.
 *
 * Usage:
 *
 * <EditDraftOrderPage />
 */

import React, { Fragment, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, InlineGrid, BlockStack, InlineStack, Card, Button, TextContainer, Icon, Link, Box, Text, Divider, useIndexResourceState, IndexTable, useBreakpoints, Thumbnail, TextField, Spinner, Select, RadioButton } from "@shopify/polaris";
import { EditIcon, SearchIcon, NoteIcon, DeleteIcon } from "@shopify/polaris-icons";
import TextComponent from "../../../components/TextComponent";
import TextFieldComponent from "../../../components/TextFieldComponent";
import ButtonComponent from "../../../components/ButtonComponent";
import { useFindMany, useFindOne, useGlobalAction } from "@gadgetinc/react";
import { api } from "../../../api";
import ComboboxComponent from "../../../components/ComboboxComponent";
import ModalComponent from "../../../components/ModalComponent";
import CheckboxComponent from "../../../components/CheckboxComponent";
import CreateMultiSelectComponent from "../../../components/CreateMultiSelectComponent";
import { formaterDate, objectEqual } from "../../../util/commonFunctions";

const EditDraftOrderPage = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [activeNotes, setActiveNotes] = useState(false);
  const [activeCreateCustomer, setActiveCreateCustomer] = useState(false);
  const [productLists, setProductLists] = useState(false);
  const [editConfirm, setEditConfirm] = useState(false);
  const [editDraftOrder, setEditDraftOrder] = useState({});
  const [searchProducts, setSearchProducts] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [tags, setTags] = useState([]);
  const [itemStock, setItemStock] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedStoreData, setSelectedStoreData] = useState({});
  const [pendingStore, setPendingStore] = useState('');
  const [isModalActive, setIsModalActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [radioValue, setRadioValue] = useState('auto');
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [productImages, setProductImages] = useState({});
  const [priceOrder, setPriceOrder] = useState();
  const [orderData, setOrderData] = useState();
  const [allProducts, setAllProducts] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [removeItems, setRemoveItems] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [updateItems, setUpdateItems] = useState([]);
  const [reAssignStatus, setReAssignStatus] = useState(false);
  const [splitId,setSplitId]=useState("");
  const [customerInvoice,setCustomerInvoice]=useState(false);
  const [productItemTags,setProductItemTags]=useState([]);
  const [totalTaxes,setTotalTaxes]=useState(0.0);
  const [subtotal, setSubtotal] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [orderTotal,seOrderTotal]=useState(0);

  const [listedProducts, setListedProduct] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [variantCursor, setVariantCursor] = useState(null);
  const [priceCalculation, setPriceCalculation] = useState([]);
  const targetTags = ["tax_18", "tax_12", "tax_5", "tax_0"];
  const taxRates = {
    tax_18: 18,  
    tax_12: 12,  
    tax_5: 5,  
    tax_0: 0.0,    
  };

  // console.log("editDraftOrder content-------->", editDraftOrder);
  // console.log("editDraftOrder  customer-------->", editDraftOrder.customer)
  // console.log("allStores-------->>", allStores)
  const handleChangeRadio = useCallback((_, newValue) => {
    setRadioValue(newValue);
    if (newValue === "auto") {
      setSelectedStore("");
      setSelectedStoreData({});
    }
  }, []);

  const handleNoteModelClose = () => {
    setActiveNotes(false);
  };

  const handleCreateCustomerModelClose = () => {
    setActiveCreateCustomer(false);
  };

  const handleProductListsModelClose = () => {
    setProductLists(false);
  };

  const handleProductListsModelSave = () => {
    setShowProducts(true);
    setProductLists(false);
  };

  const handleEditConfirmModelClose = () => {
    setEditConfirm(false);
  };

  const handleEditConfirmModelSave = () => {
    setEditConfirm(false);
    handleSubmit();
  };

  const [{ data, fetching, error }] = useFindMany(api.khagatiOrder, {
    select: {
      id: true,
      orderId: true,
      name: true,
      email: true,
      phone: true,
      note: true,
      noteAttributes: true,
      currency: true,
      currentSubtotalPrice: true,
      totalOutstanding:true,
      currentTotalTax: true,
      currentTotalPrice: true,
      taxLines: true,
      billingAddress: true,
      shippingAddress: true,
      tags: true,
      financialStatus: true,
      orderNumber: true,
      fulfillmentStatus: true,
      shopifyCreatedAt: true,
      customer: true,
      lineItems: true,
    },
    filter: {
      orderId: { equals: id },
    },
  });
  // console.log("data======>", data)

  const [{ data: priceOrderData, fetching: priceOrderDataFetching, error: priceOrderDataError }] = useFindOne(api.shopifyOrder, id, {
    select: {
      id: true,
      orderNumber: true,
      financialStatus: true,
      email: true,
      shippingAddress: true,
      currentTotalPrice:true,
      totalShippingPriceSet: true,
      totalOutstanding:true,
      totalDiscountsSet: true,
      taxLines: true,
      taxesIncluded: true,
      totalTax: true,
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
            }
          }
        },
      },
    }
  });
  const [{ data: draftOrderData, fetching: draftOrderFetching, error: draftOrderError }, draftOrderUpdate] = useGlobalAction(api.updateOrder);

  const [{ data: stores = [], fetching: storesFetching, error: storesError }] = useFindMany(api.khagatiStores, {
    select: {
      erpStoreId: true,
      storeCode: true,
      storeName: true,
      city: true,
      state: true,
      pinCode: true,
    },
    filter: {
      status: { in: ["Active"] }
    }
  });

  const [{ data:splitOrderData,fetching: splitORderDataFetching, error: splitORderDataError}]=useFindMany(api.khagatiOrderSplit, {
    select: {
      id: true,
      reAssignStatus: true,
      orderStatus: true,
      lineItems: true
    },
    filter: {
      orderReferenceId: { equals: id }
    }
  });

  useEffect(() => {
   if(splitOrderData){
    const splitData=JSON.parse(JSON.stringify(splitOrderData[0]), null, 2);
    setSplitId(splitData.id)
   }

  }, [splitOrderData]);

  // console.log("stores----->", stores)

  const [{ data: customerData, fetching: customerFetching, error: customerError }] = useFindMany(api.shopifyCustomer, {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      ordersCount: true,
      defaultAddress: {
        id: true,
        name: true,
        address1: true,
        address2: true,
        city: true,
        zipCode: true,
        provinceCode: true,
        country: true,
        phone: true,
        company: true,
        country: true,
        province: true,
        firstName: true,
        lastName: true,
        countryCode: true,
      }
    },
  });
  const bottomRef = useRef(null);
  const [{ data: productData = [], fetching: productFetching, error: productError }] = useFindMany(api.shopifyProduct, {
    variables: {
      first: 10,// Fetch the maximum allowed items per request
      after: cursor
    },
    filter: {
      variants: {
        outletId: {
          equals: selectedStore,
        },
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      handle: true,
      tags:true,
      images: {
        edges: {
          node: {
            source: true,
          },
        },
      },
      variants: {
        edges: {

          node: {
            id: true,
            title: true,
            price: true,
            sku: true,
            inventoryQuantity: true,
            outletId: true,
            product: {
              id: true,
            }

          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    },
  });

  useEffect(() => {
    if (productError) {
      console.error("Error fetching products:", productError);
      setProductLoading(false);
      return;
    }

    if (!productFetching && productData) {
      setAllProducts((prev) => {
        const newProducts = productData || [];
        return [...prev, ...newProducts];
      });

      const hasNext = productData.pagination.pageInfo?.hasNextPage;
      setHasNextPage(!!hasNext);

      if (hasNext) {
        setCursor(productData.pagination.pageInfo.endCursor);
      }

      setProductLoading(false); // Ensure loading stops
    }
  }, [productFetching, productData, productError]);


  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      debounce((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !productFetching) {
          setProductLoading(true); // Debounced load
        }
      }, 200),
      { threshold: 1.0 }
    );

    if (bottomRef.current) observer.observe(bottomRef.current);

    return () => {
      if (bottomRef.current) observer.unobserve(bottomRef.current);
    };
  }, [hasNextPage, productFetching]);

  const handleValues = ({ name, value }) => {
    setEditDraftOrder({
      ...editDraftOrder,
      [name]: value,
    });
    if (name === "customer") {
      selectedCustomerData(value);
    }
  };
  const confirmEdit = () => {
    setEditConfirm(true);
    console.log(editDraftOrder, "editDraftOrder")
    console.log(selectedProducts, "selectedProducts") 

    // Get updated items by comparing selectedProducts with editDraftOrder lineItems
    const updatedItems = selectedProducts.filter(item => {
      // Find matching item in original order
      const originalItem = data[0].lineItems?.find(original => original.id === item.id);
      
      // Include item if quantity changed from original order
      if (originalItem && originalItem.currentQuantity !== item.currentQuantity) {
        return true;
      }
      return false;
    });

    setUpdateItems(updatedItems);
    console.log(updatedItems,"updateItems")
  }
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    const requestData = {
      note: editDraftOrder?.notes || null,
      tags: tags || null,
      customer: {
        id: selectedCustomer?.id || null,
        firstName: selectedCustomer?.firstName || null,
        lastName: selectedCustomer?.lastName || null,
        email: selectedCustomer?.email || null,
        phone: selectedCustomer?.phone || null,
        defaultAddress: selectedCustomer?.defaultAddress?.id || null,
        ordersCount: selectedCustomer?.ordersCount || null,
      },
      lineItems: selectedProducts,
      noteAttributes: radioValue === "manual" ? selectedStoreData : [],
    };

    const requestCustomData={
      customerInvoice:customerInvoice,
      splitId:splitId,
      orderNumber:data[0].name.replace(/^#/, ''),
      reAssignStatus:reAssignStatus,
      selectedStore: selectedStore
    }

    const dummydata={
      orderId: editDraftOrder.id,
      originalOrderId: id,
      removeItems: JSON.stringify(removeItems),
      addedItems: JSON.stringify(addedItems),
      updateItems: JSON.stringify(updateItems),
      requestData: JSON.stringify(requestData),
      requestCustomData:JSON.stringify(requestCustomData)
    }
    console.log(dummydata,"dummydatadummydata")
    
    const responseData = await draftOrderUpdate({
      orderId: editDraftOrder.id,
      originalOrderId: id,
      removeItems: JSON.stringify(removeItems),
      addedItems: JSON.stringify(addedItems),
      updateItems: JSON.stringify(updateItems),
      requestData: JSON.stringify(requestData),
      requestCustomData:JSON.stringify(requestCustomData)
    });
    console.log(responseData, "responseData", removeItems, id, selectedStore);
    if (responseData) {
     setTimeout(() => {
         navigate(`/customer-support/detail/${id}/${splitId}`);
      }, 5000);
    }
  }, [editDraftOrder, selectedCustomer, subtotal, tags, selectedProducts, selectedPayment, selectedStoreData,data, removeItems]);

  const transformedData = useMemo(() => {
    return allProducts
      .filter(product => product.status === "active")
      .flatMap(product =>
        product.variants.edges
          .filter(variant => Number(variant.node.outletId) === Number(selectedStore))
          .map(variant => {
            // Return the same structure with additional data
            return {
              id: Number(variant.node.id),
              image: product?.images?.edges[0]?.node?.source,
              price: variant.node.price,
              status: product.status,
              tags:product.tags,
              variantTitle: variant.node.title,
              title: product.title,
              handle: product.handle,
              outletId: variant.node.outletId,
              sku: variant.node.sku,
              quantity: 1,
              disabled: variant.node.inventoryQuantity <= 0,
              product: Number(product.id),
              stock: variant.node.inventoryQuantity
            };
          }));

  }, [allProducts, selectedStore]);

  const rows = transformedData || [];
  const breakpoints = useBreakpoints();

  const groupRowsByGroupKey = (groupKey, resolveId, data) => {
    let position = -1;
    const groups = data.reduce((groups, product) => {
      const groupVal = product[groupKey];
      if (!groups[groupVal]) {
        position += 1;

        groups[groupVal] = {
          position,
          products: [],
          id: resolveId(groupVal),
        };
      }
      groups[groupVal].products.push({
        ...product,
        position: position + 1,
      });

      position += 1;
      return groups;
    }, {});

    return groups;
  };

  const groupedProducts = groupRowsByGroupKey("handle", (handle) => `handle--${handle}`, filteredRows);
  Object.keys(groupedProducts).forEach((key) => {
    const products = groupedProducts[key]?.products || [];
    groupedProducts[key].title = products.length > 0 ? products[0]?.title || "Unnamed Group" : "Empty Group";
  });


  const { selectedResources, allResourcesSelected, handleSelectionChange, removeSelectedResources } = useIndexResourceState(filteredRows, {
    resourceFilter: ({ disabled }) => !disabled,
  });

  const productDataArray = [];
  const rowMarkup = Object.keys(groupedProducts).map((handle, index) => {
    const { products, position, id: product_id, title } = groupedProducts[handle];
    let selected = false;
    // Filter the variants based on the selected store
    const filteredVariants = products
      .filter(({ outletId }) => {
        const storeName = selectedStore;
        return parseInt(outletId) === parseInt(storeName);
      })
      .map(({ id, title, variantTitle, price, stock, sku, quantity, image }) => ({
        id,
        image,
        price,
        variantTitle,
        title,
        sku,
        quantity,
        productId: products[0]?.productId,
        stock: stock,
      }));

    // If there are no valid filtered variants, skip rendering
    if (filteredVariants.length === 0) {
      return null;
    }

    const allVariantsZeroStock = filteredVariants.every(({ stock }) => stock <= 0);
    const someProductsSelected = products.some(({ id }) => selectedResources.includes(id));
    const allProductsSelected = products.every(({ id }) => selectedResources.includes(id));
    if (allProductsSelected) {
      selected = true;
    } else if (someProductsSelected) {
      selected = "indeterminate";
    }


    const selectableRows = filteredRows.filter(({ disabled }) => !disabled);
    const rowRange = [
      selectableRows.findIndex((row) => row.id === products[0].id),
      selectableRows.findIndex((row) => row.id === products[products.length - 1].id),
    ];
    const parentImage = products[0]?.image;
    return (
      <Fragment key={product_id}>
        <IndexTable.Row
          rowType="data"
          selectionRange={rowRange}
          id={`Parent-${index}`}
          position={position}
          selected={selected}
          disabled={allVariantsZeroStock} // Disable if all variants have zero stock
          accessibilityLabel={`Select all products which have title ${title}`}
        >

          <IndexTable.Cell>
            <InlineStack blockAlign="center" >
              <Thumbnail source={parentImage ? parentImage : NoteIcon} alt={title} size="small" />
              <div style={{ marginLeft: '10px' }}>

                <Text as="span" variant="bodyMd" truncate>
                  {title}
                </Text></div>
            </InlineStack>
          </IndexTable.Cell>
          {/* <IndexTable.Cell id={product_id}>
            <Text as="span" variant="bodyMd" truncate>
              {title}
            </Text>
          </IndexTable.Cell> */}

          {products.length === 1 && selectedStore !== "" && (
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd" alignment="center" numeric>
                {products[0].stock < 0 ? 0 : products[0].stock}
              </Text>
            </IndexTable.Cell>
          )}
          {products.length === 1 && (
            <IndexTable.Cell>
              <Text as="span" variant="bodyMd" alignment="end" numeric>
                {`₹${products[0].price}`}
              </Text>
            </IndexTable.Cell>
          )}
        </IndexTable.Row>

        {products.length > 1 &&
          filteredVariants.map(({ id, variantTitle, price, position, stock, disabled }, rowIndex) => (
            <IndexTable.Row
              rowType="child"
              key={rowIndex}
              id={id}
              position={position}
              selected={selectedResources.includes(id) && stock > 0}
              disabled={disabled || stock <= 0} // Disable row if stock is zero
            >
              <IndexTable.Cell scope="row" headers={product_id}>
                <Text variant="bodyMd" as="span" truncate>
                  {variantTitle}
                </Text>
              </IndexTable.Cell>
              {selectedStore !== "" && (
                <IndexTable.Cell>
                  <Text as="span" variant="bodyMd" alignment="center" numeric>
                    {stock < 0 ? 0 : stock}
                  </Text>
                </IndexTable.Cell>
              )}
              <IndexTable.Cell>
                <Text as="span" variant="bodyMd" alignment="end" numeric>
                  {`₹${price}`}
                </Text>
              </IndexTable.Cell>
            </IndexTable.Row>
          ))}
      </Fragment>
    );
  });


  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const handleQuantityChange = (id, variantid, newQuantity, sku, stock,price) => {
    console.log(id,variantid,newQuantity,sku,stock,price,"id,variantid,newQuantity,sku,stock,price")
    if (newQuantity > stock) {
      setErrorMessages((prev) => ({ ...prev, [sku]: `Quantity cannot exceed available stock of ${stock}` }));
    } else {
      setErrorMessages((prev) => ({ ...prev, [sku]: "" }));
      setSelectedProducts(prevProducts => 
        prevProducts.map(product =>
          product.id === id ? { ...product, quantity: parseInt(newQuantity) } : product
        )
      );
      
      setAddedItems(addedItems.map(product =>
        product.id === variantid || product.id === id ? { ...product, quantity: newQuantity } : product
      ))

      setProductItemTags((prevItems) => {
        // Find the item to update
        const updatedItems = prevItems.map((item) => {
          if (item.id === id) {
              const tag = item.tag;
              if (tag) {
                const taxRate = taxRates[tag] || 0; // Get the tax rate for the tag
                const totalProductCost = parseFloat(price) * parseInt(newQuantity, 10); // Calculate total cost
                const calTaxAmount = totalProductCost - (totalProductCost * (100 / (100 + parseFloat(taxRate)))); // Calculate tax
                const taxAmount=calTaxAmount.toFixed(2);
                return {
                  ...item,
                  taxAmount
                 
                };
              }
            }
          
          return item; 
        });
        const uniqueItems = Array.from(new Map(updatedItems.map((item) => [item.id, item])).values());
        return uniqueItems;
      });
      
    }

  };

  const handleRemoveProduct = (id) => {
    const product = selectedProducts.find(product => product.id === id);
   
    setSelectedProducts(selectedProducts.filter(product => product.id !== id));
    const removeItemproduct = selectedProducts.find((product) => product.status === "old" && product.id === id);
    if(removeItemproduct){
      setRemoveItems((prevProducts) => [...prevProducts, removeItemproduct]);
    }
    
    setAddedItems(addedItems.filter(product => product.id !== id));

    
   
    const index = selectedResources.indexOf(id);
    if (index !== -1) {
      selectedResources.splice(index, 1);
    }

    if (product) {
      setErrorMessages((prev) => ({ ...prev, [product.sku]: "" }));
    }
  };
  const calculateSubtotal = () => {
    const total = selectedProducts.reduce((acc, product) => acc + product.price * product.quantity, 0);
   
    const quantity = selectedProducts.reduce((acc, product) => acc + product.quantity, 0);
    setSubtotal(total);
    setTotalQuantity(quantity);
    
  };
  const selectedCustomerData = async (customerId) => {
    const shopifyCustomerRecords = await api.shopifyCustomer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        ordersCount: true,
        defaultAddress: {
          id: true,
          name: true,
          address1: true,
          address2: true,
          city: true,
          zipCode: true,
          provinceCode: true,
          country: true,
          phone: true,
          company: true,
          country: true,
          province: true,
          firstName: true,
          lastName: true,
          countryCode: true,
        }
      },
      filter: { id: { equals: customerId } },
    });
    setSelectedCustomer(shopifyCustomerRecords[0]);
  };

  const getProductImage = async (product_id) => {
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
      filter: { id: { equals: product_id } },
    });

    const imageUrl = shopifyProductRecords[0]?.images?.edges[0]?.node?.source;
    return imageUrl || null;
  };

  const formatTaxLines = (taxLines) => {
    return taxLines?.map(taxLine => `${taxLine.title} ${parseFloat(taxLine.rate) * 100} %`).join(', ');
  };

  const calculateItemTaxes = (tags, quantity, price) => {
    if (price && quantity && Array.isArray(tags)) {
      const foundTag = tags.find(tag => targetTags.includes(tag)); 
      if (foundTag) {
        const taxRate = taxRates[foundTag] || 0; // Default to 0 if no tax rate found
        const totalProductCost = parseFloat(price) * parseInt(quantity);
        const taxAmount = totalProductCost - (totalProductCost * (100 / (100 + parseFloat(taxRate))));
        
        return {
          tag: foundTag,
          taxAmount: taxAmount.toFixed(2), // Tax amount rounded to 2 decimals
        };
      }
    }
    return null; // Return null if no applicable tax is found
  };

  const calculateOrderTotals = (data) => {
    let totalPrice = 0;
    let totalTax = 0;
    let totalQuantity = 0;

    if (data.lineItems && data.lineItems.edges) {
      const lineItems = data.lineItems.edges;
      // Loop through each line item
      for (const item of lineItems) {
        const node = item.node;
        if(node.currentQuantity != 0){
          // Add the price of the current item to totalPrice
          totalQuantity += node.currentQuantity;
          totalPrice += parseFloat(node.price) * parseInt(node.currentQuantity);
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

    // Total shipping price
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
  const calculateTotalItemsPrice = (data) => {
    let totalPrice = 0;
    let totalQuantity = 0;
    if (data.lineItems) {
      for (const item of data.lineItems) {
        // Add the price of the current item to totalPrice
        totalQuantity = item.quantity;
        totalPrice += parseFloat(item.price) * parseInt(totalQuantity);
        // Assuming quantity is part of the node structure    
      }
    }
    return {
      totalPrice: totalPrice.toFixed(2),          // Format to 2 decimal places
      totalQuantity: totalQuantity,                   // Total quantity of line items
    };

  };
  useEffect(() => {
    if (searchProducts) {
      const filtered = rows.filter(row =>
        row.title.toLowerCase().includes(searchProducts.toLowerCase())
      );
      setFilteredRows(filtered);
    } else {
      setFilteredRows(rows);
    }
  }, [searchProducts, transformedData]);

  useEffect(() => {
    if (selectedResources) {
      const selectedRows = filteredRows.filter((row) =>
        selectedResources.includes(row.id) &&
        Number(row.outletId) === Number(selectedStore) && row.stock > 0 // Ensure the quantity is greater than zero
      );
      const updatedSelectedRows = selectedRows.map((row) => {
        const existingProduct = selectedProducts.find((product) => product.id === row.id);
        return existingProduct ? { ...row, quantity: existingProduct.quantity } : row;
      });
     
      setSelectedProducts((prevSelectedProducts) => {
        const remainingSelectedProducts = prevSelectedProducts.filter((product) =>
          selectedResources.includes(product.id)
        );

        const newProducts = updatedSelectedRows.filter( (row) => !prevSelectedProducts.some((product) => product.id === row.id)
        );

        if (newProducts && newProducts.length > 0) {
          const selectedItems = newProducts.map((variant) => ({
            id: variant.id,
            quantity: variant.quantity,
          }));

          setAddedItems((prevSelectedItems) => [...prevSelectedItems, ...selectedItems]);

          const newProductsMAppingForTax = newProducts
              .map(newProduct => {
                const { id, product, price, quantity, tags } = newProduct;
                if (product && Array.isArray(tags)) {
                  const foundTag = tags.find(tag => targetTags.includes(tag)); // Find matching tag

                  if (foundTag) {
                    const taxRate = taxRates[foundTag] || 0; // Get the tax rate, default to 0
                    const totalProductCost = parseFloat(price) * parseInt(quantity, 10); // Calculate total cost
                    const taxAmount = totalProductCost - (totalProductCost * (100 / (100 + parseFloat(taxRate)))); // Calculate tax

                    return {
                      id,
                      tag: foundTag,
                      taxAmount: taxAmount.toFixed(2)
                    };
                  }
                }

                return null; // Return null if no valid data
              })
              .filter(item => item !== null); // Filter out null entries that didn't match any valid data
            // Ensure no nested arrays in state
            setProductItemTags((prevItems) => {
              const allItems = [...prevItems, ...newProductsMAppingForTax];
              const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
              return uniqueItems;
            });
        }

        return [...remainingSelectedProducts, ...newProducts];
      });
     
    setAddedItems((prevSelectedItems) => {
      return prevSelectedItems.filter(item => selectedResources.includes(item.id));
    });

    }
  }, [selectedResources,itemStock,productItemTags]);
 

  useEffect(() => {
    calculateSubtotal();
  }, [selectedProducts]);

  useEffect(() => {
    if (priceOrderData) {
      const priceDatas = calculateOrderTotals(priceOrderData);
      setPriceOrder(priceDatas);
      const OrderTotal = selectedProducts.reduce((acc, product) => {
          return acc + parseFloat(product.price) * parseInt(product.quantity);
      }, 0);
    
      const calculateOrderTotal = (parseFloat(priceDatas.totalShippingPrice)+parseFloat(OrderTotal))-parseFloat(priceDatas.totalDiscount)
      seOrderTotal(calculateOrderTotal);
      const lineItems =priceOrderData.lineItems.edges;
      let taxTotals = {
        active: 0,
        old: 0,
      };
    const updatedProducts = selectedProducts.map((product) => {
        // Match by id and get tags for the lineItem
        const matchingLineItem = lineItems.find((lineItem) => {
          return lineItem.node.id === product.id; // Match by product id
        });
      
        const lineItemTags = matchingLineItem?.node.product.tags || product.tags; 
        // Check if any of the product tags match the lineItem's tags
        if (lineItemTags) {
          const foundTag =lineItemTags?.find((tag) => targetTags.includes(tag)); // Find tag in targetTags
          if (foundTag) {
            const taxRate = taxRates[foundTag] || 0; // Get tax rate for the tag or default to 0
            const totalProductCost =parseFloat(product.price) * parseInt(product.quantity);
            // Calculate inclusive tax amount
            const taxAmount =
              totalProductCost -
              totalProductCost * (100 / (100 + parseInt(taxRate)));
  
            return {
              ...product,
              taxAmount,
            };
          }
        }
      
    
      return null; // Return null if no processing is required
    })
    .filter(Boolean); // Filter out null values
    const totalTax = updatedProducts.reduce((sum, product) => sum + product.taxAmount, 0);
    setTotalTaxes(totalTax.toFixed(2))
      
    }
  }, [priceOrderData,selectedProducts]);

  useEffect(() => {
    if (customerData) {
      const customerList = customerData.map(customer => ({
        label: `${customer.firstName} ${customer.lastName}`,
        value: customer.id
      }));
      setCustomers(customerList);
    }
  }, [customerData]);

  useEffect(() => {
    if (stores) {
      const storeList = stores.map(store => ({
        label: store.storeName,
        value: store.erpStoreId
      }));
      setAllStores(storeList);
    }
  }, [stores]);


  useEffect(() => {
    if (data && data.length) {
      setEditDraftOrder({
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        phone: data[0].phone,
        notes: data[0].note,
        noteAttributes: data[0].noteAttributes,
        currency: data[0].currency,
        currentSubtotalPrice: data[0].currentSubtotalPrice,
        currentTotalTax: data[0].currentTotalTax,
        currentTotalPrice: data[0].currentTotalPrice,
        taxLines: data[0].taxLines,
        billingAddress: data[0].billingAddress,
        shippingAddress: data[0].shippingAddress,
        tags: data[0].tags,
        financialStatus: data[0].financialStatus,
        orderNumber: data[0].orderNumber,
        fulfillmentStatus: data[0].fulfillmentStatus,
        customer: data[0].customer,
        lineItems: data[0].lineItems,
      });
      const fetchStockByVariantId = async (variantId) => {
        const responseData = await api.shopifyProductVariant.findMany({
          filter: {
            id: { equals: variantId }
          },
          select: {
            id: true,
            inventoryQuantity: true,
            outletId: true,
            product:{
              tags:true
            }
          }
        });
        const stock = responseData[0]?.inventoryQuantity || 0;
        const tags = responseData[0]?.product?.tags || [];
        return { stock, tags };
      };

      setTags(data[0].tags);
      setSelectedPayment(data[0].financialStatus);
      setRadioValue(data[0].noteAttributes.length ? 'manual' : 'auto');
      setSelectedStore(data[0].noteAttributes.length ? data[0].noteAttributes[0].value : "");
      setSelectedStoreData(data[0].noteAttributes.length && data[0].noteAttributes);
      selectedCustomerData(data[0].customer.id);
      
   
      const products = data[0].lineItems.filter(product => product.currentQuantity > 0).map(product => {
        if (!selectedResources.includes(product.id)) {
          selectedResources.push(product.id);
        }
        return {
          id: product.id,
          title: product.title,
          variantId: product.variant,
          price: product.price,
          quantity: product.currentQuantity,
          sku: product.sku,
          variantTitle: product.variantTitle,
          product: product.product,
          status:"old"
        };
      });

      setSelectedProducts(products);
      products.length && setShowProducts(true);


      setListedProduct(products);
      const subtotal = products.reduce((acc, product) => acc + product.price * product.currentQuantity, 0);
      setSubtotal(subtotal);
      setTotalQuantity(products.reduce((acc, product) => acc + product.currentQuantity, 0));

      const fetchProductImages = async () => {
        if (data[0].lineItems.length) {
          const images = {};
          const itemstock = {};
          for (const item of data[0].lineItems) {
            const imageUrl = await getProductImage(item.product);
            images[item.product] = imageUrl;
            const { stock, tags }  = await fetchStockByVariantId(item.variant);
            const {tag,taxAmount} = calculateItemTaxes(tags,item.currentQuantity,item.price);
            itemstock[item.variant] = {
              stock,
              tags,
              tag,
              taxAmount
            };
          }
          setItemStock(itemstock);
          setProductImages(images);
        }

      };

      if (data[0]) {
        fetchProductImages();
      }
    }
  }, [data]);

  useEffect(() => {
    if (data && data.length) {
      setOrderData(data[0]);
      let getLineItem = data[0].lineItems;
      let itemsData = calculateTotalItemsPrice(data[0]);
      setPriceCalculation(itemsData);

    }

  }, [data]);

  useEffect(() => {
    if (tags.length || selectedCustomer) {
      setIsEditing(true);
    }
  }, [selectedPayment, tags, selectedCustomer, selectedResources]);
  const modalStyles = {
    overflowX: 'hidden',
  };

  const toggleModal = () => setIsModalActive((active) => !active);

  const handleSelectChange = (value) => {
    setPendingStore(value);
    const selectStore = stores.find((store) => store.erpStoreId === value);
    const data = [
      { key: "_outletId", value: selectStore.erpStoreId },
      { key: "_userPinCode", value: selectStore.pinCode },
      { key: "_storeName", value: selectStore.storeName },
      { key: "_storeCity", value: selectStore.city },
      { key: "_storeState", value: selectStore.state },
      { key: "_storeCode", value: selectStore.storeCode },

    ];

    setSelectedStoreData(data);
    setIsModalActive(true);
  };

  const handlecheckboxChange = (value) => {
    setCustomerInvoice(value); // Update parent state with true/false
  };


  const deleteSelectedItems = useCallback(() => {
    removeSelectedResources(selectedResources);
    setReAssignStatus(true);
    handleSelectionChange([]);
  }, [selectedResources, handleSelectionChange, removeSelectedResources]);

  const handleConfirm = () => {
    setSelectedStore(pendingStore);
    setSelectedProducts([]);
    setAddedItems([]);
    setRemoveItems(data[0].lineItems)
    deleteSelectedItems();
    toggleModal();
  };
 
  return (
    <Box paddingBlockEnd="400">
      <Page
        fullWidth
        compactTitle
        title="Edit order"
        backAction={{ content: "Orders", onAction: () => navigate(-1) }}
        primaryAction={<Button onClick={confirmEdit} loading={isLoading} variant='primary' disabled={!isEditing}>Save</Button>}
      >
        <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="400">
          <BlockStack gap="400">
            <Card roundedAbove="sm">
              <BlockStack gap="100">
                <InlineStack align="start" gap="400">
                  {/* <RadioButton
                    label="Auto"
                    checked={radioValue === 'auto'}
                    id="auto"
                    name="store"
                    onChange={handleChangeRadio}
                  /> */}
                  <RadioButton
                    label="Manual"
                    id="manual"
                    name="store"
                    checked={radioValue === 'manual'}
                    onChange={handleChangeRadio}
                  />
                </InlineStack>
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <TextComponent textTitle="Products" textVariant="headingSm" textAs="h6" />
                </InlineStack>
                <TextFieldComponent textPlaceHolder="Search products" textName="search" textValue={searchProducts} onValueChange={({ value }) => setSearchProducts(value)}>
                  <Button size="large" onClick={() => {
                    setProductLists(true);
                    setShowProducts(false);
                  }}>
                    Browse
                  </Button>
                </TextFieldComponent>
              </BlockStack>
              {selectedProducts.length ? (
                <BlockStack gap="400">
                  <Box paddingBlockStart="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <Box>
                        <TextComponent
                          textAs="h6"
                          textVariant="headingSm"
                          textTitle="Product"
                        />
                      </Box>
                      <Box>
                        <InlineStack gap="800">
                          <Box paddingInlineEnd="400">
                            <TextComponent
                              textAs="h6"
                              textVariant="headingSm"
                              textTitle="Quantity"
                            />
                          </Box>
                          <TextComponent
                            textAs="h6"
                            textVariant="headingSm"
                            textTitle="Total"
                          />
                          <TextComponent
                            textAs="h6"
                            textVariant="headingSm"
                            textTitle="Delete"
                          />
                        </InlineStack>
                      </Box>
                    </InlineStack>
                  </Box>
                  {selectedProducts && selectedProducts.map((row, index) => (
                    <Box key={index} paddingBlockEnd="400">
                      <Divider />
                      <Box paddingBlockStart="400">
                        <InlineStack align="space-between" blockAlign="center">
                          <Box>
                            <InlineStack align="start">
                              <Thumbnail
                                source={productImages[row.product] || row.image || NoteIcon}
                                alt="Black choker necklace"
                                size="small"
                              />
                              <Box as="span" paddingInlineStart="400">
                                <Box paddingBlockEnd="100" width="280">
                                  <Link url="#" removeUnderline>
                                    <Text as="span" variant="bodyMd" fontWeight="semibold" alignment="start">
                                      {row?.title}
                                    </Text>
                                  </Link>
                                </Box>
                                <Text as="span" variant="bodyMd" alignment="start">
                                  SKU: {row?.sku}
                                </Text>
                                {errorMessages[row.sku] && (
                                  <Text as="span" variant="bodySm" tone="critical">
                                    {errorMessages[row.sku]}
                                  </Text>
                                )}
                                {row.variantId && itemStock[row.variantId]?.stock <= 0 && (
                                  <Text as="span" variant="bodySm" tone="critical">Out of stock</Text>
                                )
                                }
                              </Box>
                            </InlineStack>
                          </Box>
                          <Box>
                            <InlineStack gap="800">
                              <Box width="80">
                                <TextField
                                  type="number"
                                  autoComplete="off"
                                  min="1"
                                  value={row?.quantity}
                                  disabled={(row.stock ?? itemStock[row.variantId]?.stock) <= 0}
                                  onChange={(e) => handleQuantityChange(row.id, row.variantId, parseInt(e), row.sku, row.stock ?? itemStock[row.variantId]?.stock,row?.price)}
                                />
                              </Box>
                              <Text
                                as="span"
                                variant="bodyMd"
                                alignment="end"
                                numeric
                              >
                                {`₹${(Number(row?.price) * Number(row?.quantity)).toFixed(2)}`}
                              </Text>
                              
                              
                              <Button
                                icon={DeleteIcon}
                                onClick={() => handleRemoveProduct(row.id)}
                              ></Button>
                              
                            </InlineStack>
                            {row.variantId && itemStock[row.variantId]?.tag && (
                                <InlineStack gap="800">
                                   <TextComponent
                                    textAs="h6"
                                    textVariant="headingXs"
                                    textTitle={`Taxs (included) ${itemStock[row.variantId]?.tag.replace(/^tax_/, '')}%`}
                                  />
                                  <TextComponent
                                  textAs="h6"
                                  textVariant="headingXs"
                                  textTitle={`₹ ${itemStock[row.variantId]?.taxAmount}`}
                                />
                                 <Text
                                as="span"
                                variant="bodyMd"
                                alignment="start"
                                numeric
                              >
                               
                              </Text>
                              
                              </InlineStack>
                              )}

                              {productItemTags.length>0 && productItemTags.map((item) =>
                                item.id === row.id && item.tag && item.tag !== "tag_0" && (
                                  <InlineStack key={item.id} gap="800">
                                    <TextComponent
                                      textAs="h6"
                                      textVariant="headingXs"
                                      textTitle={`Taxs (included) ${item.tag.replace(/^tax_/, "")}%`}
                                    />
                                    <TextComponent
                                      textAs="h6"
                                      textVariant="headingXs"
                                      textTitle={`₹ ${item.taxAmount}`}
                                    />
                                  </InlineStack>
                                )
                              )}
                          </Box>
                        </InlineStack>
                      </Box>
                    </Box>
                  ))}
                </BlockStack>
              ) : null}
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <TextComponent textTitle="Payment" textVariant="headingSm" textAs="h6" />
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
                        textTitle={`${totalQuantity} items`}
                        textVariant="headingXs"
                        textAs="h6"
                      />
                      <TextComponent
                        textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${subtotal}`}
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
                        textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${orderTotal.toFixed(2)}`}
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
                  {orderTotal>priceOrder?.totalPaid &&(
                    <Box paddingBlock="150">
                    <InlineStack align="space-between">
                      <TextComponent
                        textTitle="Remaining balance"
                        textVariant="headingXs"
                        textAs="h6"
                      />
                      <TextComponent
                        textTitle=""
                        textVariant="headingXs"
                        textAs="h6"
                      />
                      <TextComponent
                        textTitle={`${orderData?.currency === "INR" ? "₹" : "$"}${parseFloat(orderTotal) - (priceOrder?.totalPaid || 0)}`}
                        textVariant="headingXs"
                        textAs="h6"
                      />
                    </InlineStack>
                  </Box>)
                  }
                 
                </Card>
              </BlockStack>
              {showProducts && selectedProducts.length ? <Box paddingBlockStart="300">
                <InlineStack align="end">
                  <Box paddingInlineEnd="100">
                    <Select
                      placeholder="Select payment method"
                      options={[
                        { label: 'Collect payment', value: 'collectPayment', disabled: true },
                        { label: 'Cash on delivery', value: 'pending' },
                        { label: 'Mark as paid', value: 'paid', disabled: true },
                      ]}
                      onChange={(value) => setSelectedPayment(value)}
                      value={selectedPayment}
                      error={selectedPayment ? "" : "Please select payment method"}
                    />
                  </Box>
                  <Box className="required"></Box>
                </InlineStack>
              </Box> : <Box paddingBlockStart="300">
                <Text as="h6" variant="headingSm">
                  Add a product to calculate total and view payment options.
                </Text>
              </Box>}
            </Card>
          </BlockStack>
          <BlockStack gap={{ xs: "400", md: "200" }}>
            <Card roundedAbove="sm">
              <BlockStack gap="100">
                <BlockStack gap="50">

                  <TextComponent textTitle="Store Selection" textVariant="headingSm" textAs="h6" />
                  {radioValue === 'auto' ? (
                    <TextComponent textVariant="bodyMd" textAs="h3" textTone="subdued">
                      Auto
                    </TextComponent>
                  ) : (
                    <Select
                      placeholder="Select"
                      options={allStores}
                      onChange={handleSelectChange}
                      value={selectedStore}
                    />
                  )}
                </BlockStack>

                <CheckboxComponent
                  checkBoxLabel="Collect difference amount"
                  checkBoxChecked={customerInvoice}
                  handleChange={handlecheckboxChange}
                />
              </BlockStack>

            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="100">
                <InlineStack align="space-between">
                  <TextComponent textTitle="Notes" textVariant="headingSm" textAs="h6" />
                  <ButtonComponent buttonVariant="tertiary" buttonSize="slim" buttonIcon={EditIcon} buttonOnClick={() => setActiveNotes(!activeNotes)} />
                </InlineStack>
                <TextComponent textVariant="bodyMd" textAs="h3" textTone="subdued">
                  {editDraftOrder && editDraftOrder.notes ? editDraftOrder.notes : "No notes"}
                </TextComponent>
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              {editDraftOrder && editDraftOrder.customer ? (
                <BlockStack gap="100">
                  <InlineStack align="space-between">
                    <InlineStack align="start">
                      <TextComponent textTitle="Customer" textVariant="headingSm" textAs="h6" />
                      <Box className="required"></Box>
                    </InlineStack>
                    {selectedCustomer?.firstName && <ButtonComponent
                      buttonVariant="tertiary"
                      buttonSize="slim"
                      buttonIcon={DeleteIcon}
                      buttonOnClick={() => {
                        setEditDraftOrder({
                          ...editDraftOrder,
                          customer: null
                        });
                        setSelectedCustomer({});
                      }} />}
                  </InlineStack>
                  {selectedCustomer?.firstName ?
                    <>
                      <Link url="Example App" removeUnderline>
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </Link>
                      <Link url="Example App" removeUnderline>
                        {selectedCustomer.ordersCount} orders
                      </Link>
                      <TextComponent textTitle="Contact information" textVariant="headingSm" textAs="h6" />
                      {selectedCustomer.email ? <Link url="Example App" removeUnderline>
                        {selectedCustomer.email}
                      </Link> : <TextComponent textAs="p" textVariant="bodyMd" textTone="subdued" textTitle="No email"></TextComponent>}
                      {selectedCustomer.phone ? (
                        <Link url="Example App" removeUnderline>
                          {selectedCustomer.phone}
                        </Link>
                      ) : null}
                      {selectedCustomer?.defaultAddress && (
                        <Box>
                          <TextComponent textTitle="Shipping address" textVariant="headingSm" textAs="h6" />
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={selectedCustomer?.defaultAddress?.name}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={selectedCustomer?.defaultAddress?.address1}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={selectedCustomer?.defaultAddress?.address2}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={`${selectedCustomer?.defaultAddress?.zipCode} ${selectedCustomer?.defaultAddress?.city} ${selectedCustomer?.defaultAddress?.provinceCode}`}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={selectedCustomer?.defaultAddress?.country}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={selectedCustomer?.defaultAddress?.phone}></TextComponent>
                          <TextComponent textTitle="Billing address" textVariant="headingSm" textAs="h6" />
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle="Same as shipping address"></TextComponent>
                        </Box>
                      )}
                    </> : <>
                      <Link url="Example App" removeUnderline>
                        {editDraftOrder?.customer?.firstName} {editDraftOrder?.customer?.lastName}
                      </Link>
                      <Link url="Example App" removeUnderline>
                        {editDraftOrder?.customer?.ordersCount} orders
                      </Link>
                      <TextComponent textTitle="Contact information" textVariant="headingSm" textAs="h6" />
                      {editDraftOrder?.customer?.email ? <Link url="Example App" removeUnderline>
                        {editDraftOrder?.customer?.email}
                      </Link> : <TextComponent textAs="p" textVariant="bodyMd" textTone="subdued" textTitle="No email"></TextComponent>}
                      {editDraftOrder?.customer?.phone ? (
                        <Link url="Example App" removeUnderline>
                          {editDraftOrder?.customer?.phone}
                        </Link>
                      ) : null}
                      {editDraftOrder?.shippingAddress && (
                        <Box>
                          <TextComponent textTitle="Shipping address" textVariant="headingSm" textAs="h6" />
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={editDraftOrder?.shippingAddress?.name}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={editDraftOrder?.shippingAddress?.address1}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={editDraftOrder?.shippingAddress?.address2}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={`${editDraftOrder?.shippingAddress?.zipCode} ${editDraftOrder?.shippingAddress?.city} ${editDraftOrder?.shippingAddress?.provinceCode}`}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={editDraftOrder?.shippingAddress?.country}></TextComponent>
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle={editDraftOrder?.shippingAddress?.phone}></TextComponent>
                          <TextComponent textTitle="Billing address" textVariant="headingSm" textAs="h6" />
                          <TextComponent textAs="p" textVariant="bodyLg" textTone="subdued" textTitle="Same as shipping address"></TextComponent>
                        </Box>
                      )}
                    </>}
                </BlockStack>
              ) : (
                <BlockStack gap="100">
                  <InlineStack align="start">
                    <TextComponent textTitle="Customer" textVariant="headingSm" textAs="h6" />
                    <Box className="required"></Box>
                  </InlineStack>
                  <ComboboxComponent
                    fieldName="customer"
                    placeHolder="Search customer"
                    chooses={customers}
                    onValueChange={handleValues}
                    selectedValue={selectedCustomer.id}
                    error={selectedCustomer.id ? "" : "Please select customer"}
                  >
                    <Icon source={SearchIcon} />
                  </ComboboxComponent>
                </BlockStack>
              )}
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="start">
                  <TextComponent textTitle="Tags" textVariant="headingSm" textAs="h6" />
                  <Box className="required"></Box>
                </InlineStack>
                <CreateMultiSelectComponent
                  setTags={setTags}
                  tags={tags}

                />
              </BlockStack>
            </Card>
          </BlockStack>
        </InlineGrid>
        {activeNotes && (
          <ModalComponent
            modalTitle="Add Notes"
            modalPrimaryButton="Done"
            modalActive={activeNotes}
            handleModalClose={handleNoteModelClose}
            handleModelSave={handleNoteModelClose}
          >
            <BlockStack vertical gap="400">
              <TextFieldComponent textLabel="Notes" textName="notes" textValue={editDraftOrder && editDraftOrder.notes} onValueChange={handleValues} />
            </BlockStack>
          </ModalComponent>
        )}
        {activeCreateCustomer && (
          <ModalComponent modalPrimaryButton="Save customer" modalActive={activeCreateCustomer} handleModalClose={handleCreateCustomerModelClose}>
            <BlockStack vertical gap="400">
              <TextFieldComponent textLabel="First name" textName="firstName" textValue={activeCreateCustomer.firstName} onValueChange={handleValues} />
            </BlockStack>
          </ModalComponent>
        )}
        {productLists && (
          <ModalComponent
            modalTitle="Products"
            modalPrimaryButton="Done"
            modalActive={productLists}
            handleModalClose={handleProductListsModelClose}
            handleModelSave={handleProductListsModelSave}
            handleShowProducts={setShowProducts}
            style={modalStyles}
          >
            <Box paddingBlockEnd="400">
              <TextFieldComponent
                textPlaceHolder="Search products"
                textName="search"
                textValue={searchProducts}
                onValueChange={({ value }) => setSearchProducts(value)}
              />
            </Box>

            {/* IndexTable adjusted to fit inside the modal and avoid horizontal scroll */}
            <div style={{ width: '100%', overflowX: 'auto' }}> {/* Wrap the table in a div with styles */}
              <IndexTable
                condensed={breakpoints.smDown}
                onSelectionChange={handleSelectionChange}
                selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
                resourceName={resourceName}
                itemCount={filteredRows.length}
                headings={selectedStore === "" ? [
                  { title: "Name", id: "column-header--size" },
                  {
                    id: "column-header--price",
                    title: "Price",
                    alignment: "end",
                    hidden: false,
                  }
                ] : [
                  { title: "Name", id: "column-header--size" },
                  { title: "Stock", id: "column-header--stock" },
                  {
                    id: "column-header--price",
                    title: "Price",
                    alignment: "end",
                    hidden: false,
                  }
                ]}
              >
                {rowMarkup}
              </IndexTable>
            </div>
          </ModalComponent>
        )}
        {editConfirm && (
          <ModalComponent
            modalTitle="Confirm Edit"
            modalPrimaryButton="Save"
            modalActive={editConfirm}
            modalSize="medium"
            handleModalClose={handleEditConfirmModelClose}
            handleModelSave={handleEditConfirmModelSave}
          >
            <TextContainer>
              <p>Do you want to save this order modification?</p>
            </TextContainer>
          </ModalComponent>
        )}
        <ModalComponent
          modalTitle="Confirm Store Selection"
          modalPrimaryButton="Done"
          modalActive={isModalActive}
          handleModalClose={toggleModal}
          modalSize="medium"
          handleModelSave={handleConfirm} >
          <TextContainer>
            <p>Are you sure you want to change the store? Changing the store will remove any products you’ve already added. You will need to add products for the newly selected store.</p>
          </TextContainer>
        </ModalComponent>

      </Page>
    </Box>
  );
};

export default EditDraftOrderPage;