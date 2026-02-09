import {
  Home,
  UtensilsCrossed,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, dbUser, logOut, loader } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { path: "/", label: "Home", icon: Home, public: true },
    { path: "/meals", label: "Meals", icon: UtensilsCrossed, public: true },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      public: false,
    },
  ];

  const visibleNavLinks = navLinks.filter((link) => link.public || user);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold hidden sm:block">
                LocalChef<span className="text-primary">Bazaar</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {visibleNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.path} to={link.path}>
                    <Button
                      variant={isActive(link.path) ? "default" : "ghost"}
                      className="gap-2"
                      size="sm"
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - User menu and theme toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ModeToggle />
            {loader ? (
              <div className="hidden sm:flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ) : user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-full p-0 ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.displayName
                            ? user.displayName.charAt(0).toUpperCase()
                            : user.email
                              ? user.email.charAt(0).toUpperCase()
                              : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.displayName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.displayName || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary" />
                        LocalChefBazaar
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-2">
                      {visibleNavLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={
                                isActive(link.path) ? "default" : "ghost"
                              }
                              className="w-full justify-start gap-3"
                            >
                              <Icon className="h-5 w-5" />
                              {link.label}
                            </Button>
                          </Link>
                        );
                      })}
                      <div className="pt-4 border-t mt-4">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-5 w-5" />
                          Log out
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" className="gap-2" size="sm">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="gap-2" size="sm">
                      <UserPlus className="h-4 w-4" />
                      Register
                    </Button>
                  </Link>
                </div>
                {/* Mobile Menu Button for non-logged in users */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="sm:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary" />
                        LocalChefBazaar
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-2">
                      {visibleNavLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={
                                isActive(link.path) ? "default" : "ghost"
                              }
                              className="w-full justify-start gap-3"
                            >
                              <Icon className="h-5 w-5" />
                              {link.label}
                            </Button>
                          </Link>
                        );
                      })}
                      <div className="pt-4 border-t mt-4 space-y-2">
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-3"
                          >
                            <LogIn className="h-5 w-5" />
                            Login
                          </Button>
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button className="w-full justify-start gap-3">
                            <UserPlus className="h-5 w-5" />
                            Register
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
