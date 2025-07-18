import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@gadgetinc/react";
import "./navigation.css";
import Settings from "../../assets/images/Settings.svg";
import Settings_filled from "../../assets/images/Settings_filled.svg";
import Orders from "../../assets/images/Orders.svg";
import Orders_filled from "../../assets/images/Orders_filled.svg";
import Inventory from "../../assets/images/Inventory.svg";
import Inventory_filled from "../../assets/images/Inventory_filled.svg";
import Stores from "../../assets/images/Stores.svg";
import Stores_filled from "../../assets/images/Stores_filled.svg";
import Pincodes from "../../assets/images/Pincodes.svg";
import Pincodes_filled from "../../assets/images/Pincodes_filled.svg";
import DeliveryIcon from "../../assets/images/DeliveryIcon.svg";
import DeliveryFilledIcon from "../../assets/images/DeliveryFilledIcon.svg";
import Customers from "../../assets/images/Customers.svg";
import Customers_filled from "../../assets/images/Customers_filled.svg";
import Staff from "../../assets/images/Staff.svg";
import { api } from "../../api";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUser(api); // Assuming user.storeModuleAccess is populated asynchronously
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [activeNavItems, setActiveNavItems] = useState([])
  const [activeNav, setActiveNav] = useState(location.pathname);

  // Define mapping for access control names
  const accessMap = {
    "Order List": "Orders",
    "Order Add": "Orders",
    "Order Edit": "Orders",
    "Inventories": "Inventories",
    "Stores": "Stores",
    "Pincodes": "Pincodes",
    "Staffs": "Staffs",
    "Customer Support": "Customer Support",
    "Shipping Profile": "Shipping Profile",
  };

  // Define navigation items
  const navigationItems = [
    { name: "Orders", icon: Orders, iconFilled: Orders_filled, path: "/orders" },
    { name: "Inventories", icon: Inventory, iconFilled: Inventory_filled, path: "/inventories" },
    { name: "Stores", icon: Stores, iconFilled: Stores_filled, path: "/stores" },
    { name: "Pincodes", icon: Pincodes, iconFilled: Pincodes_filled, path: "/pincodes" },
    { name: "Staffs", icon: Staff, iconFilled: Staff, path: "/staffs" },
    { name: "Customer Support", icon: Customers, iconFilled: Customers_filled, path: "/customer-support" },
    { name: "Settings", icon: Settings, iconFilled: Settings_filled, path: "/settings" },
    { name: "Shipping Profile", icon: DeliveryIcon, iconFilled: DeliveryFilledIcon, path: "/shipping" },
  ];

  // Filter navigation items based on user access using accessMap
  useEffect(() => {
    const accessibleItems = navigationItems.filter((item) =>
      user.storeModuleAccess?.some((access) => accessMap[access] === item.name)
    );
    setActiveNavItems(accessibleItems)
  }, [user])

  // Navigate to the first accessible item on initial render
  // useEffect(() => {
  //   if (accessibleItems.length > 0 && !accessibleItems.some((item) => location.pathname === item.path)) {
  //     navigate(accessibleItems[0].path);
  //     setActiveNav(accessibleItems[0].path);
  //   }
  // }, [user.storeModuleAccess, accessibleItems]);

  // Handle navigation item click
  const handleClick = (index, path) => {
    setSelectedItemId(index);
    setActiveNav(path);
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <nav className="nav-menu">
        <ul>
          {activeNavItems.map((item, index) => (
            <li
              key={index}
              className={`navigation_menu ${activeNav === item.path ? "active" : ""}`}
              onClick={() => handleClick(index, item.path)}
            >
              <Link to={item.path}>
                <div className="navigation_menu_inner">
                  <span className="navigation_menu_icon">
                    <img
                      src={activeNav === item.path ? item.iconFilled : item.icon}
                      alt={item.name}
                      loading="lazy"
                    />
                  </span>
                  <span className="navigation_menu_title">{item.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
