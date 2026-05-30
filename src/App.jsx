import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/route/ProtectedRoute";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";

import "./styles/layout.css";
import "./styles/floating-whatsapp.css";

import "./styles/products.css";
import "./styles/new-arrivals.css";
import "./styles/categories.css";
import "./styles/trust.css";
import "./styles/testimonials.css";
import "./styles/shop.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/admin.css";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        {/* SHOP */}
        <Route
          path="/shop"
          element={
            <Layout>
              <Shop />
            </Layout>
          }
        />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* CUSTOMER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ORDERS */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute adminOnly>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;