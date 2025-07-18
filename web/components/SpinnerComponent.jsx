/**
 * SpinnerComponent
 * 
 * This component renders a full-screen loading spinner using Shopify's Polaris `Spinner` component. It is centered both vertically and horizontally 
 * within the viewport, providing a visual indication that content is loading or an operation is in progress.
 * 
 * @returns {JSX.Element} A full-screen spinner centered on the page, indicating a loading state.
 */

import React from 'react';
import { Spinner, Box } from '@shopify/polaris';

const SpinnerComponent = () => {
    return (
        <Box style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
        }}>
            <Spinner accessibilityLabel="Spinner example" size="large" />
        </Box>
    );
};

export default SpinnerComponent;
