import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { getStoredToken, getStoredUser } from "../utils/authStorage";

const Login = lazy(() => import("../pages/Login"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Admin = lazy(() => import("../pages/Admin"));
const Cart = lazy(() => import("../pages/Cart"));
const Orders = lazy(() => import("../pages/Orders"));
const AdminProducts = lazy(() => import("../pages/AdminProducts"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Register = lazy(() => import("../pages/Register"));
const AdminOrders = lazy(() => import("../pages/AdminOrders"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const Profile = lazy(() => import("../pages/Profile"));

const RequireAuth = ({ children }) => {
  return getStoredToken() ? children : <Navigate to="/login" replace />;
};

const RequireAdmin = ({ children }) => {
  const user = getStoredUser();
  return getStoredToken() && user?.role === "admin" ? children : <Navigate to="/products" replace />;
};

const AppRoutes = () => (
  <Suspense fallback={<div className="loading-state">Đang tải trang...</div>}>
    <Routes>
      <Route path="/" element={<Navigate to="/products" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
      <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
      <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
      <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/admin/orders" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
