/**
 * CreateDeliveryCustomization Component
 * 
 * This component allows users to create and save delivery customizations. It provides a form with the following 
 * fields:
 * 
 * - A date picker to select the delivery date range.
 * - A text field to input delivery instructions.
 * 
 * The component manages form state internally and sends a POST request to a backend API to save the delivery 
 * customization details.
 * 
 * State:
 * - `deliveryDate` (object): An object with `start` and `end` properties representing the selected date range.
 * - `deliveryInstructions` (string): The delivery instructions provided by the user.
 * 
 * Handlers:
 * - `handleDateChange`: Updates the `deliveryDate` state when the date is changed.
 * - `handleInstructionsChange`: Updates the `deliveryInstructions` state when the instructions are changed.
 * - `handleSave`: Sends a POST request with the form data to save the delivery customization.
 * 
 * Usage:
 * - The `DatePicker` component is used to select the delivery date.
 * - The `TextField` component allows users to enter delivery instructions.
 * - The `Button` component triggers the `handleSave` function to submit the form.
 * 
 * API Endpoint:
 * - The form data is sent to `https://your-gadget-backend/api/delivery-customizations` for saving.
 */

import React, { useState } from 'react';
import { Page, Card, FormLayout, TextField, Button, DatePicker } from '@shopify/polaris';

function CreateDeliveryCustomization() {
  const [deliveryDate, setDeliveryDate] = useState({ start: new Date(), end: new Date() });
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const handleDateChange = (value) => {
    setDeliveryDate(value);
  };

  const handleInstructionsChange = (value) => {
    setDeliveryInstructions(value);
  };

  const handleSave = async () => {
    const data = {
      delivery_date: deliveryDate.start,
      delivery_instructions: deliveryInstructions,
    };

    try {
      const response = await fetch('https://your-gadget-backend/api/delivery-customizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Delivery customization saved:', result);
    } catch (error) {
      console.error('Error saving delivery customization:', error);
    }
  };

  return (
    <Page title="Create Delivery Customization">
      <Card sectioned>
        <FormLayout>
          <DatePicker
            month={deliveryDate.start.getMonth()}
            year={deliveryDate.start.getFullYear()}
            onChange={handleDateChange}
            onMonthChange={(month, year) => handleDateChange({ start: new Date(year, month, 1), end: new Date(year, month, 1) })}
            selected={deliveryDate}
          />
          <TextField
            label="Delivery Instructions"
            value={deliveryInstructions}
            onChange={handleInstructionsChange}
            multiline
          />
          <Button onClick={handleSave} primary>
            Save
          </Button>
        </FormLayout>
      </Card>
    </Page>
  );
}

export default CreateDeliveryCustomization;
