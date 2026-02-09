import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LoadingPage } from "@/components/ui/loading";

export default function AuthLayout() {
  const navigate = useNavigate();
  const { user, loader } = useAuth();

  useEffect(() => {
    if (!loader && user) {
      navigate("/", { replace: true });
    }
  }, [user, loader, navigate]);

  if (loader) {
    return <LoadingPage />;
  }

  if (user) {
    return null;
  }

  return <Outlet />;
}
