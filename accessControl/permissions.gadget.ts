import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://kaghati-shopify-v4.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "signed-in": {
      storageKey: "signed-in",
      default: {
        read: true,
        action: true,
      },
      models: {
        erpCustomer: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpProductData: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpStock: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpTruePOS: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        itemsByOutletId: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        kaghatiDeliveryProfiles: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiIntegrationApi: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiInventoryLevel: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiNotificationLog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiNotificationTemplate: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOnlineHybridStock: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderInfo: {
          read: true,
          actions: {
            create: true,
            createA: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderSplit: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiPinCode: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiProductAddAttributes: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSetting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSettingGroup: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyInventoryCalculation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyProductInfo: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyProductVariantInfo: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiStores: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSyncStatus: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiTemporyImage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiThreePLShippingOrder: {
          read: true,
          actions: {
            cancel: true,
            create: true,
            delete: true,
            track: true,
            update: true,
          },
        },
        notificationCenter: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        orderLogs: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        paymentLinks: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        paymentRefundStatus: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyArticle: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyArticle.gelly",
          },
        },
        shopifyAsset: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyAsset.gelly",
          },
        },
        shopifyBlog: {
          read: {
            filter: "accessControl/filters/shopify/shopifyBlog.gelly",
          },
        },
        shopifyBulkOperation: {
          read: true,
        },
        shopifyCarrierService: {
          read: true,
        },
        shopifyCart: {
          read: true,
        },
        shopifyCollect: {
          read: true,
        },
        shopifyCollection: {
          read: true,
        },
        shopifyComment: {
          read: true,
        },
        shopifyCountry: {
          read: true,
        },
        shopifyCustomer: {
          read: true,
        },
        shopifyCustomerAddress: {
          read: true,
        },
        shopifyDiscount: {
          read: true,
        },
        shopifyDiscountCode: {
          read: true,
        },
        shopifyDraftOrder: {
          read: true,
        },
        shopifyDraftOrderLineItem: {
          read: true,
        },
        shopifyDraftOrderPlatformDiscount: {
          read: true,
        },
        shopifyDraftOrderPlatformDiscountAllocation: {
          read: true,
        },
        shopifyFile: {
          read: true,
        },
        shopifyFulfillment: {
          read: true,
        },
        shopifyFulfillmentEvent: {
          read: true,
        },
        shopifyFulfillmentLineItem: {
          read: true,
        },
        shopifyFulfillmentOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentService: {
          read: true,
        },
        shopifyGdprRequest: {
          read: true,
        },
        shopifyInventoryItem: {
          read: true,
        },
        shopifyInventoryLevel: {
          read: true,
        },
        shopifyLocation: {
          read: true,
        },
        shopifyOrder: {
          read: {
            filter:
              "accessControl/filters/shopifyOrder/shopifyorder.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderTransaction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPage: {
          read: true,
        },
        shopifyPaymentSchedule: {
          read: true,
        },
        shopifyPaymentTerms: {
          read: true,
        },
        shopifyPriceRule: {
          read: true,
        },
        shopifyProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductImage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductMedia: {
          read: true,
        },
        shopifyProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariantMedia: {
          read: true,
        },
        shopifyProvince: {
          read: true,
        },
        shopifyRedirect: {
          read: true,
        },
        shopifyRefund: {
          read: true,
        },
        shopifyRefundLineItem: {
          read: true,
        },
        shopifyScriptTag: {
          read: true,
        },
        shopifyShippingLine: {
          read: true,
        },
        shopifyShop: {
          read: true,
        },
        shopifySync: {
          read: true,
        },
        shopifyTheme: {
          read: true,
        },
        user: {
          read: {
            filter: "accessControl/filters/user/tenant.gelly",
          },
          actions: {
            create: true,
            createA: true,
            delete: true,
            signIn: true,
            signing: true,
            signOut: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
            signUp: true,
            update: true,
          },
        },
      },
      actions: {
        bulkAny: true,
        callSettingsAction: true,
        cancelShopifyOrder: true,
        checkDataAmount: true,
        checkPeriodicErpItem: true,
        clusterInventoryCalculation: true,
        clusterOrderSplit: true,
        createCustomer: true,
        createDraftOrder: true,
        createOrder: true,
        createOrUpdateDeliveryCustomization: true,
        createProduct: true,
        createUengageShipment: true,
        erpCustomerSync: true,
        erpDataSync: true,
        erpDataSyncFull: true,
        erpOrderPush: true,
        erpProductSync: true,
        erpProductSyncFull: true,
        EstimateDelivery: true,
        findOrder: true,
        getTimeStamp: true,
        ghostProduct: true,
        graphqlQueryAndMutation: true,
        inventoryCalculation: true,
        inventoryPriceUpdate: true,
        khagatiSMS: true,
        manualOrderSplit: true,
        notification: true,
        orderCreateLogs: true,
        orderSplitMethod: true,
        orderStatusTest: true,
        paymentLinkCancel: true,
        paymentLinkCreate: true,
        paymentLinkStatus: true,
        paymentRefund: true,
        porterCreateOrder: true,
        primaryInventoryCalculation: true,
        primaryOrderSplit: true,
        primaryWithBackupInventoryCalculation: true,
        primaryWithBackupOrderSplit: true,
        productVariantPriceUpdateFileFinal: true,
        productVariantPriceUpdateFileFinalFull: true,
        productVariantUpdateFile: true,
        productVariantUpdateFileFinal: true,
        productVariantUpdateFileFinalA: true,
        productVariantUpdateFileFinalFull: true,
        scheduledShopifySync: true,
        sendDataToProduction: true,
        settingsCreateShopifyZones: true,
        settingsDeleteShopifyZones: true,
        settingsGetShopifyZones: true,
        settingsUpdateShopifyZones: true,
        shopifyEstimateDelivery: true,
        shopifyInventorySync: true,
        shopifyoosPincode: true,
        shopifyPinCodeStoreSync: true,
        shopifyProductEstimateDelivery: true,
        shopifyProductInfoSync: true,
        shopifyProductoosPincodes: true,
        shopifyProductStoreStock: true,
        shopifyRequest: true,
        shopifyStorePriceSync: true,
        signIn: true,
        singleShopifyVariantUpdate: true,
        splitOrderCancel: true,
        splitOrderConfirm: true,
        splitOrderDelivered: true,
        splitOrderOnHold: true,
        splitOrderOnHoldStatus: true,
        splitOrderOutForDelivery: true,
        splitOrderReadyForPickup: true,
        subscribe: true,
        SyncShopifyRates: true,
        uengageCancelTask: true,
        uengageCreateTask: true,
        uengageServiceAbility: true,
        uengageTrackSync: true,
        updateOrder: true,
        updateProduct: true,
        updateVariant: true,
      },
    },
    "shopify-app-users": {
      storageKey: "Role-Shopify-App",
      default: {
        read: true,
        action: true,
      },
      models: {
        erpCustomer: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpProductData: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpStock: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpTruePOS: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        itemsByOutletId: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        kaghatiDeliveryProfiles: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiIntegrationApi: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiInventoryLevel: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiNotificationLog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiNotificationTemplate: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOnlineHybridStock: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderInfo: {
          read: true,
          actions: {
            create: true,
            createA: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderSplit: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiPinCode: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiProductAddAttributes: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSetting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSettingGroup: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyInventoryCalculation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyProductInfo: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyProductVariantInfo: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiStores: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSyncStatus: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiTemporyImage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiThreePLShippingOrder: {
          read: true,
          actions: {
            cancel: true,
            create: true,
            delete: true,
            track: true,
            update: true,
          },
        },
        notificationCenter: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        orderLogs: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        paymentLinks: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        paymentRefundStatus: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyArticle: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyArticle.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAsset: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyAsset.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBlog: {
          read: {
            filter: "accessControl/filters/shopify/shopifyBlog.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBulkOperation: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyBulkOperation.gelly",
          },
          actions: {
            cancel: true,
            complete: true,
            create: true,
            expire: true,
            fail: true,
            update: true,
          },
        },
        shopifyCarrierService: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCarrierService.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCart: {
          read: {
            filter: "accessControl/filters/shopify/shopifyCart.gelly",
          },
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyCollect: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCollect.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollection: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCollection.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyComment: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyComment.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCountry: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCountry.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomer: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCustomer.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomerAddress: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCustomerAddress.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDiscount: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyDiscount.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDiscountCode: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyDiscountCode.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDraftOrder: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyDraftOrder.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDraftOrderLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyDraftOrderLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDraftOrderPlatformDiscount: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyDraftOrderPlatformDiscount.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDraftOrderPlatformDiscountAllocation: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyDraftOrderPlatformDiscountAllocation.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFile: {
          read: {
            filter: "accessControl/filters/shopify/shopifyFile.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillment: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillment.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentEvent: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentEvent.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrder: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentOrder.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentOrderLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentService: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyFulfillmentService.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyGdprRequest: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyGdprRequest.gelly",
          },
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyInventoryItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyInventoryItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryLevel: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyInventoryLevel.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyLocation: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyLocation.gelly",
          },
        },
        shopifyOrder: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyOrder.gelly",
          },
          actions: {
            create: true,
            delete: true,
            processDelayedOrder: true,
            update: true,
          },
        },
        shopifyOrderLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyOrderLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderTransaction: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyOrderTransaction.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPage: {
          read: {
            filter: "accessControl/filters/shopify/shopifyPage.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPaymentSchedule: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyPaymentSchedule.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPaymentTerms: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyPaymentTerms.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPriceRule: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyPriceRule.gelly",
          },
        },
        shopifyProduct: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProduct.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductImage: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductImage.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductMedia: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductMedia.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductOption: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductOption.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariant: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductVariant.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariantMedia: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductVariantMedia.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProvince: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProvince.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRedirect: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyRedirect.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefund: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyRefund.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyRefundLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyScriptTag: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyScriptTag.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingLine: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyShippingLine.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShop: {
          read: {
            filter: "accessControl/filters/shopify/shopifyShop.gelly",
          },
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: {
            filter: "accessControl/filters/shopify/shopifySync.gelly",
          },
          actions: {
            abort: true,
            complete: true,
            error: true,
            run: true,
          },
        },
        shopifyTheme: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyTheme.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        user: {
          read: true,
          actions: {
            create: true,
            createA: true,
            delete: true,
            signIn: true,
            signing: true,
            signOut: true,
            signUp: true,
            update: true,
          },
        },
      },
      actions: {
        bulkAny: true,
        callSettingsAction: true,
        cancelShopifyOrder: true,
        checkDataAmount: true,
        checkPeriodicErpItem: true,
        clusterInventoryCalculation: true,
        clusterOrderSplit: true,
        createCustomer: true,
        createDraftOrder: true,
        createOrder: true,
        createOrUpdateDeliveryCustomization: true,
        createProduct: true,
        createUengageShipment: true,
        erpCustomerSync: true,
        erpDataSync: true,
        erpDataSyncFull: true,
        erpOrderPush: true,
        erpProductSync: true,
        erpProductSyncFull: true,
        EstimateDelivery: true,
        findOrder: true,
        getTimeStamp: true,
        ghostProduct: true,
        graphqlQueryAndMutation: true,
        inventoryCalculation: true,
        inventoryPriceUpdate: true,
        khagatiSMS: true,
        manualOrderSplit: true,
        notification: true,
        orderCreateLogs: true,
        orderSplitMethod: true,
        orderStatusTest: true,
        paymentLinkCancel: true,
        paymentLinkCreate: true,
        paymentLinkStatus: true,
        paymentRefund: true,
        porterCreateOrder: true,
        primaryInventoryCalculation: true,
        primaryOrderSplit: true,
        primaryWithBackupInventoryCalculation: true,
        primaryWithBackupOrderSplit: true,
        productVariantPriceUpdateFileFinal: true,
        productVariantPriceUpdateFileFinalFull: true,
        productVariantUpdateFile: true,
        productVariantUpdateFileFinal: true,
        productVariantUpdateFileFinalA: true,
        productVariantUpdateFileFinalFull: true,
        scheduledShopifySync: true,
        sendDataToProduction: true,
        settingsCreateShopifyZones: true,
        settingsDeleteShopifyZones: true,
        settingsGetShopifyZones: true,
        settingsUpdateShopifyZones: true,
        shopifyEstimateDelivery: true,
        shopifyInventorySync: true,
        shopifyoosPincode: true,
        shopifyPinCodeStoreSync: true,
        shopifyProductEstimateDelivery: true,
        shopifyProductInfoSync: true,
        shopifyProductoosPincodes: true,
        shopifyProductStoreStock: true,
        shopifyRequest: true,
        shopifyStorePriceSync: true,
        signIn: true,
        singleShopifyVariantUpdate: true,
        splitOrderCancel: true,
        splitOrderConfirm: true,
        splitOrderDelivered: true,
        splitOrderOnHold: true,
        splitOrderOnHoldStatus: true,
        splitOrderOutForDelivery: true,
        splitOrderReadyForPickup: true,
        subscribe: true,
        SyncShopifyRates: true,
        uengageCancelTask: true,
        uengageCreateTask: true,
        uengageServiceAbility: true,
        uengageTrackSync: true,
        updateOrder: true,
        updateProduct: true,
        updateVariant: true,
      },
    },
    "shopify-storefront-customers": {
      storageKey: "Role-Shopify-Customer",
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        erpItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpStock: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpTruePOS: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        kaghatiDeliveryProfiles: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiNotificationLog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiNotificationTemplate: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderSplit: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSetting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyProductInfo: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiStores: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        notificationCenter: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariant: {
          read: true,
          actions: {
            update: true,
          },
        },
        user: {
          read: true,
          actions: {
            signIn: true,
            signing: true,
            signOut: true,
            signUp: true,
          },
        },
      },
      actions: {
        createOrder: true,
        signIn: true,
        subscribe: true,
      },
    },
    admin: {
      storageKey: "AKD1FqqfKBiu",
      default: {
        read: true,
        action: true,
      },
      models: {
        erpCustomer: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpProductData: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpStock: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        erpTruePOS: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        itemsByOutletId: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        kaghatiDeliveryProfiles: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiIntegrationApi: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiInventoryLevel: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiNotificationLog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiNotificationTemplate: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOnlineHybridStock: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderInfo: {
          read: true,
          actions: {
            create: true,
            createA: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiOrderSplit: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiPinCode: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiProductAddAttributes: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSetting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSettingGroup: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyInventoryCalculation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyProductInfo: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiShopifyProductVariantInfo: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiStores: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiSyncStatus: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiTemporyImage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        khagatiThreePLShippingOrder: {
          read: true,
          actions: {
            cancel: true,
            create: true,
            delete: true,
            track: true,
            update: true,
          },
        },
        notificationCenter: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        orderLogs: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        paymentLinks: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        paymentRefundStatus: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        session: {
          read: true,
        },
        shopifyArticle: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAsset: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBlog: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBulkOperation: {
          read: true,
          actions: {
            cancel: true,
            complete: true,
            create: true,
            expire: true,
            fail: true,
            update: true,
          },
        },
        shopifyCarrierService: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCart: {
          read: true,
        },
        shopifyCollect: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollection: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyComment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCountry: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomer: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomerAddress: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDiscount: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDiscountCode: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyDraftOrder: {
          read: true,
        },
        shopifyDraftOrderLineItem: {
          read: true,
        },
        shopifyDraftOrderPlatformDiscount: {
          read: true,
        },
        shopifyDraftOrderPlatformDiscountAllocation: {
          read: true,
        },
        shopifyFile: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillment: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentEvent: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFulfillmentService: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyGdprRequest: {
          read: true,
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyInventoryItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyInventoryLevel: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyLocation: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrder: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyOrderTransaction: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyPaymentSchedule: {
          read: true,
        },
        shopifyPaymentTerms: {
          read: true,
        },
        shopifyPriceRule: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProduct: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductImage: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductMedia: {
          read: true,
        },
        shopifyProductOption: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariant: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariantMedia: {
          read: true,
        },
        shopifyProvince: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRedirect: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefund: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyRefundLineItem: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyScriptTag: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShippingLine: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShop: {
          read: true,
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: true,
          actions: {
            abort: true,
            complete: true,
            error: true,
            run: true,
          },
        },
        shopifyTheme: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        user: {
          read: true,
          actions: {
            create: true,
            createA: true,
            delete: true,
            signIn: true,
            signing: true,
            signOut: true,
            signUp: true,
            update: true,
          },
        },
      },
      actions: {
        aaaBulkUpdateHandler: true,
        aaaUpdateVariantsInventory: true,
        aaaUpdateVariantsPrice: true,
        bulkAny: true,
        callSettingsAction: true,
        cancelShopifyOrder: true,
        checkDataAmount: true,
        checkPeriodicErpItem: true,
        clusterInventoryCalculation: true,
        clusterOrderSplit: true,
        createCustomer: true,
        createOrder: true,
        createOrUpdateDeliveryCustomization: true,
        createProduct: true,
        createUengageShipment: true,
        emailSMPT: true,
        erpCustomerSync: true,
        erpDataSync: true,
        erpDataSyncFull: true,
        erpOrderPush: true,
        erpProductSync: true,
        erpProductSync2: true,
        erpProductSyncFull: true,
        EstimateDelivery: true,
        findOrder: true,
        getTimeStamp: true,
        ghostProduct: true,
        graphqlQueryAndMutation: true,
        inventoryCalculation: true,
        inventoryPriceUpdate: true,
        khagatiSMS: true,
        manualOrderSplit: true,
        myCodeOriginal: true,
        notification: true,
        orderCreateLogs: true,
        orderSplitMethod: true,
        orderStatusTest: true,
        paymentLinkCancel: true,
        paymentLinkCreate: true,
        paymentLinkStatus: true,
        paymentRefund: true,
        porterCreateOrder: true,
        primaryInventoryCalculation: true,
        primaryOrderSplit: true,
        primaryWithBackupInventoryCalculation: true,
        primaryWithBackupOrderSplit: true,
        productVariantPriceUpdateFileFinal: true,
        productVariantPriceUpdateFileFinalFull: true,
        productVariantUpdateFile: true,
        productVariantUpdateFileFinal: true,
        productVariantUpdateFileFinalA: true,
        productVariantUpdateFileFinalFull: true,
        scheduledShopifySync: true,
        sendDataToProduction: true,
        settingsCreateShopifyZones: true,
        settingsDeleteShopifyZones: true,
        settingsGetShopifyZones: true,
        settingsUpdateShopifyZones: true,
        shopifyEstimateDelivery: true,
        shopifyInventorySync: true,
        shopifyoosPincode: true,
        shopifyPinCodeStoreSync: true,
        shopifyProductEstimateDelivery: true,
        shopifyProductInfoSync: true,
        shopifyProductoosPincodes: true,
        shopifyProductStoreStock: true,
        shopifyRequest: true,
        shopifyStorePriceSync: true,
        signIn: true,
        singleShopifyVariantUpdate: true,
        splitOrderCancel: true,
        splitOrderConfirm: true,
        splitOrderDelivered: true,
        splitOrderOnHold: true,
        splitOrderOnHoldStatus: true,
        splitOrderOutForDelivery: true,
        splitOrderReadyForPickup: true,
        subscribe: true,
        SyncShopifyRates: true,
        uengageCancelTask: true,
        uengageCreateTask: true,
        uengageServiceAbility: true,
        uengageTrackSync: true,
        updateOrder: true,
        updateProduct: true,
        updateVariant: true,
      },
    },
  },
};
