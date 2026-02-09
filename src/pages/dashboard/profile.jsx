import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  User,
  Mail,
  MapPin,
  Shield,
  ChefHat,
  Crown,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";

export default function ProfilePage() {
  const { user, dbUser } = useAuth();
  const [requestingChef, setRequestingChef] = useState(false);
  const [requestingAdmin, setRequestingAdmin] = useState(false);

  const requestRoleMutation = useMutation({
    mutationFn: async (requestType) => {
      const requestData = {
        userName: user.displayName || dbUser?.name,
        userEmail: user.email,
        requestType,
        requestStatus: "pending",
        requestTime: new Date().toISOString(),
      };
      const { data } = await axiosInstance.post("/requests", requestData);
      return data;
    },
    onSuccess: (_, requestType) => {
      Swal.fire({
        icon: "success",
        title: "Request Sent!",
        text: `Your request to become ${requestType === "chef" ? "a Chef" : "an Admin"} has been submitted. Please wait for admin approval.`,
        confirmButtonColor: "#ea580c",
      });
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to submit request";
      if (message.includes("pending")) {
        toast.info("You already have a pending request.");
      } else {
        toast.error(message);
      }
    },
    onSettled: () => {
      setRequestingChef(false);
      setRequestingAdmin(false);
    },
  });

  const handleRequestRole = async (role) => {
    const result = await Swal.fire({
      title: `Become ${role === "chef" ? "a Chef" : "an Admin"}?`,
      text: `You are about to request ${role} privileges. The admin will review your request.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, send request!",
    });

    if (result.isConfirmed) {
      if (role === "chef") {
        setRequestingChef(true);
      } else {
        setRequestingAdmin(true);
      }
      requestRoleMutation.mutate(role);
    }
  };

  const userRole = dbUser?.role || "user";
  const userStatus = dbUser?.status || "active";

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account information
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.photoURL || dbUser?.photoURL} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.displayName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left space-y-2">
                  <h2 className="text-xl font-semibold">
                    {user?.displayName || dbUser?.name || "User"}
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge
                      className="uppercase"
                      variant={userRole === "admin" ? "default" : "secondary"}
                    >
                      {userRole === "admin" && (
                        <Crown className="h-3 w-3 mr-1" />
                      )}
                      {userRole === "chef" && (
                        <ChefHat className="h-3 w-3 mr-1" />
                      )}
                      {userRole}
                    </Badge>
                    <Badge
                      className="uppercase"
                      variant={
                        userStatus === "active" ? "outline" : "destructive"
                      }
                    >
                      {userStatus === "active" ? (
                        <BadgeCheck className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {userStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {user?.displayName || dbUser?.name || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium truncate">
                      {user?.email || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {dbUser?.address || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{userRole}</p>
                  </div>
                </div>

                {userRole === "chef" && dbUser?.chefId && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 sm:col-span-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Chef ID</p>
                      <p className="font-medium">{dbUser?.chefId}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRole !== "admin" && (
                <>
                  {userRole !== "chef" && (
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleRequestRole("chef")}
                      disabled={requestingChef || userStatus === "fraud"}
                    >
                      <ChefHat className="h-4 w-4" />
                      {requestingChef ? "Requesting..." : "Be a Chef"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleRequestRole("admin")}
                    disabled={requestingAdmin || userStatus === "fraud"}
                  >
                    <Crown className="h-4 w-4" />
                    {requestingAdmin ? "Requesting..." : "Be an Admin"}
                  </Button>

                  {userStatus === "fraud" && (
                    <p className="text-sm text-destructive text-center">
                      Your account is restricted. You cannot make role requests.
                    </p>
                  )}
                </>
              )}

              {userRole === "admin" && (
                <div className="text-center py-4">
                  <Crown className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">
                    You have the highest access level.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
