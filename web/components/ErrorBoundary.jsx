/**
 * ErrorBoundary
 * 
 * This component is an error boundary that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire app. It is designed to handle
 * rendering errors gracefully by displaying a critical error message to the user.
 * 
 * @class ErrorBoundary
 * @extends React.Component
 * 
 * @param {ReactNode} children - The child components that the ErrorBoundary wraps around. If no error is encountered,
 *                               these children will be rendered normally.
 * 
 * @returns {JSX.Element} If an error is caught, it renders a Shopify Polaris `Banner` with a critical error message.
 *                        Otherwise, it renders the wrapped children components.
 */

import React from 'react';
import { Banner, Page, Layout } from '@shopify/polaris';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    // Update state to indicate an error has occurred
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    // Log the error and error information
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    // Render either the error message or the child components
    render() {
        if (this.state.hasError) {
            return (
                <Page title="Error">
                    <Layout>
                        <Layout.Section>
                            <Banner title="Something went wrong." status="critical">
                                <p>There was an error loading this page.</p>
                            </Banner>
                        </Layout.Section>
                    </Layout>
                </Page>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;