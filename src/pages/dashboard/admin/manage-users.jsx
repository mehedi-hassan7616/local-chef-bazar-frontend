import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Users, ShieldAlert, ChefHat, Crown, BadgeCheck, AlertCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PageLoader } from "@/components/ui/loading";
import axiosInstance from "@/lib/axios";

export default function ManageUsersPage() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/users");
      return data.users || data || [];
    },
  });

  const makeFraudMutation = useMutation({
    mutationFn: async (userId) => {
      await axiosInstance.patch(`/users/${userId}/fraud`);
    },
    onSuccess: () => {
      toast.success("User marked as fraud!");
      queryClient.invalidateQueries(["allUsers"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const handleMakeFraud = async (userId, userName) => {
    const result = await Swal.fire({
      title: "Mark as Fraud?",
      text: `Are you sure you want to mark ${userName} as fraud? This will restrict their account.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, mark as fraud!",
    });

    if (result.isConfirmed) {
      makeFraudMutation.mutate(userId);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: { variant: "default", icon: Crown },
      chef: { variant: "secondary", icon: ChefHat },
      user: { variant: "outline", icon: BadgeCheck },
    };
    const config = variants[role] || variants.user;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1 capitalize">
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    return (
      <Badge
        variant={status === "active" ? "outline" : "destructive"}
        className="gap-1 capitalize"
      >
        {status === "active" ? (
          <BadgeCheck className="h-3 w-3" />
        ) : (
          <AlertCircle className="h-3 w-3" />
        )}
        {status}
      </Badge>
    );
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">
          View and manage all platform users
        </p>
      </motion.div>

      {users.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.photoURL} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          {user.role !== "admin" && user.status !== "fraud" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleMakeFraud(user._id, user.name)}
                              disabled={makeFraudMutation.isPending}
                              className="gap-1"
                            >
                              <ShieldAlert className="h-4 w-4" />
                              Make Fraud
                            </Button>
                          )}
                          {user.status === "fraud" && (
                            <span className="text-sm text-muted-foreground">Restricted</span>
                          )}
                          {user.role === "admin" && (
                            <span className="text-sm text-muted-foreground">Admin</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Users will appear here once they register.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
