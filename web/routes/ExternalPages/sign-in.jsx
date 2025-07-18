import React, { useEffect, useState } from "react";
import { useGlobalAction } from "@gadgetinc/react";
import { api } from "../../api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GoogleIcon from "../../assets/images/google.svg";
import KaghatiLogo from "../../assets/images/kaghati_logo.jpeg";
import "../../assets/styles/ExternalApp.css";

export default function SignIn() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState('');
  const [{ fetching: isLoading }, signIn] = useGlobalAction(api.signIn);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setNotification("Email and password are required");
      return;
    }

    try {
      const response = await signIn({ email, password });
      console.log("Response:", response);

      if (response.data.authentication === "login") {
        localStorage.setItem("isAuthExternal", "true");
        navigate("/orders", { replace: true });
      } else if (response.data.authentication === "disLogin") {
        setNotification("Incorrect password. Please try again.");
      } else if (response.data.authentication === "unregistered") {
        setNotification("Email not registered.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setNotification("An error occurred during sign-in. Please try again.");
    }
  };

  return (
    <div className="sign-in-main">
      <div className="card">
        <form className="custom-form" onSubmit={handleSubmit}>
          <div className="logo">
            <img src={KaghatiLogo} width={40} alt="Kaghati Logo" />
            <span className="bold-text">Kaghati</span>
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              padding: "17px 0px 10px",
            }}
          >
            Sign in
          </h1>
          <div className="custom-form">
            <input
              className="custom-input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="custom-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {notification && <p className="format-message error">{notification}</p>}
            <button
              disabled={isLoading}
              type="submit"
              className="sign-in-button"
            >
              {isLoading ? "Loading..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}