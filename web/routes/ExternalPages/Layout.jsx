import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Provider, useUser } from "@gadgetinc/react";
import "../../assets/styles/App.css";
import { api } from "../../api";
import Header from "./Header";
import Navigation from "./Navigation";

const Layout = () => {
  const navigate = useNavigate();
  const user = useUser(api);
  
  const [isAuthExternal, setIsAuthExternal] = useState("false")
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthExternal")
    setIsAuthExternal(isAuth)
  },[])


  if (!api) {
    return <div>Loading Gadget API...</div>;
  }

  return (
    <Provider api={api} navigate={navigate} auth={window.gadgetConfig.authentication}>
      {user ? <Header /> : null}

      <div className="app-layout">
        {user ? <Navigation /> : null}

        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </Provider>
  );
};

export default Layout;
