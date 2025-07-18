/**
 * CustomerDetailPage Component
 * 
 * This component displays detailed information about a specific customer, including their contact details, last order, 
 * marketing preferences, addresses, and additional notes or tags. It provides a comprehensive view of the customer's 
 * history and interactions.
 * 
 * Features:
 * - Displays customer's name, contact information, and address.
 * - Shows the last order placed by the customer with an option to view all orders.
 * - Allows toggling between showing a few or all products in the last order.
 * - Provides options to duplicate, archive, or delete the customer.
 * - Includes marketing preferences, tax exemptions, tags, and notes for the customer.
 * - Uses Polaris components for styling and layout.
 * - Handles loading and error states when fetching customer data.
 * 
 * Usage:
 * 
 * <CustomerDetailPage />
 */

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Page, Avatar, InlineGrid, BlockStack, InlineStack, Badge, Card, Box, Divider, SkeletonBodyText, Text, Thumbnail, Button, Link, TextField, Icon

} from "@shopify/polaris";
import { ArchiveIcon, DeleteIcon, DuplicateIcon, EditIcon } from '@shopify/polaris-icons';
import { useFindOne } from "@gadgetinc/react";
import { api } from "../../../api";
import '../../../assets/styles/List.css';
import { formaterDate, objectEqual } from "../../../util/commonFunctions";
import TextComponent from "../../../components/TextComponent";
const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [customerData, setCustomerData] = useState();
  const SkeletonLabel = (props) => {
    return (
      <Box
        background="bg-fill-tertiary"
        minHeight="1rem"
        maxWidth="5rem"
        borderRadius="base"
        {...props}
      />
    );
  };



  const Placeholder = ({ staticContent, dynamicContent, height = 'auto', width = 'auto', showBorder = false }) => {
    return (
      <div
        style={{
          background: 'var(--p-color-default)',
          height: height,
          width: width,
          borderInlineStart: showBorder ? '1px dashed var(--p-color-text)' : 'none',
          padding: '8px', // Add some padding for better spacing
          display: 'flex',
          flexDirection: 'column', // Stack children vertically
          alignItems: 'center', // Center children horizontally
          justifyContent: 'center', // Center children vertically if height allows
        }}
      >
        <div>{staticContent}</div>
        <div style={{ fontWeight: 'bold' }}>{dynamicContent}</div>
      </div>
    );
  };
  const customerId = 'the-customer-id';
  const [{ data, fetching, error }] = useFindOne(api.shopifyCustomer, id, {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      acceptsMarketing: true,
      createdAt: true,
      updatedAt: true,
      acceptsMarketingUpdatedAt: true,
      currency: true,
      defaultAddressId: true,
      emailMarketingConsent: true,
      marketingOptInLevel: true,
      metafield: true,
      multipassIdentifier: true,
      note: true,
      ordersCount: true,
      phone: true,
      smsMarketingConsent: true,
      shopifyState: true,
      tags: true,
      taxExempt: true,
      taxExemptions: true,
      totalSpent: true,
      verifiedEmail: true,
      lastOrder: {
        id: true,
        name: true,
        financialStatus: true,
        fulfillmentStatus: true,
        shopifyCreatedAt: true,
        totalPrice: true,
        lineItems: {
          edges: {
            node: {
              title: true,
              price: true,
              quantity: true,
              sku: true,
              variantTitle: true
            }
          }
        }
      },
      addresses: {
        edges: {
          node: {
            id: true,
            firstName: true,
            lastName: true,
            address1: true,
            address2: true,
            city: true,
            province: true,
            country: true,
            zipCode: true,
            phone: true,
            provinceCode: true,
          }
        }
      },
    },
  });
  if (fetching) return <div>Loading...</div>;
  if (error) return <div>Error loading customer details</div>;
  const toggleShowAllProducts = () => {
    setShowAllProducts(!showAllProducts);
  };



  return (
    <Page
      backAction={{ content: "Customers", onAction: () => navigate("/customers") }}
      title={`${data.firstName} ${data.lastName}`}
      subtitle={`${data.addresses.edges[0].node.city},${data.addresses.edges[0].node.province},${data.addresses.edges[0].node.country}`}
      secondaryActions={[
        {
          content: "Duplicate",
          icon: DuplicateIcon,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
        {
          content: "Archive",
          icon: ArchiveIcon,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Archive action"),
        },
        {
          content: "Delete",
          icon: DeleteIcon,
          destructive: true,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Delete action"),
        },
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="400">
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <InlineStack>
                <Placeholder width="32%" height="40px" staticContent="All Time" dynamicConten="" />
                <Placeholder width="32%" height="40px" showBorder staticContent="Amount Spent" dynamicContent={data.totalSpent} />
                <Placeholder width="32%" height="40px" showBorder staticContent="Orders" dynamicContent={data.ordersCount} />
              </InlineStack>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text as="span" fontWeight="bold">Last Order Placed</Text><br />
            </BlockStack>

            {data.lastOrder ? (
              <BlockStack>
                <Card>
                  <InlineStack align="space-between">
                    <BlockStack gap="200">
                      <InlineStack>
                        <Text as="span" fontWeight="bold">{data.lastOrder.name}</Text>
                        <Badge tone={data.lastOrder.financialStatus === 'pending' ? 'warning' : 'success'}>
                          {data.lastOrder.financialStatus === 'pending' ? 'Payment Pending' : 'Paid'}
                        </Badge>
                        <Badge tone={data.lastOrder.fulfillmentStatus === null ? "attention" : ""}>
                          {data.lastOrder.fulfillmentStatus === null ? "Unfulfilled" : "Fulfilled"}
                        </Badge>
                      </InlineStack>
                      <Text as="span" color="subdued" align="left">
                        {formaterDate(data.lastOrder.shopifyCreatedAt)} from Draft Orders
                      </Text>
                    </BlockStack>

                    <Text as="span" fontWeight="bold" align="right">{data.lastOrder.totalPrice}</Text>
                  </InlineStack>
                  {data.lastOrder.lineItems.edges.slice(0, showAllProducts ? data.lastOrder.lineItems.edges.length : 3).map((item, index) => (
                    <BlockStack gap="200" key={index}>
                      <Divider />
                      <Box paddingBlockEnd="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <Thumbnail
                            source='https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg'
                            alt={item.node.title}
                            size="small"
                          />
                          <Box as="span" paddingInlineStart="400">
                            <Link url="#" removeUnderline>
                              <Text as="span" variant="bodyMd" fontWeight="semibold" alignment="start">
                                {item.node.title}
                              </Text>
                            </Link>
                            {item.node.variantTitle && <Badge>{item.node.variantTitle}</Badge>}
                          </Box>
                          <Text as="h6" variant="headingXs">
                            {item.node.price} X {item.node.quantity}
                          </Text>
                          <Text as="h6" variant="headingXs">
                            {item.node.price}
                          </Text>
                        </InlineStack>
                      </Box>
                    </BlockStack>
                  ))}
                </Card>
                <br />
                <InlineStack alignment="center" align="space-between">
                  <BlockStack>
                    <Button onClick={toggleShowAllProducts} size="slim">
                      {showAllProducts ? 'Show less' : `Show all ${data.lastOrder.lineItems.edges.length} products`}
                    </Button>
                  </BlockStack>
                  <InlineStack>
                    <Button size="slim" onClick={() => navigate(`/orders?customerId=${id}`)}>View all orders</Button>
                    <Button primary size="slim" onClick={() => navigate(`/orders/draft/new?customerId=${id}`)}>Create order</Button>

                  </InlineStack>
                </InlineStack>
              </BlockStack>
            ) : (
              <Text>No last order information available.</Text>
            )}
          </Card>



          <Card>
            <BlockStack>
              <InlineStack align="space-between">
                <InlineStack gap={200}>
                  <Badge tone="success" fontWeight='bold'>VS</Badge>
                  <input type="text"
                    placeholder="Leave a comment"

                    autoComplete="off"
                    style={{
                      flex: 1,
                      border: 'none',
                      boxShadow: 'none',
                      backgroundColor: 'transparent',
                      margin: '0 8px',
                      width: '75%'
                    }}
                  />
                </InlineStack>

                <Button align="right">Post</Button>
              </InlineStack>

            </BlockStack>
          </Card>
        </BlockStack>

        <BlockStack gap={{ xs: "400", md: "200" }}>
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
                  textTitle={`${data.firstName} ${data.lastName}`}
                />

              </Link>
              <TextComponent
                textAs="span"
                textVariant="bodyMd"
                textTone="subdued"
                textTitle="1 order"
              />
              <TextComponent
                textTitle="Contact information"
                textVariant="headingSm"
                textAs="h6"
              />
              {data.email ? (
                <Link url="#" removeUnderline>
                  {data.email}
                </Link>
              ) : (
                <TextComponent
                  textAs="span"
                  textVariant="bodyMd"
                  textTone="subdued"
                  textTitle="No email provided"
                />
              )}
              {data.phone ? (
                <Link url="#" removeUnderline>
                  {data.phone}
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
                textTitle="Default address"
                textVariant="headingSm"
                textAs="h6"
              />
              {data?.addresses ? (
                <>
                  <TextComponent
                    textAs="span"
                    textVariant="bodyLg"
                    textTone="subdued"
                    textTitle={`${data.addresses.edges[0].node.firstName} ${data.addresses.edges[0].node.lastName}`}
                  ></TextComponent>
                  <TextComponent
                    textAs="span"
                    textVariant="bodyLg"
                    textTone="subdued"
                    textTitle={`${data.addresses.edges[0].node.address1}`}
                  ></TextComponent>
                  <TextComponent
                    textAs="span"
                    textVariant="bodyLg"
                    textTone="subdued"
                    textTitle={`${data.addresses.edges[0].node.zipCode} ,${data.addresses.edges[0].node.city} ,${data.addresses.edges[0].node.province}`}
                  ></TextComponent>
                  <TextComponent
                    textAs="span"
                    textVariant="bodyLg"
                    textTone="subdued"
                    textTitle={data.addresses.edges[0].node.country}
                  ></TextComponent>
                  <TextComponent
                    textAs="span"
                    textVariant="bodyLg"
                    textTone="subdued"
                    textTitle={data.addresses.edges[0].node.phone}
                  ></TextComponent>
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
                textTitle="Marketing"
                textVariant="headingSm"
                textAs="h6"
              />
              <BlockStack gap="100">

                <InlineStack gap="100">
                  <Badge
                    tone={data.emailMarketingConsent ? 'success' : 'warning'}
                  ></Badge>
                  {data.emailMarketingConsent ? 'Email subscribed' : 'Email not subscribed'}
                </InlineStack>
                <InlineStack gap='100'>
                  <Badge
                    tone={data.smsMarketingConsent ? 'success' : 'warning'}
                  ></Badge>
                  {data.smsMarketingConsent ? 'Sms Subscribed' : 'Sms not subscribed'}
                </InlineStack>


              </BlockStack>



              <TextComponent
                textTitle="Tax Exemptions"
                textVariant="headingSm"
                textAs="h6"
              />
              <TextComponent
                textAs="span"
                textVariant="bodyMd"
                textTone="subdued"
                textTitle={data.taxExemptStatus ? "Taxes are not collected" : "Taxes are collected"}
              />


            </BlockStack>

          </Card>
          <Card>
            <BlockStack gap='100'>
              <InlineStack align="space-between">
                <TextComponent
                  textTitle="Tags"
                  textVariant="headingSm"
                  textAs="h6"
                />
                <button style={{
                  border: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                }}> <Icon source={EditIcon} tone="base" /></button>
              </InlineStack>

              <input type="text" />
            </BlockStack>

          </Card>
          <Card>
            <BlockStack gap='100'>
              <InlineStack align="space-between">
                <TextComponent
                  textTitle="Notes"
                  textVariant="headingSm"
                  textAs="h6"
                />
                <button style={{
                  border: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                }}> <Icon source={EditIcon} tone="base" /></button>

              </InlineStack>

              <input type="text" />
            </BlockStack>
          </Card>
        </BlockStack>
      </InlineGrid>
    </Page>
  );

};

export default CustomerDetailPage;
