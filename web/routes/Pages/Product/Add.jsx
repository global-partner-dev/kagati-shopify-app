/**
 * AddProductPage Component
 *
 * This component provides a form to add a new product to the store. The component includes fields for entering
 * product details such as title, description, media, pricing, inventory, and more. It also handles form validation,
 * API calls for product creation, and user feedback.
 *
 * Features:
 * - Form fields for product title, description, media, pricing, and inventory.
 * - Integration with Shopify Polaris components for a consistent UI/UX.
 * - Validation and submission of product data to the API.
 * - Displays loading indicators and success messages based on the submission status.
 * - Navigation back to the products listing page upon successful product creation.
 *
 * Usage:
 *
 * <AddProductPage />
 *
 * Dependencies:
 * - React hooks (useState, useEffect)
 * - Polaris components from Shopify (Page, Card, BlockStack, TextField, DropZone, Checkbox, FormLayout, Text, InlineGrid)
 * - Gadget API for interacting with product records
 * - React Router for navigation (useNavigate)
 *
 * Example:
 * 
 * <AddProductPage />
 *
 * Props:
 * - No props are required. The component handles internal state management and navigation.
 *
 * Note:
 * - Ensure that the API endpoints for creating and managing products are correctly configured in the Gadget API.
 */

import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Page,
  InlineGrid,
  BlockStack,
  InlineStack,
  Text,
  FormLayout,
  Link,
  Divider,
  PageActions,
  Icon,
  Tag,
  Card
} from "@shopify/polaris";
import TextComponent from "../../../components/TextComponent";
import TextFieldComponent from "../../../components/TextFieldComponent";
import DropZoneComponent from "../../../components/DropZoneComponent";
import MultiManualComboboxComponent from "../../../components/MultiManualComboboxComponent";
import CheckboxComponent from "../../../components/CheckboxComponent";
import ListComponent from "../../../components/ListComponent";
import ComboboxComponent from "../../../components/ComboboxComponent";
import SelectComponent from "../../../components/SelectComponent";
import ButtonComponent from "../../../components/ButtonComponent";
import PopoverComponent from "../../../components/PopoverComponent";
import IndexTableComponent from "../../../components/IndexTableComponent";
import {
  PlusIcon,
  MobileIcon,
  SearchIcon,
  DragHandleIcon,
  DeleteIcon,
  EditIcon,
} from "@shopify/polaris-icons";
import { api } from "../../../api";
import { useGlobalAction, useFindMany } from "@gadgetinc/react";

