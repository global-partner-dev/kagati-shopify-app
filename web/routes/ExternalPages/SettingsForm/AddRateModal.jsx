/**
 * AddRateModal Component
 * 
 * This component renders a modal dialog for adding or editing a shipping rate. It includes options to specify 
 * the rate type (flat or calculated), set a custom rate name, description, price, and currency. The component 
 * also provides validation and submission handling for the rate details.
 * 
 * Props:
 * - `isOpen` (boolean): Controls the visibility of the modal.
 * - `onClose` (function): Callback function to close the modal.
 * - `onRateSubmit` (function): Callback function to handle the submission of rate details.
 * - `initialRate` (object): Optional initial rate data to populate the modal fields for editing.
 * 
 * State:
 * - `rateType` (string): Type of rate, either 'flat' or 'calculated'.
 * - `customRateName` (string): Name for the custom rate.
 * - `customRateDescription` (string): Description for the custom rate.
 * - `price` (string): Price of the rate.
 * - `currency` (string): Currency code (default is 'INR').
 * - `toastActive` (boolean): Controls the visibility of a toast message.
 * - `toastContent` (string): Content for the toast message.
 * - `shippingRate` (string): Type of shipping rate, default is 'Custom'.
 * 
 * Usage:
 * - Use `isOpen` to control the visibility of the modal.
 * - `onClose` is triggered when the modal is closed.
 * - `onRateSubmit` is triggered when the user submits the form.
 * - Populate `initialRate` if editing an existing rate.
 */

import { Toast, Frame } from '@shopify/polaris';
import React, { useState, useEffect } from 'react';
import { Modal, RadioButton, TextField, Button, Select } from '@shopify/polaris';

function AddRateModal({ isOpen, onClose, onRateSubmit, initialRate }) {
    const [rateType, setRateType] = useState('flat');
    const [customRateName, setCustomRateName] = useState('');
    const [customRateDescription, setCustomRateDescription] = useState('');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('INR'); // Default currency
    const [toastActive, setToastActive] = useState(false);
    const [toastContent, setToastContent] = useState('');
    const [shippingRate, setShippingRate] = useState('Custom');

    const currencyOptions = [
        { label: 'Indian Rupee (INR)', value: 'INR' },
        { label: 'US Dollar (USD)', value: 'USD' },
        { label: 'Euro (EUR)', value: 'EUR' }
    ]; // List of currency options

    useEffect(() => {
        if (initialRate) {
            setRateType(initialRate.type || 'flat');
            setCustomRateName(initialRate.name || '');
            setCustomRateDescription(initialRate.description || '');
            setPrice(initialRate.price?.amount.toString() || '');
            setCurrency(initialRate.price?.currencyCode || 'INR');
            setShippingRate(initialRate.shippingRate || 'Custom');
        }
    }, [initialRate]);

    const handleSubmit = () => {
        if (!customRateName || price === null || price === '') {
            alert("Please fill in all required fields.");
            return;
        }
    
        const rateDetails = {
            ...initialRate,
            type: rateType,
            shippingRate,
            name: customRateName,
            description: customRateDescription,
            price: {
                amount: parseFloat(price), // Ensure the price is a number
                currencyCode: currency
            }
        };
        console.log(rateDetails);
        onRateSubmit(rateDetails);
        onClose();
    };

    const toggleToastActive = () => setToastActive((active) => !active);

    return (
        <Frame>
            <Modal
                open={isOpen}
                onClose={onClose}
                title="Add Rate"
                primaryAction={{
                    content: 'Done',
                    onAction: handleSubmit
                }}
                secondaryActions={{
                    content: 'Cancel',
                    onAction: onClose
                }}
            >
                <Modal.Section>
                    <RadioButton
                        label="Use flat rate"
                        value="flat"
                        checked={rateType === 'flat'}
                        onChange={() => setRateType('flat')}
                    />
                    <RadioButton
                        label="Use carrier or app to calculate rates"
                        value="calculated"
                        checked={rateType === 'calculated'}
                        onChange={() => setRateType('calculated')}
                    />
                    <Select
                        label="Shipping rate"
                        options={[{ label: 'Custom', value: 'Custom' }]}  // Currently only one option
                        value={shippingRate}
                        onChange={setShippingRate}
                    />
                    <TextField
                        label="Custom rate name"
                        value={customRateName}
                        onChange={(value) => setCustomRateName(value)}
                    />
                    <TextField
                        label="Custom delivery description (optional)"
                        value={customRateDescription}
                        onChange={(value) => setCustomRateDescription(value)}
                    />
                    <TextField
                        label="Price"
                        type="number"
                        value={price}
                        onChange={(value) => setPrice(value)}
                        prefix={currencyOptions.find(c => c.value === currency)?.label.split(' ')[0]} // Dynamically set prefix
                    />
                    <Select
                        label="Currency"
                        options={currencyOptions}
                        value={currency}
                        onChange={(value) => setCurrency(value)}
                    />
                </Modal.Section>
            </Modal>
            {toastActive && (
                <Toast content={toastContent} onDismiss={toggleToastActive} />
            )}
        </Frame>
    );
}

export default AddRateModal;
