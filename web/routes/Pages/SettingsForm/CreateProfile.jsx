/**
 * CreateProfile Component
 * 
 * This component allows users to create a new shipping profile, configure products, shipping origins, zones, and rates. 
 * It provides a form with the following sections:
 * 
 * - **Profile Name**: A text field to input the name of the shipping profile.
 * - **Products**: A section to manage and select products included in this shipping profile.
 * - **Shipping Origins**: Displays the locations from where products will be shipped.
 * - **Shipping Zones**: Allows users to create and manage zones for different shipping rates and methods.
 * 
 * State:
 * - `profileName` (string): The name of the shipping profile being created.
 * - `allProducts` (array): List of all products available for selection.
 * - `selectedProducts` (array): List of products selected to be included in the profile.
 * - `selectedProfile` (object): The currently selected profile data fetched from the API.
 * - `showZoneDetails` (boolean): Toggles the visibility of the shipping zone details.
 * - `showShippingOrigins` (boolean): Toggles the visibility of the shipping origins details.
 * - `hover` (boolean): Tracks hover state for interactive elements.
 * - `toastActive` (boolean): Controls the visibility of toast notifications.
 * - `toastContent` (string): Content of the toast message.
 * - `isModalOpen` (boolean): Controls the visibility of the product selection modal.
 * - `isShippingZoneModalOpen` (boolean): Controls the visibility of the shipping zone creation modal.
 * - `selectedZones` (array): List of selected shipping zones.
 * - `rates` (array): List of shipping rates for the selected zones.
 * - `isRateModalOpen` (boolean): Controls the visibility of the rate addition modal.
 * - `isZoneModalOpen` (string|null): Controls the visibility of specific zone modals by zone name.
 * - `selected` (array): Tracks the selection state of the active profile section.
 * - `isActive` (boolean): Indicates the active status of the profile.
 * - `shippingOrigins` (array): List of shipping origin locations associated with the selected profile.
 * - `selectedOrigin` (object|null): The currently selected origin location.
 * 
 * Handlers:
 * - `handleSaveProfile`: Saves the newly created or updated shipping profile.
 * - `handleDiscard`: Discards changes and navigates back to the previous page.
 * - `handleAddProducts`: Opens the product selection modal.
 * - `handleSaveSelectedProducts`: Saves the selected products to the profile.
 * - `handleCreateZone`: Opens the shipping zone creation modal.
 * - `handleSaveZoneData`: Saves the new shipping zone to the profile.
 * - `handleOpenRateModal`: Opens the rate addition modal.
 * - `handleSaveNewRate`: Saves the new rate to the selected zone.
 * - `toggleToastActive`: Toggles the toast notification visibility.
 * - `toggleShippingOrigins`: Toggles the visibility of the shipping origins section.
 * - `handleToggleZoneModal`: Toggles the visibility of the shipping zone modal.
 * - `toggleProductSelection`: Toggles the selection state of a product.
 * - `handleRemoveProduct`: Removes a selected product from the profile.
 * 
 * Usage:
 * - This component makes extensive use of Shopify Polaris components to create a consistent UI.
 * - The component uses the `useFindMany` hook from the `@gadgetinc/react` library to fetch profile data.
 * - Modals are used for product selection, zone creation, and rate addition.
 * - Toast notifications provide feedback on profile creation or errors.
 * 
 * API Interaction:
 * - The form data is sent to an API to create or update the shipping profile using the `api.kaghatiDeliveryProfiles.create` method.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, Link } from 'react-router-dom';
import {
    Page, Layout, Card, TextField, Checkbox, InlineStack, Text, Button, ResourceList, IndexTable, Toast,
    ResourceItem, Thumbnail, BlockStack, Divider, Icon, Bleed, Box, Badge, RadioButton, Banner, useBreakpoints, Frame
} from '@shopify/polaris';
import { api } from "../../../api";
import { useFindMany } from '@gadgetinc/react';
import { LocationIcon, ChevronDownIcon, ChevronUpIcon, DeleteIcon, GlobeIcon, MenuHorizontalIcon } from '@shopify/polaris-icons';
import CreateZoneModal from "./CreateZoneModal";
import NewModal from "./NewModal";
import AddRateModal from './AddRateModal';

function CreateProfile() {
    const navigate = useNavigate();
    const [profileName, setProfileName] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [showZoneDetails, setShowZoneDetails] = useState(false);
    const [showShippingOrigins, setShowShippingOrigins] = useState(false);
    const [hover, setHover] = useState(false);
    const breakpoint = useBreakpoints();
    const [toastActive, setToastActive] = useState(false);
    const [toastContent, setToastContent] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShippingZoneModalOpen, setIsShippingZoneModalOpen] = useState(false);
    const [selectedZones, setSelectedZones] = useState([]);
    const [rates, setRates] = useState([]);
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(null);
    const [selected, setSelected] = useState(['active']);
    const [isActive, setIsActive] = useState(true);
    const [shippingOrigins, setShippingOrigins] = useState([]);
    const [selectedOrigin, setSelectedOrigin] = useState(null);

    const productsPerPage = 20;

    const [{ data, fetching, error }] = useFindMany(api.kaghatiDeliveryProfiles);

    useEffect(() => {
        if (data && data.length > 0) {
            setSelectedProfile(data[0]);
        } else {
            console.log('Data is not in the expected format:', data);
        }
        console.log('useEffect triggered, data:', data);
    }, [data]);

    const toggleToastActive = () => setToastActive((active) => !active);
    const handleChange = (value) => {
        setSelected(value);
    };

    const handleProfileNameChange = (value) => setProfileName(value);
    const handleAddProducts = async () => {
        setIsModalOpen(true);
    };

    const handleOpenRateModal = () => {
        setIsRateModalOpen(true);
    };

    const handleCloseRateModal = () => {
        setIsRateModalOpen(false);
    };

    const handleSaveNewRate = (newRate) => {
        setRates([...rates, newRate]);  // Add the new rate to the state
        handleCloseRateModal();
        console.log(rates);
    };

    const handleCreateZone = () => {
        setIsShippingZoneModalOpen(true);
    };

    const toggleShippingOrigins = () => {
        setShowShippingOrigins(!showShippingOrigins);
    }

    const handleSaveSelectedProducts = (products) => {
        console.log("Selected Products Updated with full details:", products);
        setSelectedProducts(products);  // Update the state with the new list of full product details
        setIsModalOpen(false);  // Optionally close the modal
    };

    const handleSaveZoneData = (zoneData) => {
        console.log("Zone data received:", zoneData);
        setSelectedZones(prevZones => [...prevZones, zoneData]); // Add the new zone to the current list
        setIsShippingZoneModalOpen(false); // Optionally close the modal
    };

    useEffect(() => {
        if (selectedProfile) {
            const fetchedOrigins = selectedProfile.locationGroups[0]?.locationGroup.locations.edges.map(edge => ({
                id: edge.node.id,
                name: edge.node.name,
                address: edge.node.address.formatted.join(', '),
                active: true // You can dynamically set this based on some criteria
            }));
            setShippingOrigins(fetchedOrigins);
        }
    }, [selectedProfile]);

    const countriesData = useMemo(() => {
        if (!selectedProfile || !selectedProfile.locationGroups[0]) {
            return [];
        }

        const zones = selectedProfile.locationGroups[0].locationGroupZones.edges;

        return zones.map(zone => {
            return zone.node.zone.countries.map(country => ({
                name: country.name,
                provinces: country.provinces.map(province => ({
                    id: province.id,
                    name: province.name
                }))
            }));
        }).flat();
    }, [selectedProfile]);
    console.log("countries", countriesData);

    const generateRowMarkup = (methodDefinitions) => {
        return methodDefinitions.map((method, index) => (
            <IndexTable.Row id={index} key={index}>
                <IndexTable.Cell>
                    <Text>{method.name}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {method.description || '—'}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text>
                        {method.price.amount}  {method.price.currencyCode}
                    </Text>
                </IndexTable.Cell>
            </IndexTable.Row>
        ));
    };

    const handleShippingZoneSave = (data) => {
        console.log('Zone data:', data);
        setIsShippingZoneModalOpen(false);
    };

    const handleShippingZoneCancel = () => {
        setIsShippingZoneModalOpen(false);
    };

    const handleDiscard = () => {
        console.log('Discard profile changes');
        navigate(-1);
    };



    const handleNextPage = () => {
        const newPage = currentPage + 1;
        const newStart = newPage * productsPerPage;
        setCurrentPage(newPage);
        setDisplayedProducts(selectedProducts.slice(newStart, newStart + productsPerPage));
    };

    const handlePreviousPage = () => {
        const newPage = currentPage - 1;
        const newStart = newPage * productsPerPage;
        setCurrentPage(newPage);
        setDisplayedProducts(selectedProducts.slice(newStart, newStart + productsPerPage));
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
    };

    const toggleProductSelection = (productId) => {
        const newProducts = allProducts.map(product => {
            if (product.id === productId) {
                return { ...product, isChecked: !product.isChecked };
            }
            return product;
        });
        setAllProducts(newProducts);
        setSelectedProducts(newProducts.filter(product => product.isChecked));
    };
    console.log(selectedZones);

    const handleToggleZoneModal = (zoneName) => {
        setIsZoneModalOpen(prevState => prevState === zoneName ? null : zoneName);
    };

    const handleSaveProfile = async () => {
        const profileData = {
            shopName: 'asv-gadget', // Assuming this is the shop name
            profileName: profileName || "Your Profile Name", // Profile name
            locationGroups: selectedProfile.locationGroups.map(group => ({
                locationGroup: {
                    id: group.locationGroup.id,
                    locations: group.locationGroup.locations.edges.map(edge => ({
                        node: {
                            name: edge.node.name,
                            address: {
                                formatted: edge.node.address.formatted
                            }
                        }
                    }))
                },
                locationGroupZones: {
                    edges: group.locationGroupZones.edges.map(zoneEdge => ({
                        node: {
                            zone: {
                                id: zoneEdge.node.zone.id,
                                name: zoneEdge.node.zone.name,
                                countries: zoneEdge.node.zone.countries.map(country => ({
                                    id: country.id,
                                    name: country.name,
                                    provinces: country.provinces.map(province => ({
                                        id: province.id,
                                        name: province.name
                                    }))
                                }))
                            },
                            methodDefinitions: {
                                edges: zoneEdge.node.methodDefinitions.edges.map(methodEdge => ({
                                    node: {
                                        id: methodEdge.node.id,
                                        name: methodEdge.node.name,
                                        active: methodEdge.node.active,
                                        description: methodEdge.node.description,
                                        rateProvider: {
                                            id: methodEdge.node.rateProvider.id,
                                            price: {
                                                amount: methodEdge.node.rateProvider.price.amount,
                                                currencyCode: methodEdge.node.rateProvider.price.currencyCode
                                            }
                                        }
                                    }
                                }))
                            }
                        }
                    }))
                }
            })),
            originLocationCount: selectedProfile.originLocationCount,
            locationsWithoutRatesCount: selectedProfile.locationsWithoutRatesCount,
            profileItems: selectedProducts.map(product => `gid://shopify/Product/${product.id}`) // Corrected ID format
        };

        try {
            console.log(profileData);
            const response = await api.kaghatiDeliveryProfiles.create(profileData);
            console.log('Profile saved successfully:', response);
            setToastContent("Delivery Profile Created Successfully");
            setToastActive(true);
            navigate('/shipping');
        } catch (error) {
            console.error('Error saving profile:', error);
            setToastContent("Error saving profile");
            setToastActive(true);
        }
    };


    if (fetching) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;
    if (!selectedProfile) return <Text>No profile data available</Text>;

    return (
        <div style={{ width: "100%", margin: "0 auto " }}>
            <Frame>
                <Page
                    title="Create Shipping Profile"
                    breadcrumbs={[{ content: 'Shipping and delivery', url: '/settings-form' }]}
                    primaryAction={{
                        content: 'Save',
                        onAction: handleSaveProfile,
                    }}
                    secondaryActions={[
                        {
                            content: 'Discard',
                            onAction: handleDiscard,
                        }
                    ]}
                >
                    <Layout>
                        <Layout.Section>
                            <Card title="Profile name" sectioned gap={500}>
                                <TextField
                                    label={<Text as="h3" variant="headingSm"> Profile name</Text>}
                                    value={profileName}
                                    onChange={handleProfileNameChange}
                                    placeholder="Fragile products"
                                    helpText={
                                        <span>
                                            Customers won’t see this.
                                        </span>
                                    }
                                />
                            </Card>
                        </Layout.Section>
                        <Layout.Section secondary>
                            <BlockStack gap={500}>
                                <Card title="Products" sectioned>
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text as="h3" variant="headingSm">Products</Text>
                                        {selectedProducts.length > 0 ? (
                                            <a style={{ textDecoration: 'none', color: 'skyBlue', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleAddProducts}>Manage Products</a>
                                        ) : (
                                            <Button variant='plain' onClick={handleAddProducts}>Add Products</Button>
                                        )}
                                    </div>
                                    {selectedProducts.length === 0 ? (
                                        <div style={{ backgroundColor: '#FAFAFA', padding: '16px', marginTop: '16px', textalign: "center" }}>
                                            <Text as="h3" variant="bodySm">No products</Text>
                                            <Text as="h3" variant="bodySm"> Move products here from another profile to set up separate rates</Text>
                                        </div>
                                    ) : (
                                        <ResourceList
                                            resourceName={{ singular: 'product', plural: 'products' }}
                                            items={selectedProducts}
                                            renderItem={(item) => {
                                                const { id, title, images, isChecked } = item;
                                                return (
                                                    <ResourceItem id={id}>
                                                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} >
                                                            <InlineStack gap={100}>
                                                                <Thumbnail
                                                                    source={images?.edges[0]?.node?.source || 'default_image.jpg'}
                                                                    alt={`Thumbnail of ${title}`}
                                                                    size='extra small'
                                                                />
                                                                <Text variant='bodySm'>{title}</Text>
                                                            </InlineStack>
                                                            <div onClick={() => handleRemoveProduct(id)}>
                                                                <Icon source={DeleteIcon} tone='warning' />
                                                            </div>
                                                        </div>
                                                    </ResourceItem>
                                                );
                                            }}
                                        />
                                    )}
                                </Card>

                                <Card>
                                    <BlockStack gap={500}>
                                        <BlockStack gap="300">
                                            <div style={{ display: "flex", flexDirection: 'row', justifyContent: "space-between" }}>
                                                <div><Text as="h3" variant="headingSm">Shipping origins</Text></div>
                                                <InlineStack>
                                                    <Button variant="plain" onClick={toggleShippingOrigins} > {showShippingOrigins ? 'Hide details' : 'Show details'} </Button>
                                                    {showShippingOrigins ? <Icon source={ChevronUpIcon} /> : <Icon source={ChevronDownIcon} />}
                                                </InlineStack>
                                            </div>
                                            {showShippingOrigins ?

                                                selectedProfile?.locationGroups[0]?.locationGroup?.locations?.edges?.map((edge, index) => (
                                                    <InlineStack key={`${index}-${edge.node.address.formatted.join(', ')}`} alignment="center" gap={300}>
                                                        <div style={{ marginTop: "12px" }}> <Icon source={LocationIcon} /></div>
                                                        <BlockStack>
                                                            <Text as="h3" variant="headingSm">{edge.node.name}</Text>
                                                            <Text variant="bodyMd">{edge.node.address.formatted.join(', ')}</Text>
                                                        </BlockStack>
                                                    </InlineStack>
                                                ))
                                                :
                                                <InlineStack>
                                                    {selectedProfile.locationGroups.map((group, index) => (
                                                        <React.Fragment key={group.locationGroup.id}>
                                                            {group.locationGroup.locations.edges.map((locationEdge, locIndex) => (
                                                                <Text key={locationEdge.node.name + locIndex} as="h3" variant="bodySm">
                                                                    {locationEdge.node.name}
                                                                    {index < selectedProfile.locationGroups.length - 1 || locIndex < group.locationGroup.locations.edges.length - 1 ? ', ' : ''}
                                                                </Text>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </InlineStack>

                                            }
                                        </BlockStack>
                                        <Divider /><BlockStack gap="300">
                                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text as="h2" variant="headingSm">Shipping zones</Text>
                                                <Button variant="plain" onClick={handleCreateZone} >Create zone</Button>
                                            </div>
                                            <div>
                                                {selectedZones.length > 0 ? (
                                                    selectedZones.map((zone, index) => (
                                                        <div key={zone.zoneName}>
                                                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                                <div style={{ display: 'flex' }}>
                                                                    <div style={{ margin: "10px" }}>
                                                                        {zone.countries[0].name === "India" ?
                                                                            <img src="https://cdn.vectorstock.com/i/preview-1x/97/88/india-vector-2199788.jpg" width="15" height="15" /> :
                                                                            <Icon source={GlobeIcon} />
                                                                        }
                                                                    </div>
                                                                    <BlockStack>
                                                                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} onClick={() => handleToggleZoneModal(zone.zoneName)} >
                                                                            <Text as="h4" variant="headingXs">{zone.zoneName}</Text>
                                                                            <Icon source={ChevronDownIcon} />
                                                                        </div>
                                                                        <BlockStack>
                                                                            {zone.countries.map((country, countryIndex) => (
                                                                                <Text key={countryIndex}>
                                                                                    {country.country}
                                                                                    {countryIndex < zone.countries.length - 1 ? ', ' : ''}
                                                                                </Text>
                                                                            ))}
                                                                        </BlockStack>
                                                                    </BlockStack>
                                                                </div>
                                                                <BlockStack align='end'>
                                                                    <Icon source={MenuHorizontalIcon} />
                                                                </BlockStack>
                                                            </div>
                                                            {isZoneModalOpen === zone.zoneName && (
                                                                <div style={{ maxWidth: "50%" }}>
                                                                    <Card sectioned>
                                                                        <BlockStack gap={400}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', margin: "0 !important" }}>
                                                                                <Text as='h3' variant='headingSm'>
                                                                                    MARKETS
                                                                                </Text>
                                                                            </div>
                                                                            <BlockStack >
                                                                                <InlineStack>
                                                                                    <div style={{
                                                                                        height: '12px',
                                                                                        width: '12px',
                                                                                        backgroundColor: isActive ? 'green' : 'grey',
                                                                                        borderRadius: '50%',
                                                                                        display: 'inline-block',
                                                                                        marginRight: '8px'
                                                                                    }}> </div>
                                                                                    <Text status={isActive ? 'success' : 'attention'}>{isActive ? 'Active' : 'Inactive'}</Text>
                                                                                </InlineStack>
                                                                                <BlockStack>
                                                                                    <Divider />
                                                                                </BlockStack>
                                                                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
                                                                                    <img src="https://cdn.vectorstock.com/i/preview-1x/97/88/india-vector-2199788.jpg"
                                                                                        alt="India"
                                                                                        style={{ width: '24px', height: '15px', marginRight: '8px' }} />
                                                                                    <Text>India</Text>
                                                                                </div>
                                                                            </BlockStack>
                                                                        </BlockStack>
                                                                    </Card>
                                                                </div>
                                                            )}
                                                            <div style={{ backgroundColor: '#FAFAFA', padding: '10px', marginTop: '10px' }}>
                                                                {!rates || rates.length <= 0 ? (<Banner tone='warning' as="h3" variant="bodySm">No rates. Customers in this zone won't be able to complete checkout.</Banner>) : null}
                                                                {rates && rates.length > 0 && (
                                                                    <BlockStack>
                                                                        <IndexTable
                                                                            condensed={breakpoint.smDown}
                                                                            resourceName={{ singular: 'rate', plural: 'rates' }}
                                                                            itemCount={rates.length}
                                                                            headings={[
                                                                                { title: 'Rate name' },
                                                                                { title: 'Condition' },
                                                                                { title: 'Price' },
                                                                            ]}
                                                                            selectable={false}
                                                                        >
                                                                            {generateRowMarkup(rates)}
                                                                        </IndexTable>
                                                                    </BlockStack>
                                                                )}
                                                                <Button onClick={handleOpenRateModal}>Add rate</Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div>
                                                        <div style={{ backgroundColor: '#FAFAFA', padding: '16px', marginTop: '16px', textalign: "center" }}>
                                                            <Text as="h3" variant="bodySm">No zones or rates</Text>
                                                            <Text as="h3" variant="bodySm">Add zones to create rates for the places you want to ship to.</Text>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </BlockStack>
                                    </BlockStack>
                                    {selectedZones.length > 0 ? (
                                        <Bleed>
                                            <InlineStack gap={300}>
                                                <BlockStack>
                                                    <Icon source={GlobeIcon} />
                                                </BlockStack>
                                                <BlockStack>
                                                    <Text as="h3" variant="headingSm">Not covered by your shipping zones</Text>
                                                    <Text as="h3" variant="bodySm">28 countries and regions</Text>
                                                </BlockStack>
                                            </InlineStack>
                                        </Bleed>)
                                        : null
                                    }
                                </Card>
                                <BlockStack gap={500}>
                                    <Card>
                                        <BlockStack gap={300}>
                                            <Text as="h3" variant="headingSm"> Start shipping to more places</Text>
                                            <Text as="h3" variant="bodySm"> Add countries/regions to a market to start selling and manage localized settings, including shipping zones.</Text>
                                            <InlineStack gap={400} >
                                                <Button> Go to Markets</Button>
                                                <a href="#" style={{ display: "flex", color: 'skyBlue', fontWeight: 'bold', cursor: 'pointer' }}>Learn more about Markets</a>
                                            </InlineStack>
                                            <Bleed marginBlockEnd="400" marginInline="400">
                                                <Box background="bg-surface-secondary" padding="400">
                                                    <Text as="h3" variant="bodySm">Countries/regions not in a market</Text>
                                                    <InlineStack>
                                                        <Text as="h3" variant="bodySm">208 countries and regions</Text>
                                                        <div><Icon source={ChevronDownIcon} /></div>
                                                    </InlineStack>
                                                </Box>
                                            </Bleed>
                                        </BlockStack>
                                    </Card>
                                    <InlineStack gap={300}>
                                        <Button onClick={handleDiscard} destructive>Discard</Button>
                                        <Button onClick={handleSaveProfile} variant="primary" >Save</Button>
                                    </InlineStack>
                                </BlockStack>
                            </BlockStack>
                            {isModalOpen && (
                                <NewModal
                                    isModalOpen={isModalOpen}
                                    handleModalClose={() => setIsModalOpen(false)}
                                    onSave={handleSaveSelectedProducts}
                                />
                            )}
                            <CreateZoneModal
                                active={isShippingZoneModalOpen}
                                handleChange={() => { }}
                                countriesData={countriesData}
                                handleSave={handleSaveZoneData}
                                handleCancel={handleShippingZoneCancel}
                            />
                            {isRateModalOpen && (
                                <AddRateModal
                                    isOpen={isRateModalOpen}
                                    onClose={handleCloseRateModal}
                                    onRateSubmit={handleSaveNewRate}
                                />
                            )}
                        </Layout.Section>
                    </Layout>
                    {toastActive && (
                        <Toast content={toastContent} onDismiss={toggleToastActive} />
                    )}
                </Page>
            </Frame>
        </div>
    );
}

export default CreateProfile;