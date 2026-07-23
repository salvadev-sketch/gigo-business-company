import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext"; // Import context
import { Navigate, useLocation } from "react-router-dom"; // Import redirect and location hooks

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext); // Get user and loading status from context
  const location = useLocation();

  // If loading, show loading spinner (or something else)
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is logged in, render the children (dashboard or admin content)
  if (user) {
    return children; // ✅ Return the actual children component (e.g., Dashboard)
  }

  // If user is not logged in, redirect to the login page with the current location as state
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
