import { createBrowserRouter } from "react-router-dom";

// Layouts
import AuthLayout from "@/layouts/auth-layout";
import MainLayout from "@/layouts/main-layout";
import DashboardLayout from "@/layouts/dashboard-layout";

// Components
import PrivateRoute from "@/components/private-route";

// Public Pages
import HomePage from "@/pages/home";
import MealsPage from "@/pages/meals";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import NotFoundPage from "@/pages/not-found";
import ErrorPage from "@/pages/error";
import PaymentSuccessPage from "@/pages/payment-success";

// Private Pages
import MealDetailsPage from "@/pages/meal-details";
import OrderPage from "@/pages/order";

// Dashboard Pages
import ProfilePage from "@/pages/dashboard/profile";
import MyOrdersPage from "@/pages/dashboard/my-orders";
import MyReviewsPage from "@/pages/dashboard/my-reviews";
import FavoritesPage from "@/pages/dashboard/favorites";

// Chef Dashboard Pages
import CreateMealPage from "@/pages/dashboard/chef/create-meal";
import MyMealsPage from "@/pages/dashboard/chef/my-meals";
import OrderRequestsPage from "@/pages/dashboard/chef/order-requests";

// Admin Dashboard Pages
import ManageUsersPage from "@/pages/dashboard/admin/manage-users";
import ManageRequestsPage from "@/pages/dashboard/admin/manage-requests";
import StatisticsPage from "@/pages/dashboard/admin/statistics";

// Title wrapper component
const TitleWrapper = ({ title, children }) => {
  document.title = title ? `${title} | LocalChefBazaar` : "LocalChefBazaar";
  return children;
};

const router = createBrowserRouter([
  // Main Layout Routes
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: (
          <TitleWrapper title="Home">
            <HomePage />
          </TitleWrapper>
        ),
      },
      {
        path: "/meals",
        element: (
          <TitleWrapper title="Meals">
            <MealsPage />
          </TitleWrapper>
        ),
      },
      {
        path: "/meals/:id",
        element: (
          <PrivateRoute>
            <TitleWrapper title="Meal Details">
              <MealDetailsPage />
            </TitleWrapper>
          </PrivateRoute>
        ),
      },
      {
        path: "/order/:id",
        element: (
          <PrivateRoute>
            <TitleWrapper title="Place Order">
              <OrderPage />
            </TitleWrapper>
          </PrivateRoute>
        ),
      },
    ],
  },

  // Auth Layout Routes
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: (
          <TitleWrapper title="Login">
            <LoginPage />
          </TitleWrapper>
        ),
      },
      {
        path: "/register",
        element: (
          <TitleWrapper title="Register">
            <RegisterPage />
          </TitleWrapper>
        ),
      },
    ],
  },

  // Dashboard Layout Routes
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      // Common Routes
      {
        path: "/dashboard",
        element: (
          <TitleWrapper title="Profile">
            <ProfilePage />
          </TitleWrapper>
        ),
      },

      // User Routes
      {
        path: "/dashboard/my-orders",
        element: (
          <TitleWrapper title="My Orders">
            <MyOrdersPage />
          </TitleWrapper>
        ),
      },
      {
        path: "/dashboard/my-reviews",
        element: (
          <TitleWrapper title="My Reviews">
            <MyReviewsPage />
          </TitleWrapper>
        ),
      },
      {
        path: "/dashboard/favorites",
        element: (
          <TitleWrapper title="Favorites">
            <FavoritesPage />
          </TitleWrapper>
        ),
      },

      // Chef Routes
      {
        path: "/dashboard/create-meal",
        element: (
          <PrivateRoute allowedRoles={["chef"]}>
            <TitleWrapper title="Create Meal">
              <CreateMealPage />
            </TitleWrapper>
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard/my-meals",
        element: (
          <PrivateRoute allowedRoles={["chef"]}>
            <TitleWrapper title="My Meals">
              <MyMealsPage />
            </TitleWrapper>
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard/order-requests",
        element: (
          <PrivateRoute allowedRoles={["chef"]}>
            <TitleWrapper title="Order Requests">
              <OrderRequestsPage />
            </TitleWrapper>
          </PrivateRoute>
        ),
      },

      // Admin Routes
      {
        path: "/dashboard/manage-users",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <TitleWrapper title="Manage Users">
              <ManageUsersPage />
            </TitleWrapper>
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard/manage-requests",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <TitleWrapper title="Manage Requests">
              <ManageRequestsPage />
            </TitleWrapper>
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard/statistics",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <TitleWrapper title="Statistics">
              <StatisticsPage />
            </TitleWrapper>
          </PrivateRoute>
        ),
      },
    ],
  },

  // Payment Success
  {
    path: "/payment-success",
    element: (
      <TitleWrapper title="Payment Successful">
        <PaymentSuccessPage />
      </TitleWrapper>
    ),
  },

  // 404 Not Found
  {
    path: "*",
    element: (
      <TitleWrapper title="Page Not Found">
        <NotFoundPage />
      </TitleWrapper>
    ),
  },
]);

export default router;
