import React, { useState, useEffect, useRef } from "react";
import { ResourceList, Text, Badge, Card, Icon } from "@shopify/polaris";
import { NotificationIcon } from "@shopify/polaris-icons";
import { api } from "../../api";
import "./notificationDropdown.css";

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.khagatiNotificationLog.findMany({
        sort: { createdAt: "Descending" },
      });;
      setNotifications(response);
    } catch (error) {
      setError(error);
    }
  };

  const renderSquares = (notification) => {
    if (notification.notificationViewStatus) return null;
    const colorMap = { error: "red", warn: "orange", info: "blue" };
    const squareColor = colorMap[notification.logType] || "gray";

    return (
      <div
        style={{
          width: "10px",
          height: "10px",
          backgroundColor: squareColor,
          marginRight: "8px",
          borderRadius: "4px",
          boxShadow: "0 0 0 3px rgba(0, 0, 0, 0.2)", // Outer ring effect
        }}
      />
    );
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <div className="notification-dropdown">
      <div
        className="notification-dropdown-trigger"
        onClick={toggleDropdown}
        ref={dropdownRef}
      >
        <Icon source={NotificationIcon} />
        <Badge status="new">
          <span style={{marginLeft:"-25%"}}>
            {
              notifications.filter(
                (notification) => !notification.notificationViewStatus
              ).length
            }
          </span>
        </Badge>
      </div>

      {dropdownOpen && (
        <div className="notification-dropdown-menu">
          <Card>
            <Text as="h2" variant="headingSm" className="dropdown-title">
              Notifications
            </Text>
            {notifications.length > 0 ? (
              <ResourceList
                items={notifications}
                renderItem={(item) => {
                  const {
                    id,
                    notificationInfo,
                    notificationDetails,
                    createdAt,
                  } = item;
              
                  // Wrapper for media with centralized styling
                  const media = (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center", // Centers vertically
                        justifyContent: "center", // Centers horizontally
                        height: "100%", // Ensures it stretches to fill the vertical space
                      }}
                    >
                      {renderSquares(item)}
                    </div>
                  );
              
                  return (
                    <ResourceList.Item id={id} media={media}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <Text>{notificationInfo}</Text>
                        <Text size="small">{notificationDetails?.markdown}</Text>
                        <Text size="small" color="subdued">
                          {new Date(createdAt).toLocaleString()}
                        </Text>
                      </div>
                    </ResourceList.Item>
                  );
                }}
              />
            ) : (
              <Text>No new notifications</Text>
            )}
          </Card>
        </div>
      )}

      {/* {error && <p>Error loading notifications</p>} */}
    </div>
  );
}

export default Notification;
