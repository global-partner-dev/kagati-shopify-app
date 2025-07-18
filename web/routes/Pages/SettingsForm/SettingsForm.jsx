/**
 * ShippingAndDeliverySettings Component
 * 
 * This component provides an interface for managing shipping and delivery settings within an application. Users can view and 
 * navigate to different delivery profiles, create new shipping profiles, and manage delivery customizations.
 * 
 * State:
 * - `automatedDeliveryDatesEnabled` (boolean): Placeholder state indicating if automated delivery dates are enabled (currently unused).
 * - `manualDeliveryDatesEnabled` (boolean): Placeholder state indicating if manual delivery dates are enabled (currently unused).
 * - `deliveryProfiles` (array|null): List of delivery profiles fetched from the API.
 * - `hover` (boolean): Tracks hover state for styling the "Create New Profile" link.
 * 
 * Hooks:
 * - `useFindMany`: Hook from the `@gadgetinc/react` library used to fetch delivery profile data from the API.
 * - `useEffect`: Hook used to set the delivery profiles when data is fetched from the API.
 * 
 * Handlers:
 * - None: The component primarily handles rendering and navigation via React Router `Link` components.
 * 
 * Render:
 * - The component renders a `Page` layout containing sections for managing shipping and delivery settings.
 * - A list of delivery profiles is displayed, each with a link to its detailed settings page.
 * - The "Create New Profile" section allows users to navigate to a page for creating custom shipping rates.
 * - A section for managing delivery customizations is also provided, with a link to add new customizations.
 * 
 * Usage:
 * - This component is intended for use in settings or configuration pages where users need to manage shipping rates and delivery options.
 * - The component fetches data from an API and provides navigation links for further customization.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFindMany } from '@gadgetinc/react';
import { api } from "../../../api";
import {
    Page,
    Layout,
    Card,
    InlineStack,
    BlockStack,
    Icon,
    Text,
    Box
} from '@shopify/polaris';
import {
    InfoIcon, ChevronRightIcon, LocationIcon, ArrowRightIcon, GlobeIcon
} from '@shopify/polaris-icons';

function ShippingAndDeliverySettings() {
    const [automatedDeliveryDatesEnabled, setAutomatedDeliveryDatesEnabled] = useState(false);
    const [manualDeliveryDatesEnabled, setManualDeliveryDatesEnabled] = useState(false);
    const [deliveryProfiles, setDeliveryProfiles] = useState(null);
    const [hover, setHover] = useState(false);

    const [{ data, fetching, error }] = useFindMany(api.kaghatiDeliveryProfiles);

    useEffect(() => {
        if (data) {
            setDeliveryProfiles(data);
        }
    }, [data]);

    return (
        
            <Page title="Shipping and delivery">
                <Layout>
                    <Layout.Section>
                        <BlockStack gap={500}>
                            <Card sectioned>
                                <div style={{ marginBottom: "20px" }}>
                                    <BlockStack>
                                        <InlineStack align='start'>
                                            <Text as="h2" variant="headingSm">Shipping</Text>
                                            <div style={{ display: "flex", marginBottom: "3px" }}>
                                                <Icon source={InfoIcon} tone="base" /></div>
                                        </InlineStack>
                                        <Text>Choose where you ship and how much you charge for shipping at checkout</Text>
                                    </BlockStack>
                                </div>
                                {deliveryProfiles && deliveryProfiles.map((profile, index) => {
                                    const isGeneral = profile.profileName ==="General Profile";
                                    const groupName = isGeneral ? "General Shipping Rates" : `Custom Shipping Rate (${index})`;
                                    console.log(profile.deliveryProfileId)
                                    return (
                                        <div key={profile.id}>
                                            <BlockStack gap="300">
                                                <BlockStack>
                                                    <Text as="h2" variant="headingSm">{profile.profileName}</Text>
                                                </BlockStack>
                                                <Box borderColor="border" borderWidth="025" borderRadius="100">
                                                    <Link to={`/shipping/profiles/${profile?.deliveryProfileId?.split('/').pop()}`} style={{ textDecoration: 'none' }}>
                                                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", margin: "12px" }}>
                                                            {isGeneral && (
                                                                <BlockStack>
                                                                    <Text as="h3" variant="headingSm">General</Text>
                                                                    <Text>All Products</Text>
                                                                </BlockStack>
                                                            )}
                                                            <BlockStack>
                                                                <Text as="h3" variant="headingSm">Rates for</Text>
                                                                <InlineStack gap={200}>
                                                                    <Icon source={LocationIcon} tone="base" />
                                                                    <Text>{profile.originLocationCount} locations</Text>
                                                                    <Icon source={ArrowRightIcon} tone="base" />
                                                                    <Icon source={GlobeIcon} tone="base" />
                                                                    <Text>{profile.locationGroups[0].locationGroupZones.edges.length} zones</Text>
                                                                </InlineStack>
                                                            </BlockStack>
                                                            <div style={{ display: "flex", flexDirection: "row", sticky: "right" }}>
                                                                <Icon source={ChevronRightIcon} tone="base" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </Box>
                                            </BlockStack>
                                        </div>
                                    );
                                })}
                                <div style={{ marginTop: "15px" }}>
                                    <InlineStack gap={300}>
                                        <BlockStack>
                                            <Text as="h2" variant="headingSm">Custom Shipping Rates</Text>
                                        </BlockStack>

                                        <Box borderColor="border" borderWidth="025" borderRadius="100" width="100%">
                                            <div style={{ display: "flex", margin: "12px", justifyContent: "center" }}>
                                                <BlockStack>
                                                    <Text>Add custom rates or destination restrictions for groups of products</Text>
                                                    <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                                                        <Link to="/shipping/profiles/create"
                                                            onMouseEnter={() =>
                                                                setHover(true)}
                                                            onMouseLeave={() =>
                                                                setHover(false)}
                                                            style={{
                                                                textDecoration: hover ? 'underline' : 'none',
                                                                color: 'skyBlue',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer'
                                                            }}>
                                                            Create New Profile</Link>
                                                    </div>
                                                </BlockStack>
                                            </div>
                                        </Box>
                                    </InlineStack>
                                </div>
                            </Card>
                            <Card>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                    <BlockStack>
                                        <Text as="h2" variant="headingSm">Delivery Customizations</Text>
                                        <div style={{ textWrap: "pretty" }}>
                                            Customizations control how delivery options appear to buyers at checkout. You can
                                            hide, reorder and rename delivery options
                                        </div>
                                    </BlockStack>
                                    <BlockStack>
                                        <Link to="/shipping/customizations" style={{ display: "flex", textDecoration: 'none', color: 'skyBlue', fontWeight: 'bold', cursor: 'pointer', textWrap: "nowrap" }}>Add a Customization</Link>
                                    </BlockStack>
                                </div>
                            </Card>
                        </BlockStack>
                    </Layout.Section>
                </Layout>
            </Page>
        
    );
}

export default ShippingAndDeliverySettings;