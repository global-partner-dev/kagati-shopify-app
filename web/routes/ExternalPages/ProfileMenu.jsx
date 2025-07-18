import React, { useState, useEffect, useRef } from "react";
import { useSignOut, useUser } from "@gadgetinc/react";
import { useNavigate } from "react-router-dom";
import "./profileMenu.css"; // Ensure you've imported your CSS
import { api } from "../../api";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const user = useUser(api);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle user sign-out
  const handleSignOut = () => {
    signOut(); // Call Gadget's sign-out method
    localStorage.setItem("isAuthExternal", "false"); // Remove auth-related data from localStorage
    navigate("/sign-in"); // Redirect to login page
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Render user initials or fallback
  const renderUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return (
        <>
          <p>{user.firstName[0].toUpperCase()}</p>
          <p>{user.lastName[0].toUpperCase()}</p>
        </>
      );
    }
    return <p>U</p>; // Default fallback
  };

  return (
    <div ref={dropdownRef} className="profile-menu-container">
      {/* Profile button toggles dropdown */}
      <button
        className="profile-button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="sr-only">Profile Menu</span>
        <div className="profile-image-main">{renderUserInitials()}</div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="profile-menu-items">
          {user ? (
            <>
              <p className="menu-item">{`${user.firstName} ${user.lastName}`}</p>
              <p className="menu-item">{user.email}</p>
              <p className="menu-item">{`Role: ${user.roleName}`}</p>
              <button
                className="menu-item menu-link"
                onClick={() => navigate(`/staffs/${user.id}`)}
              >
                Manage Profile
              </button>
              <button className="menu-item menu-link" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <p className="menu-item">Loading...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
