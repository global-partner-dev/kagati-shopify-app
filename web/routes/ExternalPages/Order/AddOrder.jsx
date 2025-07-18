/**
 * AddDraftOrderPage Component
 *
 * This component renders the interface for creating and managing draft orders within a Shopify store.
 * It allows users to select customers, browse and select products, assign stores, add notes, and choose
 * payment methods. Additionally, it supports creating new customers and managing store inventories 
 * related to the order.
 *
 * Features:
 * - Customer selection and management, including creating new customers.
 * - Product browsing and filtering with real-time stock checks per store.
 * - Store selection, either manually or automatically assigned.
 * - Dynamic calculation of order totals, taxes, and item quantities.
 * - Payment method selection and order submission.
 * - Integration with Shopify Polaris and Gadget API for seamless data management and UI.
 *
 * Usage:
 *
 * <AddDraftOrderPage />
 */

import React, { Fragment, useState, useEffect, useCallback, useRef,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Page, InlineGrid, BlockStack, InlineStack, Card, Button, Icon, Link, Box, Text, Divider,
  useIndexResourceState, IndexTable, useBreakpoints, Thumbnail, TextField, Spinner, Select, RadioButton, FormLayout, Checkbox,
  Banner
} from "@shopify/polaris";
import { EditIcon, SearchIcon, NoteIcon, DeleteIcon, PersonAddIcon } from "@shopify/polaris-icons";
import TextComponent from "../../../components/TextComponent";
import TextFieldComponent from "../../../components/TextFieldComponent";
import ButtonComponent from "../../../components/ButtonComponent";
import { useFindMany, useGlobalAction } from "@gadgetinc/react";
import { api } from "../../../api";
import ComboboxComponent from "../../../components/ComboboxComponent";
import ModalComponent from "../../../components/ModalComponent";
import CreateMultiSelectComponent from "../../../components/CreateMultiSelectComponent";

const AddDraftOrderPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [activeNotes, setActiveNotes] = useState(false);
  const [createCustomer, setCreateCustomer] = useState({
    accepts_marketing: true,
    tax_exempt: false,
    country: "India",
    country_code: "IN",
    state: "Andhra Pradesh",
  });
  const [activeCreateCustomer, setActiveCreateCustomer] = useState(false);
  const [productLists, setProductLists] = useState(false);
  const [addDraftOrder, setAddDraftOrder] = useState({});
  const [searchProducts, setSearchProducts] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [tags, setTags] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedStoreData, setSelectedStoreData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [radioValue, setRadioValue] = useState('manual');
  const [isEditing, setIsEditing] = useState(false);
  const [productStock, setProductStock] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [customerData, setCustomerData] = useState([]);
  const [rowMarkup, setRowMarkup] = useState(null);
  const [productDataList, setProductDataList] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [productLoading, setProductLoading] = useState(true);

  const INDIAN_STATES_AND_UT = [
    { label: "Andhra Pradesh", value: "Andhra Pradesh", code: "AP" },
    { label: "Arunachal Pradesh", value: "Arunachal Pradesh", code: "AR" },
    { label: "Assam", value: "Assam", code: "AS" },
    { label: "Bihar", value: "Bihar", code: "BR" },
    { label: "Chhattisgarh", value: "Chhattisgarh", code: "CT" },
    { label: "Goa", value: "Goa", code: "GA" },
    { label: "Gujarat", value: "Gujarat", code: "GJ" },
    { label: "Haryana", value: "Haryana", code: "HR" },
    { label: "Himachal Pradesh", value: "Himachal Pradesh", code: "HP" },
    { label: "Jharkhand", value: "Jharkhand", code: "JH" },
    { label: "Karnataka", value: "Karnataka", code: "KA" },
    { label: "Kerala", value: "Kerala", code: "KL" },
    { label: "Madhya Pradesh", value: "Madhya Pradesh", code: "MP" },
    { label: "Maharashtra", value: "Maharashtra", code: "MH" },
    { label: "Manipur", value: "Manipur", code: "MN" },
    { label: "Meghalaya", value: "Meghalaya", code: "ML" },
    { label: "Mizoram", value: "Mizoram", code: "MZ" },
    { label: "Nagaland", value: "Nagaland", code: "NL" },
    { label: "Odisha", value: "Odisha", code: "OR" },
    { label: "Punjab", value: "Punjab", code: "PB" },
    { label: "Rajasthan", value: "Rajasthan", code: "RJ" },
    { label: "Sikkim", value: "Sikkim", code: "SK" },
    { label: "Tamil Nadu", value: "Tamil Nadu", code: "TN" },
    { label: "Telangana", value: "Telangana", code: "TG" },
    { label: "Tripura", value: "Tripura", code: "TR" },
    { label: "Uttar Pradesh", value: "Uttar Pradesh", code: "UP" },
    { label: "Uttarakhand", value: "Uttarakhand", code: "UK" },
    { label: "West Bengal", value: "West Bengal", code: "WB" },
    { label: "Andaman and Nicobar Islands", value: "Andaman and Nicobar Islands", code: "AN" },
    { label: "Chandigarh", value: "Chandigarh", code: "CH" },
    { label: "Dadra and Nagar Haveli and Daman and Diu", value: "Dadra and Nagar Haveli and Daman and Diu", code: "DN" },
    { label: "Delhi", value: "Delhi", code: "DL" },
    { label: "Lakshadweep", value: "Lakshadweep", code: "LD" },
    { label: "Puducherry", value: "Puducherry", code: "PY" },
    { label: "Ladakh", value: "Ladakh", code: "LA" }
  ];

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

  const [{ data: draftOrderData, fetching: draftOrderFetching, error: draftOrderError }, draftOrderAdd] = useGlobalAction(api.createOrder);

  const [{ data: createCustomerData, fetching: createCustomerFetching, error: createCustomerError }, createNewCustomer] = useGlobalAction(api.createCustomer);

  const [{ data: stores, fetching: storesFetching, error: storesError }] = useFindMany(api.khagatiStores, {
    select: {
      erpStoreId: true,
      storeCode: true,
      storeName: true,
      city: true,
      state: true,
      pinCode: true,
    }
  });

  const bottomRef = useRef(null); 
  const [{ data: productData = [], fetching: productFetching, error: productError }] = useFindMany(api.shopifyProduct, {
    variables: {
      first: 10 ,// Fetch the maximum allowed items per request
      after: cursor
    },
    select: {
      id: true,
      title: true,
      status:true,
      handle:true,
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

  const [{ data: customerList, fetching: customerListFetching, error: customerListError }] = useFindMany(api.shopifyCustomer, {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      ordersCount: true,
      defaultAddress: {
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

  useEffect(() => {
    if (customerList) {
      setCustomerData(customerList);
    }
  }, [customerList])

  // const fetchStockBySkuAndStore = async (sku, storeId) => {
  //   const responseData = await api.erpStock.findMany({
  //     filter: {
  //       itemReferenceCode: { equals: sku },
  //       outletId: { equals: storeId }
  //     },
  //     select: {
  //       stock: true,
  //       itemReferenceCode: true,
  //       outletId: true,
  //     }
  //   });
  //   const stock = responseData[0]?.stock || 0;
  //   setProductStock((prev) => ({ ...prev, [sku]: stock }));
  //   return stock;
  // };

  const selectedCustomerData = useCallback(async () => {
    const shopifyCustomerRecord = customerData.find(customer => customer.id === addDraftOrder.customer);
    setSelectedCustomer(shopifyCustomerRecord);
  }, [addDraftOrder]);

  const handleValues = ({ name, value }) => {
    setAddDraftOrder({
      ...addDraftOrder,
      [name]: value,
    });
  };

  const handleCreateCustomerValues = ({ name, value }) => {
    setCreateCustomer({
      ...createCustomer,
      [name]: value,
    });
  };

  const handleCreateCustomerModelSave = useCallback(async () => {
    const isEmailAlreadyExist = customerData.find((customer) => customer.email === createCustomer.email);
    if (isEmailAlreadyExist && isEmailAlreadyExist.email) {
      console.log("i am here already exist");
    } else {
      const requestData = {
        first_name: createCustomer.first_name,
        last_name: createCustomer.last_name,
        email: createCustomer.email,
        verified_email: true,
        phone: createCustomer.phone,
        tax_exempt: createCustomer.tax_exempt,
        accepts_marketing: createCustomer.accepts_marketing,
        addresses: [
          {
            "name": createCustomer.first_name + " " + createCustomer.last_name,
            "first_name": createCustomer.first_name,
            "last_name": createCustomer.last_name,
            "phone": createCustomer.phone,
            "address1": createCustomer.address1,
            "address2": createCustomer.address2,
            "company": createCustomer.company,
            "city": createCustomer.city,
            "province": createCustomer.state,
            "province_code": INDIAN_STATES_AND_UT.find(({ value }) => value === createCustomer.state)?.code,
            "country_code": createCustomer.country_code,
            "country_name": createCustomer.country,
            "zip": createCustomer.zip,
            "default": true,
          }
        ]
      }
      const responseData = await createNewCustomer({ requestData: JSON.stringify(requestData) });
      if (responseData.data.id) {
        handleCreateCustomerModelClose();
        setCreateCustomer({
          accepts_marketing: true,
          tax_exempt: false,
          country: "India",
          country_code: "IN",
        });
        // setCustomerData([...customerData, { ...requestData, id: responseData.data.id }]);
        // setCustomers([...customers, { label: `${createCustomer.first_name} ${createCustomer.last_name}`, value: responseData.data.id }]);
      }
    }
  }, [createCustomer, customerData, createNewCustomer, handleCreateCustomerModelClose, customers, setCustomers, setCustomerData]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    const taxLinesValue = [
      {
        "rate": 0.18,
        "price": subtotal ? String(`${Number((subtotal * 0.18).toFixed(2))}`) : "₹0.00",
        "title": "IGST",
        "price_set": {
          "shop_money": {
            "amount": subtotal ? String(`${Number((subtotal * 0.18).toFixed(2))}`) : "₹0.00",
            "currency_code": "INR"
          },
          "presentment_money": {
            "amount": subtotal ? String(`${Number((subtotal * 0.18).toFixed(2))}`) : "₹0.00",
            "currency_code": "INR"
          }
        },
        "channel_liable": false
      }
    ];
    const addressValue = {
      "zip": selectedCustomer?.defaultAddress?.zipCode ? selectedCustomer?.defaultAddress?.zipCode : null,
      "city": selectedCustomer?.defaultAddress?.city ? selectedCustomer?.defaultAddress?.city : null,
      "name": selectedCustomer?.defaultAddress?.name ? selectedCustomer?.defaultAddress?.name : null,
      "phone": selectedCustomer?.defaultAddress?.phone ? selectedCustomer?.defaultAddress?.phone : null,
      "company": selectedCustomer?.defaultAddress?.company ? selectedCustomer?.defaultAddress?.company : null,
      "country": selectedCustomer?.defaultAddress?.country ? selectedCustomer?.defaultAddress?.country : null,
      "address1": selectedCustomer?.defaultAddress?.address1 ? selectedCustomer?.defaultAddress?.address1 : null,
      "address2": selectedCustomer?.defaultAddress?.address2 ? selectedCustomer?.defaultAddress?.address2 : null,
      "province": selectedCustomer?.defaultAddress?.province ? selectedCustomer?.defaultAddress?.province : null,
      "first_name": selectedCustomer?.defaultAddress?.firstName ? selectedCustomer?.defaultAddress?.firstName : null,
      "last_name": selectedCustomer?.defaultAddress?.lastName ? selectedCustomer?.defaultAddress?.lastName : null,
      "country_code": selectedCustomer?.defaultAddress?.countryCode ? selectedCustomer?.defaultAddress?.countryCode : null,
      "province_code": selectedCustomer?.defaultAddress?.provinceCode ? selectedCustomer?.defaultAddress?.provinceCode : null,
      "latitude": null,
      "longitude": null,
    }
    const requestData = {
      email: selectedCustomer?.email ? selectedCustomer?.email : null,
      phone: selectedCustomer?.phone ? selectedCustomer?.phone : null,
      note: addDraftOrder?.notes ? addDraftOrder?.notes : null,
      currency: "INR",
      current_subtotal_price: subtotal ? subtotal.toFixed(2) : "0.00",
      current_total_tax: subtotal ? (subtotal * 0.18).toFixed(2) : "₹0.00",
      current_total_price: subtotal ? (subtotal + (subtotal * 0.18)).toFixed(2) : "₹0.00",
      tax_lines: taxLinesValue ? taxLinesValue : null,
      billing_address: addressValue ? addressValue : null,
      shipping_address: addressValue ? addressValue : null,
      tags: tags ? tags : null,
      financial_status: selectedPayment,
      note_attributes: radioValue === "manual" ? [{
        name: "_outletId",
        value: selectedStoreData.erpStoreId,
      }, {
        name: "_userPinCode",
        value: selectedStoreData.pinCode,
      }, {
        name: "_storeName",
        value: selectedStoreData.storeName,
      }, {
        name: "_storeCity",
        value: selectedStoreData.city,
      }, {
        name: "_storeState",
        value: selectedStoreData.state,
      }, {
        name: "_storeCode",
        value: selectedStoreData.storeCode,
      }] : [],
      customer: {
        first_name: selectedCustomer?.firstName ? selectedCustomer?.firstName : null,
        last_name: selectedCustomer?.lastName ? selectedCustomer?.lastName : null,
        email: selectedCustomer?.email ? selectedCustomer?.email : null,
        phone: selectedCustomer?.phone ? selectedCustomer?.phone : null,
      },
      line_items: selectedProducts ? selectedProducts.map(product => (
        {
          product_id: Number(product.productId),
          variant_id: Number(product.id),
          variant_title: product.variantTitle,
          title: product.title,
          price: Number(product.price),
          quantity: product.quantity,
          sku: product.sku,
        }
      )) : null
    }
    const responseData = await draftOrderAdd({ requestData: JSON.stringify(requestData) });
    if (responseData) {
      setTimeout(() => {
        navigate('/orders');
      }, 5000);
    }
  }, [addDraftOrder, selectedCustomer, subtotal, tags, selectedProducts, selectedPayment, selectedStoreData]);

  const transformedData = useMemo(() => {
    return allProducts
      .filter(product => product.status === "active")
      .flatMap(product =>
        product.variants.edges
          .map(variant => {
          // Return the same structure with additional data
          return {
            id: Number(variant.node.id),
            image: product?.images?.edges[0]?.node?.source,
            price: variant.node.price,
            status: product.status,
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
      }))
      
  }, [allProducts, selectedStore]);

  const rows = transformedData || [];

  const breakpoints = useBreakpoints();

  useEffect(() => {
    if (addDraftOrder && addDraftOrder.customer) {
      selectedCustomerData();
    }
  }, [addDraftOrder, selectedCustomerData]);

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

  const filteredRowsForStore = filteredRows.filter(row => parseInt(row.outletId) === parseInt(selectedStore));
  const groupedProducts = groupRowsByGroupKey("handle", (handle) => `handle--${handle}`, filteredRowsForStore);
  const { selectedResources, allResourcesSelected, handleSelectionChange, removeSelectedResources } = useIndexResourceState(filteredRowsForStore, {
    resourceFilter: ({ disabled }) => !disabled,
  });

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const handleQuantityChange = (id, newQuantity, sku) => {
    const stock = productStock[sku];
    if (newQuantity > stock) {
      setErrorMessages((prev) => ({ ...prev, [sku]: `Quantity cannot exceed available stock of ${stock}` }));
    } else {
      setErrorMessages((prev) => ({ ...prev, [sku]: "" }));
      setSelectedProducts(selectedProducts.map(product =>
        product.id === id ? { ...product, quantity: newQuantity } : product
      ));
    }
  };

  const handleRemoveProduct = (id) => {
    const product = selectedProducts.find(product => product.id === id);
    setSelectedProducts(selectedProducts.filter(product => product.id !== id));
    removeSelectedResources(id);
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

  useEffect(() => {
    // if (selectedResources) {
    //   const selectedRows = productDataList.filter(row => selectedResources.includes(row.id));
    //   const updatedSelectedRows = selectedRows.map(row => {
    //     const existingProduct = selectedProducts.find(product => product.id === row.id);
    //     return existingProduct ? { ...row, quantity: existingProduct.quantity } : row;
    //   });
    //   setSelectedProducts(updatedSelectedRows);
    // }
    if (selectedResources) {
      const selectedRows = filteredRowsForStore.filter(
        (row) => 
          selectedResources.includes(row.id) && 
          Number(row.outletId) === Number(selectedStore) && 
          row.stock > 0 // Ensure the quantity is greater than zero
      );
      const updatedSelectedRows = selectedRows.map((row) => {
        const existingProduct = selectedProducts.find((product) => product.id === row.id);
        return existingProduct ? { ...row, quantity: existingProduct.quantity } : row;
      });
      setSelectedProducts((prevSelectedProducts) => {
        const remainingSelectedProducts = prevSelectedProducts.filter((product) =>
          selectedResources.includes(product.id)
        );

        const newProducts = updatedSelectedRows.filter(
          (row) => !prevSelectedProducts.some((product) => product.id === row.id)
        );
        return [...remainingSelectedProducts, ...newProducts];
      });
      
    }
  }, [selectedResources]);

  useEffect(() => {
    calculateSubtotal();
  }, [selectedProducts]);

  useEffect(() => {
    if (customerData) {
      const customerList = customerData?.map(customer => ({
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
    if (selectedPayment && tags.length && selectedCustomer.id) {
      setIsEditing(true);
    }
  }, [selectedPayment, tags, selectedCustomer]);

  // useEffect(() => {
  //   const fetchStocks = async () => {
  //     if (selectedStore && rows.length) {
  //       const updatedRows = await Promise.all(
  //         rows.map(async (row) => {
  //           const stock = await fetchStockBySkuAndStore(row.sku, Number(selectedStore));
  //           return { ...row, stock };
  //         })
  //       );
  //       setFilteredRows(updatedRows);
  //     }
  //   };
  //   fetchStocks();
  // }, [selectedStore, rows]);

  useEffect(() => {
    if (!selectedStore || Object.keys(selectedStore).length === 0) {
      setRowMarkup(null);
      setProductDataList([]);
      return;
    }

  
    Object.keys(groupedProducts).forEach((key) => {
      const products = groupedProducts[key]?.products || [];
      groupedProducts[key].title = products.length > 0 ? products[0]?.title || "Unnamed Group" : "Empty Group";
    });
  
    const productDataArray = [];
    const markup = Object.keys(groupedProducts).map((handle,index) => {
      const { products, position, id: product_id ,title} = groupedProducts[handle];
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
        selectableRows.findIndex((row) => row.id === products[0].id) ,
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
              selected={selectedResources.includes(id) && stock > 0 }
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
    setRowMarkup(markup);
    setProductDataList(productDataArray);
  }, [selectedStore, selectedResources,filteredRows])

  return (
    <Box paddingBlockEnd="400">
      <Page
        fullWidth
        compactTitle
        title="Create order"
        backAction={{ content: "Orders", onAction: () => navigate(-1) }}
        primaryAction={<Button onClick={handleSubmit} loading={isLoading} variant='primary' disabled={!isEditing}>Create Order</Button>}
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
                <InlineStack align="start">
                  <TextComponent textTitle="Products" textVariant="headingSm" textAs="h6" />
                </InlineStack>
                <TextFieldComponent
                  textPlaceHolder="Search products"
                  textName="search"
                  textValue={searchProducts}
                  onValueChange={({ value }) => setSearchProducts(value)}
                  textError={selectedProducts.length ? "" : "Please select products"}
                >
                  <Button size="large" onClick={() => {
                    setProductLists(true)
                    setShowProducts(false)
                  }}>
                    Browse
                  </Button>
                </TextFieldComponent>
              </BlockStack>
              { selectedProducts.length ? (
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
                          <Box paddingInlineEnd="1000">
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
                                source={row?.image ? row?.image : NoteIcon}
                                alt="Black choker necklace"
                                size="small"
                              />
                              <Box as="span" paddingInlineStart="400">
                                <Box paddingBlockEnd="100">
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
                                  onChange={(e) => handleQuantityChange(row.id, parseInt(e), row.sku)}
                                />
                              </Box>
                              <Box width="80">
                                <Text
                                  as="span"
                                  variant="bodyMd"
                                  alignment="end"
                                  numeric
                                >
                                  {`₹${(Number(row?.price) * Number(row?.quantity)).toFixed(2)}`}
                                </Text>
                              </Box>
                              <Button
                                icon={DeleteIcon}
                                onClick={() => handleRemoveProduct(row.id)}
                              ></Button>
                            </InlineStack>
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
                  <InlineStack align="space-between">
                    <TextComponent textTitle="Subtotal" textVariant="headingMd" textAs="h6" />
                    <TextComponent textTitle={showProducts && selectedProducts.length && totalQuantity ? `${totalQuantity > 1 ? `${totalQuantity} items` : `${totalQuantity} item`}` : "—"} textVariant="bodyMd" textAs="h6" />
                    <TextComponent textTitle={showProducts && selectedProducts.length && subtotal ? `₹${subtotal.toFixed(2)}` : "₹0.00"} textVariant="headingMd" textAs="h6" />
                  </InlineStack>
                  <InlineStack align="space-between">
                    <TextComponent textTitle="Discount" textVariant="bodyMd" textAs="p" />
                    <TextComponent textTitle="—" textVariant="bodyMd" textAs="h6" />
                    <TextComponent textTitle="₹0.00" textVariant="bodyMd" textAs="p" />
                  </InlineStack>
                  <InlineStack align="space-between">
                    <TextComponent textTitle="Shipping" textVariant="bodyMd" textAs="p" />
                    <TextComponent textTitle="—" textVariant="bodyMd" textAs="p" />
                    <TextComponent textTitle="₹0.00" textVariant="bodyMd" textAs="p" />
                  </InlineStack>
                  <InlineStack align="space-between">
                    <TextComponent textTitle="Est. tax" textVariant="bodyMd" textAs="p" />
                    <TextComponent textTitle={showProducts && selectedProducts.length && subtotal ? "IGST 18%" : "Not calculated"} textVariant="bodyMd" textAs="h6" />
                    <TextComponent textTitle={showProducts && selectedProducts.length && subtotal ? `₹${(subtotal * 0.18).toFixed(2)}` : "₹0.00"} textVariant="bodyMd" textAs="p" />
                  </InlineStack>
                  <Box paddingBlock="200">
                    <Divider />
                  </Box>
                  <InlineStack align="space-between">
                    <TextComponent textTitle="Total" textVariant="headingMd" textAs="h6" />
                    <TextComponent textTitle={showProducts && selectedProducts.length && subtotal ? `₹${(subtotal + (subtotal * 0.18)).toFixed(2)}` : "₹0.00"} textVariant="headingMd" textAs="h6" />
                  </InlineStack>
                </Card>
              </BlockStack>
              {showProducts && selectedProducts.length ? (
                <Box paddingBlockStart="300">
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
                  </InlineStack>
                </Box>
              ) : (
                <Box paddingBlockStart="300">
                  <Text as="h6" variant="headingSm">
                    Add a product to calculate total and view payment options.
                  </Text>
                </Box>
              )}
            </Card>
          </BlockStack>
          <BlockStack gap={{ xs: "400", md: "200" }}>
            <Card roundedAbove="sm">
              <BlockStack gap="100">
                <TextComponent textTitle="Store Selection" textVariant="headingSm" textAs="h6" />
                {radioValue === 'auto' ? (
                  <TextComponent textVariant="bodyMd" textAs="h3" textTone="subdued">
                    Auto
                  </TextComponent>
                ) : (
                  <Select
                    placeholder="Select"
                    options={allStores}
                    onChange={(value) => {
                      setSelectedStore(value)
                      const selectStore = stores.find(store => store.erpStoreId === value)
                      setSelectedStoreData(selectStore)
                    }}
                    value={selectedStore}
                    error={selectedStore ? "" : "Please select store"}
                  />
                )}
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              <BlockStack gap="100">
                <InlineStack align="space-between">
                  <TextComponent textTitle="Notes" textVariant="headingSm" textAs="h6" />
                  <ButtonComponent buttonVariant="tertiary" buttonSize="slim" buttonIcon={EditIcon} buttonOnClick={() => setActiveNotes(!activeNotes)} />
                </InlineStack>
                <TextComponent textVariant="bodyMd" textAs="h3" textTone="subdued">
                  {addDraftOrder && addDraftOrder.notes ? addDraftOrder.notes : "No notes"}
                </TextComponent>
              </BlockStack>
            </Card>
            <Card roundedAbove="sm">
              {addDraftOrder && addDraftOrder.customer ? (
                <BlockStack gap="100">
                  <InlineStack align="space-between">
                    <InlineStack align="start">
                      <TextComponent textTitle="Customer" textVariant="headingSm" textAs="h6" />
                    </InlineStack>
                    {selectedCustomer.firstName && <ButtonComponent
                      buttonVariant="tertiary"
                      buttonSize="slim"
                      buttonIcon={DeleteIcon}
                      buttonOnClick={() => {
                        setAddDraftOrder({
                          ...addDraftOrder,
                          customer: null
                        })
                        setSelectedCustomer({})
                      }} />}
                  </InlineStack>
                  {selectedCustomer.firstName ? <>
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
                  </> : <Spinner accessibilityLabel="Small spinner example" size="small" />}
                </BlockStack>
              ) : (
                <BlockStack gap="100">
                  <InlineStack align="space-between">
                    <InlineStack align="start">
                      <TextComponent textTitle="Customer" textVariant="headingSm" textAs="h6" />
                    </InlineStack>
                    <ButtonComponent
                      buttonVariant="secondary"
                      buttonSize="slim"
                      buttonTitle="New Customer"
                      buttonIcon={PersonAddIcon}
                      buttonOnClick={() => setActiveCreateCustomer(true)}
                    />
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
                </InlineStack>
                <CreateMultiSelectComponent
                  setTags={setTags}
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
              <TextFieldComponent textLabel="Notes" textName="notes" textValue={addDraftOrder && addDraftOrder.notes} onValueChange={handleValues} />
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
          >
            <Box paddingBlockEnd="300">
              <TextFieldComponent textPlaceHolder="Search products" textName="search" textValue={searchProducts} onValueChange={({ value }) => setSearchProducts(value)} />
            </Box>
            {selectedStoreData && selectedStoreData.erpStoreId ? <IndexTable
              condensed={breakpoints.smDown}
              onSelectionChange={handleSelectionChange}
              selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
              resourceName={resourceName}
              itemCount={filteredRowsForStore.length}
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
            </IndexTable> : <Text variant="bodyLg" as="p" alignment="center">Select Store First</Text>}
            {hasNextPage &&( <div ref={bottomRef} style={{ height: 20 }} />)}
           
          </ModalComponent>
        )}
        {activeCreateCustomer && (
          <ModalComponent
            modalTitle="Create a new customer"
            modalPrimaryButton="Save customer"
            modalActive={activeCreateCustomer}
            handleModelSave={handleCreateCustomerModelSave}
            handleModalClose={handleCreateCustomerModelClose}
          >
            <BlockStack vertical gap="400">
              <FormLayout>
                <FormLayout.Group>
                  <TextFieldComponent
                    textLabel="First name"
                    textName="first_name"
                    textValue={createCustomer.first_name}
                    onValueChange={handleCreateCustomerValues}
                    textError={createCustomer.first_name ? "" : "Please enter valid first name"}
                  />
                  <TextFieldComponent
                    textLabel="Last name"
                    textName="last_name"
                    textValue={createCustomer.last_name}
                    onValueChange={handleCreateCustomerValues}
                    textError={createCustomer.last_name ? "" : "Please enter valid last name"}
                  />
                </FormLayout.Group>
                {/* <Select
                  label="Language"
                  options={[
                    { label: 'English [Default]', value: 'en' },
                  ]}
                  helpText="This customer will receive notifications in this language."
                  name="language"
                  value={createCustomer.language}
                  onChange={handleCreateCustomerValues}
                /> */}
                <TextFieldComponent
                  textLabel="Email"
                  textType="email"
                  textName="email"
                  textValue={createCustomer.email}
                  onValueChange={handleCreateCustomerValues}
                  textAutoComplete="email"
                  textError={createCustomer.email && customerData.find((customer) => customer.email === createCustomer.email) ? "Email already exists" : createCustomer.email && /\S+@\S+\.\S+/.test(createCustomer.email) ? "" : "Please enter valid email address"}
                />
                <Checkbox
                  label="Customer accepts email marketing"
                  name="accepts_marketing"
                  checked={createCustomer.accepts_marketing}
                  onChange={(value) => handleCreateCustomerValues({ name: "accepts_marketing", value })}
                />
                <Checkbox
                  label="Customer is tax exempt"
                  name="tax_exempt"
                  checked={createCustomer.tax_exempt}
                  onChange={(value) => handleCreateCustomerValues({ name: "tax_exempt", value })}
                />
                <Divider />
                <Text variant="bodySm" as="p">Shipping address</Text>
                <Select
                  label="Country/region"
                  options={[
                    { label: 'India', value: 'india' },
                  ]}
                  name="country"
                  value={createCustomer.country}
                  onChange={(value) => handleCreateCustomerValues({ name: "country", value })}
                />
                <TextFieldComponent
                  textLabel="Company"
                  textName="company"
                  textValue={createCustomer.company}
                  onValueChange={handleCreateCustomerValues}
                />
                <TextFieldComponent
                  textLabel="Address"
                  textName="address1"
                  textValue={createCustomer.address}
                  onValueChange={handleCreateCustomerValues}
                  textError={createCustomer.address1 ? "" : "Please enter valid address"}
                />
                <TextFieldComponent
                  textLabel="Apartment, suite, etc."
                  textName="address2"
                  textValue={createCustomer.apartmentSuite}
                  onValueChange={handleCreateCustomerValues}
                  textError={createCustomer.address2 ? "" : "Please enter valid address"}
                />
                <FormLayout.Group>
                  <TextFieldComponent
                    textLabel="City"
                    textName="city"
                    textValue={createCustomer.city}
                    onValueChange={handleCreateCustomerValues}
                    textError={createCustomer.city ? "" : "Please enter valid city"}
                  />
                  <Select
                    label="State"
                    name="state"
                    options={INDIAN_STATES_AND_UT}
                    value={createCustomer.state}
                    onChange={(value) => handleCreateCustomerValues({ name: "state", value })}
                    error={createCustomer.state ? "" : "Please enter valid state"}
                  />
                </FormLayout.Group>
                <TextFieldComponent
                  textLabel="Pin code"
                  textName="zip"
                  textValue={createCustomer.pinCode}
                  onValueChange={handleCreateCustomerValues}
                  textError={createCustomer.zip && /^\d{6}$/.test(createCustomer.zip) ? "" : "Please enter valid pin code"}
                />
                <TextFieldComponent
                  textLabel="Phone"
                  textName="phone"
                  textPrefix="+91"
                  textValue={createCustomer.phone}
                  onValueChange={handleCreateCustomerValues}
                  textError={createCustomer.phone && /^[0-9]{10}$/.test(createCustomer.phone) ? "" : "Please enter valid phone number"}
                />
                {/* <TextField
                  label="Phone"
                  name="phone"
                  value={createCustomer.phone}
                  onChange={handleCreateCustomerValues}
                  autoComplete="off"
                  connectedLeft={
                    <Select
                      labelHidden
                      label="Country Code"
                      options={['In']}
                      name="province_code"
                      value={createCustomer.province_code}
                      onChange={handleCreateCustomerValues}
                    />
                  }
                /> */}
              </FormLayout>
            </BlockStack>
          </ModalComponent>
        )}
      </Page>
    </Box>
  );
};

export default AddDraftOrderPage;