import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Crown,
  Mail,
  User,
} from "lucide-react";

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
import { PageLoader } from "@/components/ui/loading";
import axiosInstance from "@/lib/axios";

export default function ManageRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["roleRequests"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/requests");
      return data.requests || data || [];
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, action }) => {
      // Use the new approve/reject endpoints - backend handles role update and chefId generation
      const endpoint = action === "approved" 
        ? `/requests/${requestId}/approve` 
        : `/requests/${requestId}/reject`;
      const { data } = await axiosInstance.patch(endpoint);
      return data;
    },
    onSuccess: (data, { action }) => {
      toast.success(data.message || `Request ${action} successfully!`);
      queryClient.invalidateQueries(["roleRequests"]);
      queryClient.invalidateQueries(["allUsers"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update request");
    },
  });

  const handleUpdateRequest = (requestId, action) => {
    updateRequestMutation.mutate({ requestId, action });
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1 capitalize">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    return (
      <Badge variant="outline" className="gap-1 capitalize">
        {type === "chef" ? <ChefHat className="h-3 w-3" /> : <Crown className="h-3 w-3" />}
        {type}
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
        <h1 className="text-2xl md:text-3xl font-bold">Manage Requests</h1>
        <p className="text-muted-foreground">
          Review and manage role upgrade requests
        </p>
      </motion.div>

      {requests.length > 0 ? (
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
                      <TableHead>Request Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Request Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => {
                      const isPending = request.requestStatus === "pending";
                      return (
                        <TableRow key={request._id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{request.userName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              {request.userEmail}
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(request.requestType)}</TableCell>
                          <TableCell>{getStatusBadge(request.requestStatus)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(request.requestTime), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                          <TableCell className="text-right">
                            {isPending ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleUpdateRequest(request._id, "approved")}
                                  disabled={updateRequestMutation.isPending}
                                  className="gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleUpdateRequest(request._id, "rejected")}
                                  disabled={updateRequestMutation.isPending}
                                  className="gap-1"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground capitalize">
                                {request.requestStatus}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FileCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No requests</h3>
            <p className="text-muted-foreground">
              Role upgrade requests will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
