import {
    SkeletonPage,
    Layout,
    Card,
    SkeletonBodyText,
    Box,
    SkeletonDisplayText,
    Text,
    Divider,
  } from '@shopify/polaris';
  import React from 'react';
  
  function Skeleton() {
    return (
      <SkeletonPage 
        primaryAction
      >
        <Layout>
          <Layout.Section>
            <Card roundedAbove="sm">
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Divider fullWidth />
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
                <Box paddingBlock="200">
                    <SkeletonDisplayText size="small" maxWidth="100%" />
                </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }

  export default Skeleton;