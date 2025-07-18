/**
 * ProductDetailPage Component
 *
 * This component displays detailed information about a specific product, including its title, description,
 * media, pricing, inventory, shipping details, and organizational attributes. It fetches product data using
 * the provided product ID and renders various sections with editable and read-only fields, media previews,
 * and lists. The component also includes functionality for displaying product variants in a table and handling
 * user interactions with elements such as buttons and checkboxes.
 *
 * Features:
 * - Displays product details including title, description, images, and variants.
 * - Provides sections for pricing, inventory, shipping, and product organization.
 * - Integrates with Shopify Polaris components for a consistent user experience.
 * - Allows toggling of sales channels and markets with interactive UI elements.
 * - Uses API calls to fetch product data and handle form display logic.
 * - Displays loading spinner while data is being fetched.
 * - Renders product variants in an index table with selectable rows.
 *
 * Usage:
 *
 * <ProductDetailPage />
 *
 * Dependencies:
 * - React hooks (useState, useEffect)
 * - Polaris components from Shopify (Page, Card, BlockStack, InlineStack, TextField, Button, Tag, Thumbnail, IndexTable, Spinner)
 * - Gadget API for fetching product details (useFindOne)
 * - React Router for navigation (useNavigate, useParams)
 * - Custom components (TextComponent, TextFieldComponent, CheckboxComponent, ListComponent, ComboboxComponent, SelectComponent, ButtonComponent, PopoverComponent, SpinnerComponent)
 * - Utility functions (convertHTMLToText)
 *
 * Example:
 *
 * <ProductDetailPage />
 *
 * Props:
 * - No props are required. The component uses the `id` from URL parameters to fetch and display product details.
 *
 * Note:
 * - Ensure that the API endpoints for fetching product data and managing product variants are correctly configured.
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Page,
  InlineGrid,
  BlockStack,
  InlineStack,
  Card,
  Text,
  FormLayout,
  Link,
  Divider,
  Tag,
  Icon,
  Thumbnail,
  Box,
  IndexTable,
  TextField,
  useIndexResourceState
} from "@shopify/polaris";
import TextComponent from "../../../components/TextComponent";
import TextFieldComponent from "../../../components/TextFieldComponent";
import CheckboxComponent from "../../../components/CheckboxComponent";
import ListComponent from "../../../components/ListComponent";
import ComboboxComponent from "../../../components/ComboboxComponent";
import SelectComponent from "../../../components/SelectComponent";
import ButtonComponent from "../../../components/ButtonComponent";
import PopoverComponent from "../../../components/ButtonComponent";
import SpinnerComponent from "../../../components/SpinnerComponent";
import {
  MobileIcon,
  SearchIcon,
  DragHandleIcon,
} from "@shopify/polaris-icons";
import { useFindOne } from "@gadgetinc/react";
import { api } from "../../../api";
import { convertHTMLToText } from "../../../util/commonFunctions";

const ProductDetailPage = () => {
  const navigate = useNavigate();
  let { id } = useParams();
  const [buttonClick, setButtonClick] = useState(false);
  const [productData, setProductData] = useState();

  const [{ data, fetching, error }] = useFindOne(api.shopifyProduct, id, {
    select: {
      id: true,
      title: true,
      body: true,
      status: true,
      productCategory: true,
      productType: true,
      vendor: true,
      tags: true,
      templateSuffix: true,
      images: {
        edges: {
          node: {
            source: true,
            alt: true,
          },
        },
      },
      variants: {
        edges: {
          node: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
      options: {
        edges: {
          node: {
            id: true,
            name: true,
            values: true,
          },
        },
      }
    },
  });

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

  useEffect(() => {
    data && setProductData(data)
  }, [data])

  const resourceName = {
    singular: 'variantData',
    plural: 'variantDatas',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(productData?.variants?.edges);

  const rowMarkup = productData && productData?.variants?.edges?.map(
    (variant, index) => {
      return (
        <IndexTable.Row
          id={variant?.node?.id}
          key={index}
          selected={selectedResources.includes(variant?.node?.id)}
          position={variant?.node?.id}
          disabled={true}
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
                    {variant?.node?.title}
                  </Text>
                </Box>
              </InlineStack>
            </Box>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <TextField
              prefix="₹"
              placeholder="0.00"
              value={variant?.node?.title}
              readOnly
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <TextField
              placeholder="0"
              readOnly
            />
          </IndexTable.Cell>
        </IndexTable.Row>
      )
    },
  );

  return (
    <>
      {
        productData ? (
          <Page
            backAction={{ content: "Products", onAction: () => navigate(-1) }}
            title={productData?.title}
          >

            <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="400">
              <BlockStack gap="400">
                <Card roundedAbove="sm">
                  <BlockStack gap="400">
                    <TextFieldComponent
                      textLabel="Title"
                      textValue={productData?.title}
                      textReadOnly={true}
                    />
                    <TextFieldComponent
                      textLabel="Description"
                      textMultiLine={4}
                      textValue={convertHTMLToText(productData?.body)}
                      textReadOnly={true}
                    />
                  </BlockStack>
                </Card>
                <Card roundedAbove="sm">
                  <BlockStack gap="400">
                    <Text variant="headingSm" as="h6">
                      Media
                    </Text>
                    <InlineStack gap="200">
                      {productData?.images?.edges?.map((image, index) => (
                        <Thumbnail
                          key={index}
                          source={image?.node?.source}
                          size="large"
                          alt={image?.node?.alt}
                        />
                      ))}
                    </InlineStack>
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
                      // selectOptions={WeightOptions}
                      // onValueChange={handleValues}
                      />
                    </TextFieldComponent>
                    <Divider />
                    <SelectComponent
                      fieldName="countryOrigin"
                      selectLabel="Country/Region of origin"
                    // selectOptions={themeOptions}
                    // onValueChange={handleValues}
                    />
                    <TextComponent
                      textTitle="Harmonized System (HS) code"
                      textVariant="bodyMd"
                      textAs="span"
                    />
                    <ComboboxComponent
                      fieldName="productKeywordOrCode"
                      placeHolder="Search by product keyword or code"
                    // chooses={productKeywordOrCode}
                    // onValueChange={handleValues}
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
                    <TextFieldComponent
                      textLabel="Status"
                      textValue={productData?.status}
                      textReadOnly={true}
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
                      <ButtonComponent buttonVariant="plain" buttonAlign="right">
                        <Icon
                          source={MobileIcon}
                          tone="base"
                          onClick={() => setButtonClick(!buttonClick)}
                        />
                      </ButtonComponent>
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
                    <TextFieldComponent
                      textLabel="Product category"
                      textValue={productData?.productCategory?.productTaxonomyNode?.fullName}
                      textReadOnly={true}
                    />
                    <TextFieldComponent
                      textLabel="Product type"
                      textValue={productData?.productType}
                      textReadOnly={true}
                    />
                    <TextFieldComponent
                      textLabel="Vendor"
                      textValue={productData?.vendor}
                      textReadOnly={true}
                    />
                    <TextComponent
                      textTitle="Tags"
                      textVariant="bodyMd"
                      textAs="span"
                      textTone="subdued"
                    />
                    <InlineStack gap="200">
                      {productData?.tags?.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                    </InlineStack>
                  </BlockStack>
                </Card>
                <Card roundedAbove="sm">
                  <BlockStack gap="400">
                    <TextFieldComponent
                      textLabel="Theme template"
                      textValue={productData?.templateSuffix || "Default product"}
                      textReadOnly={true}
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
                      <Card>
                        {productData?.options?.edges?.map((option, index) => (
                          <InlineStack gap="400" key={index}>
                            <ButtonComponent
                              buttonVariant="monochromePlain"
                              buttonAlign="left"
                              buttonIcon={DragHandleIcon}
                            />
                            <Box>
                              <TextComponent
                                textTitle={option?.node?.name}
                                textVariant="headingSm"
                                textAs="h6"
                              />
                              {option?.node?.values.map((value, index) => (
                                <Box as="span" className="myCustomLeftMargin" key={index}>
                                  <Tag>{value}</Tag>
                                </Box>
                              ))}
                            </Box>
                          </InlineStack>
                        ))}
                      </Card>
                      <Card>
                        <IndexTable
                          resourceName={resourceName}
                          itemCount={productData.variants.edges.length}
                          selectedItemsCount={
                            allResourcesSelected ? 'All' : selectedResources.length
                          }
                          onSelectionChange={handleSelectionChange}
                          disabled={true}
                          headings={[
                            { title: 'Variant' },
                            { title: 'Price' },
                            { title: 'Available' },
                          ]}
                        >
                          {rowMarkup}
                        </IndexTable>
                      </Card>
                    </BlockStack>
                  </Card>
                </BlockStack>
              </InlineGrid>
            </Box>
          </Page>
        ) : (
          <SpinnerComponent />
        )}
    </>
  );
};

export default ProductDetailPage;
