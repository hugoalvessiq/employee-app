/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeDetails from "./components/Employee/EmployeeDetail/employeeDetails.jsx";
import SearchEmployee from "./components/Employee/SearchEmployee/SearchEmployee.jsx";
import EmployeeRegisterForm from "./components/Employee/EmployeeRegisterForm/EmployeeRegisterForm.jsx";
import UpdateEmployee from "./components/Employee/UpdateEmployee/UpdateEmployee.jsx";
import Login from "./pages/Login/Login.jsx";
import { EmployeesContextProvider } from "./context/EmployeeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./hook/ProtectRoute.jsx";
import Nopage from "./pages/Nopage/Nopage.jsx"; // In case you need a page for routes not found
import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home/Home.jsx";
import UserDetail from "./components/User/UserDetail/UserDetail.jsx";
import CreateUser from "./components/User/CreateUser/CreateUser.jsx";

import "./index.css";
import { UsersContextProvider } from "./context/UserContext.jsx";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateUser />} />
        <Route index element={<Home />} />
        <Route path="protected/" element={<ProtectedRoute />}>
          <Route path="employee" element={<EmployeeDetails />} />
          <Route path="user" element={<UserDetail />} />
          <Route path="search" element={<SearchEmployee />} />
          <Route path="create" element={<EmployeeRegisterForm />} />
          <Route path="update/:id" element={<UpdateEmployee />} />
          <Route path="*" element={<Nopage />} />{" "}
          {/* In case you need a page for routes not found */}
        </Route>
        <Route path="*" element={<Nopage />} />{" "}
        {/* To capture any undefined route */}
      </Route>
    </Routes>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <UsersContextProvider>
        <EmployeesContextProvider>
          <AppRouter />
        </EmployeesContextProvider>
      </UsersContextProvider>
    </AuthProvider>
  </React.StrictMode>
);