const AddProductPage = () => {
  const navigate = useNavigate();
  const [buttonClick, setButtonClick] = useState(false);
  const [addProduct, setAddProduct] = useState();
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  // const [{ data: createProductData, fetching: createProductFeching, error: createProductError }, productAdd] = useGlobalAction(
  //   api.createProduct
  // );

  const [{ data: productData, fetching: productFetching, error: productError }] = useFindMany(api.shopifyProduct)

  const convertOptions = (data) => {
    return data.map(item => ({
      name: item.name,
      values: item.values
        .map(valueItem => valueItem.value)
        .filter(value => value !== '')
    }));
  };

  const convertVariants = (data) => {
    return data.map(({ id, ...rest }) => rest);
  };

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
  ];

  const themeOptions = [
    { label: "Default product", value: "default-product" }
  ];

  const variantOptions = [
    { label: "Size", value: "size" },
    { label: "Color", value: "color" },
    { label: "Material", value: "material" },
    { label: "Style", value: "style" },
  ];

  const WeightOptions = [
    { label: "kg", value: "kg" },
    { label: "lb", value: "lb" },
    { label: "oz", value: "oz" },
    { label: "g", value: "g" },
  ];

  const productKeywordOrCode = [
    { value: "productKeywordOrCode1", label: "Product Keyword Or Code 1" },
    { value: "productKeywordOrCode2", label: "Product Keyword Or Code 2" },
    { value: "productKeywordOrCode3", label: "Product Keyword Or Code 3" },
    { value: "productKeywordOrCode4", label: "Product Keyword Or Code 4" },
    { value: "productKeywordOrCode5", label: "Product Keyword Or Code 5" },
  ];

  const productCategory = [
    { value: "productCategory1", label: "Product Category 1" },
    { value: "productCategory2", label: "Product Category 2" },
    { value: "productCategory3", label: "Product Category 3" },
    { value: "productCategory4", label: "Product Category 4" },
    { value: "productCategory5", label: "Product Category 5" },
  ];

  const productType = [
    { value: "productType1", label: "Product Type 1" },
    { value: "productType2", label: "Product Type 2" },
    { value: "productType3", label: "Product Type 3" },
    { value: "productType4", label: "Product Type 4" },
    { value: "productType5", label: "Product Type 5" },
  ];

  const vendors = [
    { value: "vendor1", label: "Vendor 1" },
    { value: "vendor2", label: "Vendor 2" },
    { value: "vendor3", label: "Vendor 3" },
    { value: "vendor4", label: "Vendor 4" },
    { value: "vendor5", label: "Vendor 5" },
  ];

  // const collections = [
  //   { value: "collection1", label: "Collection 1" },
  //   { value: "collection2", label: "Collection 2" },
  //   { value: "collection3", label: "Collection 3" },
  //   { value: "collection4", label: "Collection 4" },
  //   { value: "collection5", label: "Collection 5" },
  // ];

  const tags = [
    { value: "tag1", label: "Tag 1" },
    { value: "tag2", label: "Tag 2" },
    { value: "tag3", label: "Tag 3" },
    { value: "tag4", label: "Tag 4" },
    { value: "tag5", label: "Tag 5" },
  ];

  const salesChannelsList = [
    {
      title: "Online Store",
      description: "",
    },
    {
      title: "Shopify GraphiQL App",
      description: "",
    },
    {
      title: "Point of Sale",
      description: (
        <Box>
          <TextComponent textVariant="bodyMd" textAs="span" textTone="subdued">
            Point of Sale has not been set up. Finish the remaining steps to start
            selling in person. <Link url="Example App">Learn more</Link>
          </TextComponent>
        </Box>
      ),
    },
  ];

  const marketsList = [
    {
      title: "India and International",
      description: "",
    },
  ];

  const handleValues = ({ name, value }) => {
    let finalValue;
    if (name === "images") {
      finalValue = value.map((image) => {
        return {
          alt: image.name.split(".")[0],
          src: image.src.url,
        };
      });
      finalValue = JSON.stringify(finalValue);
    } else if (name === "variants" || name === "options") {
      finalValue = JSON.stringify(value);
    }
    else {
      finalValue = name === "tags" ? value.join(', ') : value;
    }
    setAddProduct((prevProduct) => ({
      ...prevProduct,
      [name]: finalValue,
    }));
  };


  const addOption = () => {
    const newOption = {
      id: Date.now(),
      edit: false,
      name: "",
      values: [{ id: Date.now(), value: "" }]
    };
    setOptions([...options, newOption]);
    handleValues({ name: "options", value: convertOptions([...options, newOption]) });
  };

  const removeOption = (id) => {
    const newOptions = options.filter(option => option.id !== id);
    setOptions(newOptions);
    handleValues({ name: "options", value: convertOptions(newOptions) });
  };

  const handleComboboxChange = (optionId, selectedName) => {
    const newOptions = options.map(option => {
      if (option.id === optionId) {
        return {
          ...option,
          name: selectedName
        };
      }
      return option;
    })
    setOptions(newOptions);
    handleValues({
      name: "options", value: convertOptions(newOptions)
    });
  };

  const handleTextFieldChange = (optionId, valueId, newValue) => {
    const newOptions = options.map(option => {
      if (option.id === optionId) {
        const updatedValues = option.values.map(valueItem => {
          if (valueItem.id === valueId) {
            return {
              ...valueItem,
              value: newValue
            };
          }
          return valueItem;
        });
        if (newValue !== "" && !updatedValues.some(valueItem => valueItem.id !== valueId && valueItem.value === "")) {
          updatedValues.push({ id: Date.now(), value: '' });
        }
        return {
          ...option,
          values: updatedValues
        };
      }
      return option;
    })
    setOptions(newOptions);
    handleValues({ name: "options", value: convertOptions(newOptions) });
  };

  const removeOptionValue = (optionId, valueId) => {
    const newOptions = options.map(option => {
      if (option.id === optionId) {
        return {
          ...option,
          values: option.values.filter(valueItem => valueItem.id !== valueId)
        };
      }
      return option;
    })
    setOptions(newOptions)
    handleValues({ name: "options", value: convertOptions(newOptions) });
  };

  const submitOption = (optionId) => {
    const newOptions = options.map(option => {
      if (option.id === optionId) {
        return {
          ...option,
          edit: true
        };
      }
      return option;
    })
    setOptions(newOptions);
    handleValues({ name: "options", value: convertOptions(newOptions) });
  }

  const editOption = (optionId) => {
    const newOptions = options.map(option => {
      if (option.id === optionId) {
        return {
          ...option,
          edit: false
        };
      }
      return option;
    })
    setOptions(newOptions);
    handleValues({ name: "options", value: convertOptions(newOptions) });
  }

  useEffect(() => {
    let uniqueIdCounter = 0;
    const generateVariants = (options) => {
      const hasValidOptions = options.every(option =>
        option.values && option.values.some(value => value && value.value !== "")
      );
      if (!hasValidOptions) {
        return variants;
      }
      const filteredOptions = options.map(option =>
        option.values.filter(value => value && value.value !== "")
      );
      const combine = (options, prefix = []) => {
        if (options.length === 0) return [prefix];
        const firstOption = options[0];
        const restOptions = options.slice(1);
        let combinations = [];
        firstOption.forEach(option => {
          combinations = combinations.concat(combine(restOptions, prefix.concat(option.value)));
        });
        return combinations;
      };
      return combine(filteredOptions).map(combination => {
        const variant = { id: ++uniqueIdCounter };
        combination.forEach((value, index) => {
          variant[`option${index + 1}`] = value;
        });
        return variant;
      });
    };

    if (options && options.length > 0) {
      const updatedVariants = generateVariants(options);
      setVariants(updatedVariants);
      handleValues({ name: "variants", value: convertVariants(updatedVariants) });
    } else {
      setVariants([]);
      handleValues({ name: "variants", value: [] });
    }
  }, [options]);

  // const handleSubmit = useCallback(async () => {
  //   const requestData = {
  //     ...addProduct,
  //     published_at: new Date().toISOString(),
  //   }
  //   setLoading(true);
  //   const response = await productAdd(requestData);
  //   if (response) {
  //     navigate("/products");
  //   }
  // }, [addProduct]);

  return (
    <Page
      backAction={{ content: "Products", onAction: () => navigate(-1) }}
      title="Add product"
    >
      <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="400">
        <BlockStack gap="400">
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextFieldComponent
                textLabel="Title"
                textPlaceHolder="Short sleeve t-shirt"
                textName="title"
                onValueChange={handleValues}
              />
              <TextFieldComponent
                textLabel="Description"
                textPlaceHolder="Description"
                textName="body"
                textMultiLine={4}
                onValueChange={handleValues}
              />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingSm" as="h6">
                Media
              </Text>
              <DropZoneComponent
                DropZoneName="images"
                onValueChange={handleValues}
              />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextComponent
                textTitle="Pricing"
                textVariant="headingSm"
                textAs="h6"
              />
              <FormLayout>
                <FormLayout.Group condensed>
                  <TextFieldComponent
                    textLabel="Price"
                    textPlaceHolder="0.00"
                    textType="number"
                    textPrefix="$"
                  />
                  <TextFieldComponent
                    textLabel="Compare-at price"
                    textPlaceHolder="0.00"
                    textType="number"
                    textPrefix="$"
                  />
                </FormLayout.Group>
              </FormLayout>
              <CheckboxComponent
                checkBoxLabel="Charge tax on this product"
                checkBoxChecked={true}
              />
              <FormLayout>
                <FormLayout.Group condensed>
                  <TextFieldComponent
                    textLabel="Cost per item"
                    textPlaceHolder="0.00"
                    textType="number"
                    textPrefix="$"
                  />
                  <TextFieldComponent textLabel="Profit" textPlaceHolder="--" />
                  <TextFieldComponent textLabel="Margin" textPlaceHolder="--" />
                </FormLayout.Group>
              </FormLayout>
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextComponent
                textTitle="Inventory"
                textVariant="headingSm"
                textAs="h6"
              />
              <CheckboxComponent
                checkBoxLabel="Track quantity"
                checkBoxChecked={true}
              />
              <TextComponent
                textTitle="Quantity"
                textVariant="headingSm"
                textAs="h6"
              />
              <Divider />
              <InlineStack align="space-between">
                <TextComponent
                  textTitle="Shop location"
                  textVariant="bodyLg"
                  textAs="span"
                />
                <TextFieldComponent
                  textLabel="Shop location"
                  textLabelHidden={true}
                  textType="number"
                  textPlaceHolder="0"
                />
              </InlineStack>
              <CheckboxComponent
                checkBoxLabel="Continue selling when out of stock"
                checkBoxChecked={false}
              />
              <TextComponent textVariant="bodyMd" textAs="span" textTone="subdued">
                This won't affect{" "}
                <Link url="Example App" removeUnderline>
                  Shopify POS
                </Link>
                . Staff will see a warning, but can complete sales when
                available inventory reaches zero and below.
              </TextComponent>
              <CheckboxComponent
                checkBoxLabel="This product has a SKU or barcode"
                checkBoxChecked={false}
              />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextComponent
                textTitle="Shipping"
                textVariant="headingSm"
                textAs="h6"
              />
              <CheckboxComponent
                checkBoxLabel="This is a physical product"
                checkBoxChecked={true}
              />
              <TextFieldComponent
                textLabel="Weight"
                textType="number"
                textPlaceHolder="0.0"
              >
                <SelectComponent
                  fieldName="weight"
                  selectOptions={WeightOptions}
                  onValueChange={handleValues}
                />
              </TextFieldComponent>
              <Divider />
              <SelectComponent
                fieldName="countryOrigin"
                selectLabel="Country/Region of origin"
                selectOptions={themeOptions}
                onValueChange={handleValues}
              />
              <TextComponent
                textTitle="Harmonized System (HS) code"
                textVariant="bodyMd"
                textAs="span"
              />
              <ComboboxComponent
                fieldName="productKeywordOrCode"
                placeHolder="Search by product keyword or code"
                chooses={productKeywordOrCode}
                onValueChange={handleValues}
              >
                <Icon source={SearchIcon} />
              </ComboboxComponent>
              <TextComponent textVariant="bodyMd" textAs="span" textTone="subdued">
                Learn more about <Link url="Example App">adding HS codes</Link>
              </TextComponent>
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <TextComponent
                  textTitle="Search engine listing"
                  textVariant="headingSm"
                  textAs="h6"
                />
                <ButtonComponent
                  buttonTitle="Edit"
                  buttonVariant="plain"
                  buttonAlign="right"
                />
              </InlineStack>
              <TextComponent
                textTitle="Add a title and description to see how this product might appear in a search engine listing"
                textVariant="bodyMd"
                textAs="span"
              />
            </BlockStack>
          </Card>
        </BlockStack>
        <BlockStack gap={{ xs: "400", md: "200" }}>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextComponent
                textTitle="Status"
                textVariant="headingSm"
                textAs="h6"
              />
              <SelectComponent
                fieldName="status"
                selectOptions={statusOptions}
                onValueChange={handleValues}
              />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <TextComponent
                  textTitle="Publishing"
                  textVariant="headingMd"
                  textAs="h2"
                />
                <ButtonComponent
                  buttonVariant="plain"
                  buttonAlign="right"
                  buttonIcon={MobileIcon}
                  buttonOnClick={() => setButtonClick(!buttonClick)}
                />
              </InlineStack>
              {buttonClick && <PopoverComponent popoverAction={buttonClick} />}
              <TextComponent
                textTitle="Sales channels"
                textVariant="headingSm"
                textAs="h6"
              />
              <ListComponent listData={salesChannelsList} />
              <TextComponent
                textTitle="Markets"
                textVariant="headingSm"
                textAs="h6"
              />
              <ListComponent listData={marketsList} />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextComponent
                textTitle="Product organization"
                textVariant="headingSm"
                textAs="h6"
              />
              <TextComponent
                textTitle="Product category"
                textVariant="bodyMd"
                textAs="span"
              />
              <ComboboxComponent
                fieldName="productCategory"
                placeHolder="Search"
                chooses={productCategory}
                onValueChange={handleValues}
              />
              <TextComponent textVariant="bodyMd" textAs="span" textTone="subdued">
                Determines US <Link url="Example App">tax rates</Link>
              </TextComponent>
              <TextComponent
                textTitle="Product type"
                textVariant="bodyMd"
                textAs="span"
              />
              <ComboboxComponent
                fieldName="productType"
                chooses={productType}
                onValueChange={handleValues}
              />
              <TextComponent
                textTitle="Vendor"
                textVariant="bodyMd"
                textAs="span"
              />
              <ComboboxComponent
                fieldName="vendor"
                chooses={vendors}
                onValueChange={handleValues}
              />
              {/* <TextComponent
                textTitle="Collections"
                textVariant="bodyMd"
                textAs="span"
              />
              <MultiManualComboboxComponent
                fieldName="collections"
                chooses={collections}
                onValueChange={handleValues}
              /> */}
              <TextComponent
                textTitle="Tags"
                textVariant="bodyMd"
                textAs="span"
              />
              <MultiManualComboboxComponent
                fieldName="tags"
                chooses={tags}
                onValueChange={handleValues}
              />
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <SelectComponent
                fieldName="themeTemplate"
                selectLabel="Theme template"
                selectOptions={themeOptions}
                onValueChange={handleValues}
              />
            </BlockStack>
          </Card>
        </BlockStack>
      </InlineGrid>
      <Box paddingBlock="400">
        <InlineGrid columns={{ xs: 1, md: "1fr" }} gap="400">
          <BlockStack gap="400">
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <TextComponent
                  textTitle="Variants"
                  textVariant="headingSm"
                  textAs="h6"
                />
                {options.length > 0 &&
                  <Card>
                    {options.map((option) => (
                      <React.Fragment key={option.id}>
                        {option.edit && <InlineGrid columns={3}>
                          <ButtonComponent
                            buttonVariant="monochromePlain"
                            buttonAlign="left"
                            buttonIcon={DragHandleIcon}
                          />
                          <Box>
                            <TextComponent
                              textTitle={option.name}
                              textVariant="headingMd"
                              textAs="h6"
                            />
                            {option.values.map((value) => (
                              <Box as="span" className="myCustomLeftMargin" key={value.id}>
                                {value.value !== '' && (
                                  <Tag>{value.value}</Tag>
                                )}
                              </Box>
                            ))}
                          </Box>
                          <ButtonComponent
                            buttonVariant="monochromePlain"
                            buttonAlign="right"
                            buttonIcon={EditIcon}
                            buttonOnClick={() => editOption(option.id)}
                          />
                        </InlineGrid>}
                        {
                          !option.edit && <>
                            <InlineGrid columns={3}>
                              <ButtonComponent
                                buttonVariant="monochromePlain"
                                buttonAlign="left"
                                buttonIcon={DragHandleIcon}
                              />
                              <Box>
                                <TextComponent
                                  textTitle="Option name"
                                  textVariant="bodyMd"
                                  textAs="span"
                                />
                                <ComboboxComponent
                                  fieldName="theme"
                                  placeHolder="Option name"
                                  chooses={variantOptions}
                                  selectedOptionName={option.name}
                                  onValueChange={(selectedName) => handleComboboxChange(option.id, selectedName.value)}
                                />
                              </Box>
                              <ButtonComponent
                                buttonVariant="monochromePlain"
                                buttonAlign="right"
                                buttonIcon={DeleteIcon}
                                buttonOnClick={() => removeOption(option.id)}
                              />
                            </InlineGrid>
                            <InlineGrid columns={3}>
                              {option.values.map((value, valueIndex) => (
                                <React.Fragment key={value.id}>
                                  <ButtonComponent buttonVariant="monochromePlain" buttonAlign="left" buttonIcon={DragHandleIcon} />
                                  <TextFieldComponent
                                    textLabel={valueIndex === 0 ? "Option values" : ""}
                                    textPlaceHolder="Add any value"
                                    textValue={value.value}
                                    onValueChange={(textFieldValue) => handleTextFieldChange(option.id, value.id, textFieldValue.value)
                                    }
                                  />
                                  <ButtonComponent
                                    buttonVariant="monochromePlain"
                                    buttonAlign="right"
                                    buttonIcon={DeleteIcon}
                                    buttonOnClick={() => removeOptionValue(option.id, value.id)}
                                  />
                                </React.Fragment>
                              ))}
                            </InlineGrid>
                            <Box className="myCustomTopMargin">
                              <InlineGrid columns={3}>
                                <Box as="span"></Box>
                                <ButtonComponent buttonTitle="Done" buttonOnClick={() => submitOption(option.id)} />
                                <Box as="span"></Box>
                              </InlineGrid>
                            </Box>
                          </>
                        }
                        <Box className="myCustomTopBottomMargin">
                          {options.length >= 0 && <Divider />}
                        </Box>
                      </React.Fragment>
                    ))}
                    <Box className="myCustomTopMargin">
                      {!options.length && <Divider />}
                      {options.length <= 2 && (
                        <ButtonComponent
                          buttonTitle="Add another option"
                          buttonVariant="plain"
                          buttonAlign="left"
                          buttonIcon={PlusIcon}
                          buttonOnClick={addOption}
                        />
                      )}
                    </Box>
                  </Card>
                }
                {!options.length && (
                  <ButtonComponent
                    buttonTitle="Add options like size or color"
                    buttonVariant="plain"
                    buttonAlign="left"
                    buttonIcon={PlusIcon}
                    buttonOnClick={addOption}
                  />
                )}
                {variants && !variants.some(variant => Object.keys(variant).length === 0) && <IndexTableComponent data={variants} setVariants={setVariants} handleValues={handleValues} convertVariants={convertVariants} />}
              </BlockStack>
            </Card>
          </BlockStack>
        </InlineGrid>
      </Box>
      <Box align="right">
        <ButtonComponent
          buttonTitle="Save"
          buttonVariant="primary"
          buttonLoading={loading}
          buttonOnClick={() => handleSubmit()}
        />
      </Box>
      {/* <PageActions
        primaryAction={{
          content: "Save",
          onAction: () => handleSubmit(),
        }}
      /> */}
    </Page>
  );
};

export default AddProductPage;
