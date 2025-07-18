/**
 * DeliveryCustomizations Component
 * 
 * This component provides an interface for managing delivery customizations. It displays an empty state when no customizations 
 * have been created and offers the ability to navigate to a form for adding new delivery customizations.
 * 
 * State:
 * - None: This component primarily handles navigation and UI rendering without managing complex state.
 * 
 * Hooks:
 * - `useNavigate`: React Router hook used for programmatic navigation between routes.
 * 
 * Handlers:
 * - Navigates to the shipping page via the back action button.
 * - Navigates to the settings form for adding a new delivery customization via the primary action button.
 * 
 * Render:
 * - The component renders a `Page` layout with a `MediaCard` displaying an empty state when there are no delivery customizations.
 * - The empty state includes an illustration, a message indicating no customizations have been created, and a button to add a new customization.
 * 
 * Usage:
 * - This component is used as part of a delivery or shipping settings interface, providing users with an entry point to manage delivery customizations.
 * - It is designed to handle scenarios where no customizations exist, guiding users to create their first customization.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Page, Layout, Card, Text, ResourceList, ResourceItem, Thumbnail, InlineStack, BlockStack, Divider, Icon, Bleed, Box, Pagination, Button, MediaCard } from '@shopify/polaris';
import { useFindMany } from '@gadgetinc/react';
import { LocationIcon, ChevronDownIcon, ChevronUpIcon, GlobeIcon } from '@shopify/polaris-icons';
import { api } from "../../../api";

function DeliveryCustomizations() {
    const navigate = useNavigate();

    return (
        <div style={{ width: "100%", margin: "0 auto" }}>
            <Page
                title="Delivery Customizations"
                backAction={{ content: "delivery-customizations", onAction: () => navigate("/shipping") }}
                primaryAction={{
                    content: 'Add a customization',
                    onAction: () => navigate("/settings-form"),
                }}
            >
                <Layout>
                    <Layout.Section>
                        <MediaCard
                            title=""
                            portrait
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <img
                                        alt="Delivery customizations illustration"
                                        style={{
                                            width: '20%',
                                            height: '20%',
                                            objectFit: 'cover',
                                            background: '#f9fafb', // This color should match the background of the card
                                        }}
                                        src="https://cdn.shopify.com/shopifycloud/web/assets/v1/vite/client/en/assets/empty-state-qdh7TMTzhOGm.svg"
                                    />
                                </div>
                                <BlockStack gap={500}>
                                    <InlineStack align='center'>
                                    <Text as="h3" variant="headingSm">
                                        You haven't created any delivery customizations yet
                                    </Text>
                                    </InlineStack>
                                    <InlineStack align='center'>
                                    <Button variant='primary'>
                                        Add a customization
                                    </Button>
                                    </InlineStack>
                                </BlockStack>
                            </div>
                        </MediaCard>
                    </Layout.Section>
                </Layout>
            </Page>
        </div>
    );
}

export default DeliveryCustomizations;