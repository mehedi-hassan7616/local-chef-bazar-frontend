import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ShoppingBag,
  Clock,
  ChefHat,
  MapPin,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["myOrders", user?.email],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/orders/user");
      return data.orders || data || [];
    },
    enabled: !!user?.email,
  });

  const paymentMutation = useMutation({
    mutationFn: async (orderId) => {
      const { data } = await axiosInstance.post(`/payments/create-session`, {
        orderId,
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.success("Payment initiated!");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Payment failed");
    },
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
      accepted: { variant: "default", icon: Package, color: "text-blue-600" },
      delivered: {
        variant: "default",
        icon: CheckCircle,
        color: "text-green-600",
      },
      cancelled: {
        variant: "destructive",
        icon: XCircle,
        color: "text-red-600",
      },
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

  const getPaymentBadge = (status) => {
    return (
      <Badge
        variant={status === "paid" ? "default" : "outline"}
        className="gap-1 capitalize"
      >
        <CreditCard className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">My Orders</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track and manage your food orders
        </p>
      </motion.div>

      {orders.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Total {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      )}

      {orders.length > 0 ? (
        <div className="grid gap-3 sm:gap-4">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    {/* Header: Meal name + Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="font-semibold text-base sm:text-lg">
                        {order.mealName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(order.orderStatus)}
                        {getPaymentBadge(order.paymentStatus)}
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                        <ChefHat className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">
                          Chef: {order.chefName || order.chefId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4 text-primary shrink-0" />
                        <span>Qty: {order.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          Total: ${(order.price * order.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">
                          {format(
                            new Date(order.orderTime),
                            "MMM dd, yyyy HH:mm",
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="break-words">{order.userAddress}</span>
                    </div>

                    {/* Action Button */}
                    {order.orderStatus === "accepted" &&
                      order.paymentStatus?.toLowerCase() === "pending" && (
                        <div className="flex justify-end pt-4 border-t">
                          <Button
                            onClick={() => paymentMutation.mutate(order._id)}
                            disabled={paymentMutation.isPending}
                            className="gap-2 w-full sm:w-auto"
                          >
                            {paymentMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                            Pay Now
                          </Button>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 sm:py-16 px-4 text-center">
            <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              No orders yet
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              When you place orders, they will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
