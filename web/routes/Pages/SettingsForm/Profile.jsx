/**
 * SettingsProfile Component
 * 
 * This component provides an interface for viewing and managing the settings of a specific delivery profile. It allows users 
 * to see the products associated with the profile, manage shipping origins, and configure shipping zones and rates.
 * 
 * Props:
 * - None: This component relies on URL parameters and data fetched via API.
 * 
 * State:
 * - `selectedProfile` (object|null): The delivery profile data fetched from the API.
 * - `products` (array): List of products associated with the delivery profile.
 * - `currentPage` (number): Tracks the current page of products being displayed.
 * - `showShippingOrigins` (boolean): Controls whether the shipping origins section is expanded or collapsed.
 * - `expandedZones` (object): Tracks which shipping zones are expanded to show additional details.
 * - `expandedCountries` (object): Tracks which countries within a zone are expanded to show all included countries.
 * - `popoverActive` (object): Tracks which rate popover menus are active.
 * - `isRateModalOpen` (boolean): Controls the visibility of the rate editing modal.
 * - `rateToEdit` (object|null): The rate currently being edited.
 * 
 * Hooks:
 * - `useParams`: React Router hook used to access the delivery profile ID from the URL.
 * - `useNavigate`: React Router hook used for programmatic navigation between routes.
 * - `useFindMany`: Hook from the `@gadgetinc/react` library used to fetch delivery profile data from the API.
 * - `useEffect`: Used to fetch products and set the selected profile when the component mounts or when certain state variables change.
 * 
 * Handlers:
 * - `toggleCountryDisplay`: Toggles the display of all countries in a shipping zone.
 * - `toggleShippingOrigins`: Toggles the display of shipping origin details.
 * - `nextPage`: Moves to the next page of products.
 * - `prevPage`: Moves to the previous page of products.
 * - `handleEditRate`: Opens the modal for editing a specific shipping rate.
 * - `handleDeleteRate`: Deletes a specific shipping rate from a zone.
 * - `togglePopover`: Toggles the visibility of a rate's action popover menu.
 * - `generateRowMarkup`: Generates the rows for the shipping rates table within a zone.
 * - `handleSaveRate`: Saves changes to an edited rate.
 * 
 * Render:
 * - The component renders a `Page` layout containing sections for the delivery profile's products, shipping origins, and shipping zones.
 * - Products are displayed in a paginated list with options to navigate between pages.
 * - Shipping origins can be expanded or collapsed, and shipping zones are listed with options to edit or delete rates.
 * - The component conditionally renders a modal for editing shipping rates.
 * 
 * Usage:
 * - This component is used for managing the detailed settings of a delivery profile, including product association, shipping origins, and rate configurations within shipping zones.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Page, Layout, Card, Text, ResourceList, ResourceItem, Thumbnail, InlineStack, BlockStack, Divider, Icon, Bleed, Box, Pagination, Button, IndexTable, useBreakpoints, Banner, Popover, ActionList } from '@shopify/polaris';
import { useFindMany } from '@gadgetinc/react';
import { LocationIcon, ChevronDownIcon, ChevronUpIcon, GlobeIcon, MenuHorizontalIcon } from '@shopify/polaris-icons';
import { api } from "../../../api";
import AddRateModal from './AddRateModal'; // Import AddRateModal for editing rates
import "./profile.css";

function SettingsProfile() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [showShippingOrigins, setShowShippingOrigins] = useState(true);
    const [expandedZones, setExpandedZones] = useState({});
    const [expandedCountries, setExpandedCountries] = useState({});
    const [popoverActive, setPopoverActive] = useState({});
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [rateToEdit, setRateToEdit] = useState(null);
    const breakpoint = useBreakpoints();
    const productsPerPage = 5;

    const deliveryProfileId = `gid://shopify/DeliveryProfile/${id}`;

    const [{ data, fetching, error }] = useFindMany(api.kaghatiDeliveryProfiles, {
        filter: {
            deliveryProfileId: {
                equals: deliveryProfileId
            }
        }
    });

    const toggleCountryDisplay = (zoneId) => {
        setExpandedCountries(prev => ({
            ...prev,
            [zoneId]: !prev[zoneId]
        }));
    };

    const toggleShippingOrigins = () => {
        setShowShippingOrigins(!showShippingOrigins);
    };

    useEffect(() => {
        if (data && data.length > 0) {
            setSelectedProfile(data[0]);
        }
    }, [data]);

    useEffect(() => {
        if (selectedProfile) {
            const productIds = selectedProfile.profileItems.map(item => item);
            fetchProducts(productIds);
        }
    }, [selectedProfile, currentPage]);  // Handles fetching products for pagination

    const fetchProducts = async (productIds) => {
        const numericIds = productIds.map(id => id.split('/').pop());
        const startIndex = currentPage * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const idsSlice = numericIds.slice(startIndex, endIndex);

        const productData = await Promise.all(
            idsSlice.map(numericId =>
                api.shopifyProduct.findOne(numericId, {
                    select: {
                        id: true,
                        title: true,
                        images: {
                            edges: {
                                node: {
                                    source: true,
                                },
                            },
                        }
                    }
                })
            )
        );

        setProducts(productData.flat());
    };

    const hasNextPage = selectedProfile && ((currentPage + 1) * productsPerPage < selectedProfile.profileItems.length);
    const hasPreviousPage = currentPage > 0;

    const nextPage = () => {
        if (hasNextPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (hasPreviousPage) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleEditRate = (zoneId, rate) => {
        setRateToEdit({ zoneId, ...rate });
        setIsRateModalOpen(true);
    };

    const handleDeleteRate = async (zoneId, rateId) => {
        try {
            const updatedZones = selectedProfile.locationGroups.map(group => {
                const updatedEdges = group.locationGroupZones.edges.map(edge => {
                    if (edge.node.zone.id === zoneId) {
                        return {
                            ...edge,
                            node: {
                                ...edge.node,
                                methodDefinitions: {
                                    ...edge.node.methodDefinitions,
                                    edges: edge.node.methodDefinitions.edges.filter(methodEdge => methodEdge.node.id !== rateId)
                                }
                            }
                        };
                    }
                    return edge;
                });
                return {
                    ...group,
                    locationGroupZones: {
                        ...group.locationGroupZones,
                        edges: updatedEdges
                    }
                };
            });

            const response = await api.kaghatiDeliveryProfiles.update(selectedProfile.id, {
                locationGroups: updatedZones
            });

            if (response) {
                setSelectedProfile(prevProfile => ({
                    ...prevProfile,
                    locationGroups: updatedZones
                }));
            }
        } catch (error) {
            console.error("Error deleting rate:", error);
        }
    };

    const togglePopover = (rateId) => {
        setPopoverActive(prev => ({
            ...prev,
            [rateId]: !prev[rateId]
        }));
    };

    const generateRowMarkup = (methodDefinitions, zoneId) => {
        return methodDefinitions.map((method, index) => (
            <IndexTable.Row id={method.node.id} key={method.node.id}>
                <IndexTable.Cell>
                    <Text as="h3" variant="bodySm">
                        {method.node.name}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {method.node.description || '—'}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text numeric as="h3" variant="bodySm">
                        {method.node.rateProvider.price.amount} {method.node.rateProvider.price.currencyCode}
                    </Text>
                </IndexTable.Cell>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: "space-evenly", alignItems: 'right',marginRight:"0px" }}>
                <IndexTable.Cell>
                    <Popover
                        active={popoverActive[method.node.id]}
                        activator={<span plain onClick={() => togglePopover(method.node.id)}><Icon source={MenuHorizontalIcon} /></span>}
                        onClose={() => togglePopover(method.node.id)}
                    >
                        <ActionList
                            items={[
                                {
                                    content: 'Edit',
                                    onAction: () => handleEditRate(zoneId, method.node)
                                },
                                {
                                    content: 'Delete',
                                    onAction: () => handleDeleteRate(zoneId, method.node.id)
                                }
                            ]}
                        />
                    </Popover>
                </IndexTable.Cell>
                </div>
            </IndexTable.Row>
        ));
    };

    const handleSaveRate = async (updatedRate) => {
        const { zoneId, id: rateId, ...rateDetails } = updatedRate;

        try {
            const updatedZones = selectedProfile.locationGroups.map(group => {
                const updatedEdges = group.locationGroupZones.edges.map(edge => {
                    if (edge.node.zone.id === zoneId) {
                        return {
                            ...edge,
                            node: {
                                ...edge.node,
                                methodDefinitions: {
                                    ...edge.node.methodDefinitions,
                                    edges: edge.node.methodDefinitions.edges.map(methodEdge => {
                                        if (methodEdge.node.id === rateId) {
                                            return {
                                                ...methodEdge,
                                                node: {
                                                    ...methodEdge.node,
                                                    ...rateDetails
                                                }
                                            };
                                        }
                                        return methodEdge;
                                    })
                                }
                            }
                        };
                    }
                    return edge;
                });
                return {
                    ...group,
                    locationGroupZones: {
                        ...group.locationGroupZones,
                        edges: updatedEdges
                    }
                };
            });

            const response = await api.kaghatiDeliveryProfiles.update(selectedProfile.id, {
                locationGroups: updatedZones
            });

            if (response) {
                setSelectedProfile(prevProfile => ({
                    ...prevProfile,
                    locationGroups: updatedZones
                }));
                setIsRateModalOpen(false);
                setRateToEdit(null);
            }
        } catch (error) {
            console.error("Error saving rate:", error);
        }
    };

    console.log(selectedProfile?.locationGroups)
    if (fetching) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;
    if (!selectedProfile) return <Text>No profile found for ID: {id}</Text>;

    return (
        <div style={{ width: "100%", margin: "0 auto " }}>
            <Page
                title={selectedProfile.profileName}
                backAction={{ content: "Shipping", onAction: () => navigate("/shipping") }}>
                <Layout>
                    <Layout.Section>
                        <Card>
                            <BlockStack gap={200}>
                                <BlockStack>
                                    <Text as='h2' variant='headingSm'>Products</Text>
                                    <Text as="h3" variant="bodySm">All Products</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="bodySm">New Products are added to the profile</Text>
                                </BlockStack>
                                <Divider></Divider>
                            </BlockStack>

                            <ResourceList
                                resourceName={{ singular: 'product', plural: 'products' }}
                                items={products}
                                renderItem={(item) => {
                                    const { id, title, images } = item;
                                    return (
                                        <ResourceItem id={id}>
                                            <InlineStack gap={200}>
                                                <Thumbnail
                                                    source={images?.edges[0]?.node?.source || 'default_image.jpg'}
                                                    alt={`Thumbnail of ${title}`}
                                                    size=" extra small"
                                                />
                                                <Text as="h3" variant="bodySm">{title}</Text>
                                            </InlineStack>
                                        </ResourceItem>
                                    );
                                }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                <Pagination
                                    hasPrevious={hasPreviousPage}
                                    onPrevious={prevPage}
                                    hasNext={hasNextPage}
                                    onNext={nextPage}
                                />
                            </div>
                            <Bleed marginBlockEnd="400" marginInline="400">
                                <Box background="bg-surface-secondary" padding="400">
                                    <Text as="h3" variant="bodySm">To charge different rates for only certain products, create a new profile in <Link to="/settings-form">shipping setting</Link></Text>
                                </Box>
                            </Bleed>
                        </Card>
                        <Card gap="400">
                            <BlockStack gap={300}>
                               <BlockStack gap="200">
    <div style={{ display: "flex", flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
        <Text as="h2" variant="headingSm">Shipping origins</Text>
        <a href="#" onClick={toggleShippingOrigins} style={{
            textDecoration: 'none', color: 'skyBlue',
            fontWeight: 'bold',
            cursor: 'pointer', display: "flex",
            alignItems: 'center'
        }}>
            {showShippingOrigins ? 'Hide details' : 'Show details'}
            {showShippingOrigins ? <Icon source={ChevronUpIcon} /> : <Icon source={ChevronDownIcon} />}
        </a>
    </div>
    {showShippingOrigins ? (
        selectedProfile?.locationGroups?.map((group, groupIndex) => (
            group.locationGroup.locations.edges.map((location, locationIndex) => (
                <div key={locationIndex} style={{ display: "flex", alignItems: 'left', marginTop: '10px' }}>
                <div><Icon source={LocationIcon} />
                </div>
                    
                    <div style={{ marginLeft: '10px' }}>
                        <Text as="h3" variant="bodyMd" fontWeight="bold">{location.node.name}</Text>
                        <Text as="p" variant="bodySm">
                            {location.node.address.formatted.join(', ')}
                        </Text>
                    </div>
                </div>
            ))
        ))
    ) : (
       <Text variant="bodySm">
            {selectedProfile?.locationGroups?.flatMap((group) =>
                group.locationGroup.locations.edges.map((location) => location.node.name)
            ).join(', ')}
        </Text>
    )}
</BlockStack>



                                <Divider />
                                <BlockStack gap="200">
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text as="h2" variant="headingSm">Shipping zones</Text>
                                        <Link to="/create-shipping-zone" style={{
                                            textDecoration: "none", color: 'skyBlue',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}>Create zone</Link>
                                    </div>
                                    {selectedProfile.locationGroups.map((group) => (
                                        group.locationGroupZones.edges.map((edge) => (
                                            <BlockStack gap={200} key={edge.node.zone.id}>
                                                <div>
                                                    <div id={edge.node.zone.id} onClick={() => toggleZone(edge.node.zone.id)}>
                                                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                            <InlineStack>
                                                                <div style={{ margin: "10px" }}>
                                                                    {edge.node.zone.countries[0].name === "India" ?
                                                                        <img src="https://cdn.vectorstock.com/i/preview-1x/97/88/india-vector-2199788.jpg" width="15" height="15" /> :
                                                                        <Icon source={GlobeIcon} />
                                                                    }
                                                                </div>
                                                                <BlockStack gap={100}>
                                                                    <InlineStack>
                                                                        <Text as="h4" variant="headingXs">{edge.node.zone.name}</Text>
                                                                        <div> <Icon source={ChevronDownIcon} /></div>
                                                                    </InlineStack>
                                                                    {edge.node.zone.countries[0].name !== "India" && edge.node.zone.countries.length > 1 ?
                                                                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                                            <Text as="h3" variant="bodySm">
                                                                                {edge.node.zone.countries
                                                                                    .slice(0, expandedCountries[edge.node.zone.id] ? edge.node.zone.countries.length : 3)
                                                                                    .map(country => country.name)
                                                                                    .join(', ')}
                                                                            </Text>
                                                                            <a href="#" style={{
                                                                                textDecoration: 'none', color: 'skyBlue',
                                                                                fontWeight: 'bold',
                                                                                cursor: 'pointer', marginLeft: "5px"
                                                                            }} onClick={() => toggleCountryDisplay(edge.node.zone.id)}>
                                                                                {expandedCountries[edge.node.zone.id] ? 'Hide' : 'Show All'}
                                                                            </a>
                                                                        </div>
                                                                        :
                                                                        <Text as='h4' variant='bodyXs'>{edge.node.zone.countries[0].name}</Text>
                                                                    }
                                                                </BlockStack>
                                                            </InlineStack>
                                                            <BlockStack align='end'>
                                                                <Icon source={MenuHorizontalIcon} />
                                                            </BlockStack>
                                                        </div>
                                                        {expandedZones[edge.node.zone.id] && (
                                                            <div className="shipping-zone-item">
                                                                <div className="country-flag">
                                                                    <img src="https://cdn.vectorstock.com/i/preview-1x/97/88/india-vector-2199788.jpg" width="20" height="20" />
                                                                </div>
                                                                <a className="country-name">{edge.node.zone.countries[0].name}</a>
                                                                <div className="country-price">{edge.node.zone.countries[0].name}</div>
                                                                <div className="more-options">...</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {edge.node.zone.countries[0].name !== "India" && edge.node.zone.countries.length > 1 &&
                                                        <Banner title="Customers in International won't be able to checkout because all countries/regions are in an inactive market. To activate, go to markets" tone="info">
                                                        </Banner>
                                                    }
                                                    <BlockStack>
                                                        <IndexTable
                                                            condensed={breakpoint.smDown}
                                                            resourceName={{ singular: 'rate', plural: 'rates' }}
                                                            itemCount={edge.node.methodDefinitions.edges.length}
                                                            headings={[
                                                                { title: 'Rate name' },
                                                                { title: 'Condition' },
                                                                { title: 'Price' },
                                                                { title: '' }, // Empty header for the actions column
                                                            ]}
                                                            selectable={false}
                                                        >
                                                            {generateRowMarkup(edge.node.methodDefinitions.edges, edge.node.zone.id)}
                                                        </IndexTable>
                                                    </BlockStack>
                                                    <div><Button>Add rate</Button></div>
                                                </div>
                                            </BlockStack>
                                        ))
                                    ))}
                                </BlockStack>
                                <Bleed>
                                    <InlineStack gap={300}>
                                        <BlockStack>
                                            <Icon source={GlobeIcon} />
                                        </BlockStack>
                                        <BlockStack>
                                            <Text as='h3' variant='headingSm'>Not covered by your shipping zones</Text>
                                            <InlineStack>
                                                <Text as="h3" variant="bodySm">0 countries and regions</Text>
                                                <div>
                                                    <Icon source={ChevronDownIcon} />
                                                </div>
                                            </InlineStack>
                                            <a href='#' style={{
                                                textDecoration: 'none', color: 'skyBlue',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}>Create zone</a>
                                        </BlockStack>
                                    </InlineStack>
                                </Bleed>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
            {isRateModalOpen && (
                <AddRateModal
                    isOpen={isRateModalOpen}
                    onClose={() => setIsRateModalOpen(false)}
                    onRateSubmit={handleSaveRate}
                    initialRate={rateToEdit}
                />
            )}
        </div>
    );
}

export default SettingsProfile;