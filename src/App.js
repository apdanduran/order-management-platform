import React from "react";
import OrdersTable from "./pages/OrdersTable";
import CouriersTable from "./pages/CouriersTable";
import OnTheWay from "./pages/OnTheWay";
import "./App.css";
import AppNavbar from "./components/AppNavbar";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "antd/es/layout/layout";

const App = () => {
  return (
    <div className="app">
      <Router>
        <AppNavbar />
        <div className="headerAndContent">
          <Header className="header">Paket Mutfak</Header>
          <Routes>
            <Route path="/" element={<OrdersTable />} />
            <Route path="/orders" element={<OrdersTable />} />
            <Route path="/couriers" element={<CouriersTable />} />
            <Route path="/ontheway" element={<OnTheWay />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;
