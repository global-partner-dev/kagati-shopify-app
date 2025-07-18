import { createContext, useState, useEffect } from 'react';
import { api } from "../api";
import { useFindFirst } from "@gadgetinc/react";

export const SyncStatusContext = createContext();

export function SyncStatusProvider({ children }) {
  const [{ data: syncStatus, fetching }, refetch] = useFindFirst(api.khagatiSyncStatus, {
    live: true,
    select: {
      id: true,
      isSyncing: true,
      lastSyncCompletedAt: true,
      syncTypes: true,
      overallStatus: true,
      userDismissedAt: true
    },
    sort: { lastSyncStartedAt: "Descending" }
  });

  // Poll for updates while syncing
  useEffect(() => {
    let intervalId;
    if (syncStatus?.isSyncing) {
      intervalId = setInterval(() => {
        refetch();
      }, 5000); // Poll every 5 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [syncStatus?.isSyncing]);

  const [showBanner, setShowBanner] = useState(true);

  const dismissBanner = async () => {
    if (syncStatus?.id) {
      await api.khagatiSyncStatus.update(syncStatus.id, {
        userDismissedAt: new Date()
      });
      setShowBanner(false);
    }
  };

  const getSyncStatusMessage = () => {
    if (!syncStatus) return "";
    
    // If syncing is complete
    if (!syncStatus.isSyncing && syncStatus.overallStatus === "completed") {
      return `Sync completed at ${new Date(syncStatus.lastSyncCompletedAt).toLocaleString()}`;
    }
  
    // If still syncing, show specific stage
    if (syncStatus.isSyncing) {
      if (syncStatus.syncTypes.priceSync.status === "running") {
        return "Price sync in progress...";
      }
      if (syncStatus.syncTypes.inventorySync.status === "running") {
        return "Inventory sync in progress...";
      }
    }
  
    // If failed
    if (syncStatus.overallStatus === "failed") {
      return `Sync failed at ${new Date(syncStatus.lastSyncCompletedAt).toLocaleString()}`;
    }
  
    return "Unknown status";
  };

  const updateSyncStatus = async (statusData) => {
    try {
      await api.khagatiSyncStatus.update(statusData.id, statusData);
    } catch (error) {
      console.error("Failed to update sync status:", error);
    }
  };

  // Check for ongoing sync on mount
  useEffect(() => {
    const currentSyncId = localStorage.getItem('currentSyncId');
    if (currentSyncId && syncStatus?.id !== currentSyncId) {
      refetch();
    }
  }, []);

  return (
    <SyncStatusContext.Provider value={{ 
      syncStatus, 
      showBanner,
      setShowBanner,
      dismissBanner,
      updateSyncStatus,
      getSyncStatusMessage,
      isLoading: fetching || !syncStatus?.isSyncing
    }}>
      {children}
    </SyncStatusContext.Provider>
  );
} 