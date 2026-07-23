import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import Home from "../home/Home";
import Shop from "../shop/Shop";
import SingleProduct from "../components/SingleProduct";
import Signup from "../components/Signup";
import Orders from "../components/Orders";
import GigoManagement from "../dashboard/GigoManagement";
import Login from "../components/Login";
import Profile from "../components/Profile";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import ManagerRoute from "../PrivateRoute/ManagerRoute";
import Unauthorized from "../PrivateRoute/Unauthorized";
import Logout from "../components/Logout";
import About from "../about/About";
import Blog from "../blog/Blog";
import NotFound from "../components/NotFound";

const API_URL = import.meta.env.VITE_API_URL;

const fetchProductData = async ({ params }) => {
  try {
    const res = await fetch(`${API_URL}/products/${params.id}`);
    if (!res.ok) throw new Error("Failed to load product data");
    return res.json();
  } catch (error) {
    console.error("Error loading product:", error);
    return null;
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/shop", element: <Shop /> },
      { path: "/product/:id", element: <SingleProduct />, loader: fetchProductData },
      { path: "/about", element: <About /> },
      { path: "/blog", element: <Blog /> },
      {
        path: "/orders",
        element: <PrivateRoute><Orders /></PrivateRoute>,
      },
      {
        path: "/profile",
        element: <PrivateRoute><Profile /></PrivateRoute>,
      },
    ],
  },
  { path: "/signup", element: <Signup /> },
  { path: "/sign-up", element: <Navigate to="/signup" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "/admin", element: <Navigate to="/admin/management" replace /> },
  {
    path: "/admin/management",
    element: (
      <ManagerRoute>
        <GigoManagement />
      </ManagerRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
