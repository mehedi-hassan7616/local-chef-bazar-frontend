import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingPage } from "@/components/ui/loading";

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, setUser, setDbUser, dbUser, loader } = useAuth();
  const accessToken = localStorage.getItem("token");
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loader) {
    return <LoadingPage />;
  }
  console.log("user", user);
  console.log("accessToken", accessToken);
  // Redirect to login if not authenticated
  if (!accessToken || !user) {
    setUser(null);
    setDbUser(null);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = dbUser?.role || "user";
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
