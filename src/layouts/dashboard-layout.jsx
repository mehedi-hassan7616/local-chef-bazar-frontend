import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  ShoppingBag,
  Star,
  Heart,
  ChefHat,
  PlusCircle,
  UtensilsCrossed,
  ClipboardList,
  Users,
  FileCheck,
  BarChart3,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dbUser, logOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  console.log("dbUser", dbUser);

  const userRole = dbUser?.role || "user";

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  // Common menu items for all users
  const commonMenuItems = [
    { path: "/dashboard", label: "My Profile", icon: User, exact: true },
  ];

  // User-specific menu items
  const userMenuItems = [
    { path: "/dashboard/my-orders", label: "My Orders", icon: ShoppingBag },
    { path: "/dashboard/my-reviews", label: "My Reviews", icon: Star },
    { path: "/dashboard/favorites", label: "Favorite Meals", icon: Heart },
  ];

  // Chef-specific menu items
  const chefMenuItems = [
    { path: "/dashboard/create-meal", label: "Create Meal", icon: PlusCircle },
    { path: "/dashboard/my-meals", label: "My Meals", icon: UtensilsCrossed },
    {
      path: "/dashboard/order-requests",
      label: "Order Requests",
      icon: ClipboardList,
    },
  ];

  // Admin-specific menu items
  const adminMenuItems = [
    { path: "/dashboard/manage-users", label: "Manage Users", icon: Users },
    {
      path: "/dashboard/manage-requests",
      label: "Manage Requests",
      icon: FileCheck,
    },
    {
      path: "/dashboard/statistics",
      label: "Platform Statistics",
      icon: BarChart3,
    },
  ];

  // Build menu based on role
  let menuItems = [...commonMenuItems];

  if (userRole === "user") {
    menuItems = [...menuItems, ...userMenuItems];
  }

  if (userRole === "chef") {
    menuItems = [...menuItems, ...chefMenuItems];
  }

  if (userRole === "admin") {
    menuItems = [...menuItems, ...adminMenuItems];
  }

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">
            LocalChef<span className="text-primary">Bazaar</span>
          </span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.photoURL || dbUser?.photoURL} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {user?.displayName || dbUser?.name || "User"}
            </p>
            <Badge variant="secondary" className="capitalize">
              {userRole}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
              >
                <Button
                  variant={active ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <Link to="/" onClick={() => setMobileOpen(false)}>
          <Button variant="outline" className="w-full justify-start gap-3">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Button
          variant="destructive"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b bg-background">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold">LocalChefBazaar</span>
        </Link>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="hidden lg:flex items-center justify-end p-4 border-b bg-background">
          <ModeToggle />
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
