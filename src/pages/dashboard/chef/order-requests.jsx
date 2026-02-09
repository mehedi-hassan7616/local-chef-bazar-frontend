import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ClipboardList,
  Clock,
  MapPin,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  User,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/ui/loading";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";

export default function OrderRequestsPage() {
  const { dbUser } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("orderTime");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev !== search) {
          setPage(1);
        }
        return search;
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: ordersData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "chefOrders",
      dbUser?._id,
      page,
      limit,
      sort,
      order,
      debouncedSearch,
      paymentStatus,
      orderStatus,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sort", sort);
      params.append("order", order);
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (paymentStatus !== "all")
        params.append("paymentStatus", paymentStatus);
      if (orderStatus !== "all") params.append("orderStatus", orderStatus);

      const { data } = await axiosInstance.get(
        `/orders/chef?${params.toString()}`,
      );
      return data;
    },
    enabled: !!dbUser?._id,
    keepPreviousData: true,
  });

  const orders = ordersData?.orders || [];
  const total = ordersData?.total || 0;
  const totalPages = ordersData?.totalPages || 1;
  const currentPage = ordersData?.page || 1;

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      await axiosInstance.patch(`/orders/${orderId}`, { orderStatus: status });
    },
    onSuccess: (_, { status }) => {
      toast.success(`Order ${status} successfully!`);
      queryClient.invalidateQueries(["chefOrders"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update order");
    },
  });

  const handleStatusUpdate = (orderId, status) => {
    updateOrderMutation.mutate({ orderId, status });
  };

  const handleFilterChange = (filterType, value) => {
    setPage(1);
    switch (filterType) {
      case "paymentStatus":
        setPaymentStatus(value);
        break;
      case "orderStatus":
        setOrderStatus(value);
        break;
      case "sort":
        setSort(value);
        break;
      case "order":
        setOrder(value);
        break;
      case "limit":
        setLimit(Number(value));
        break;
    }
  };

  const clearFilters = () => {
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
    setPaymentStatus("all");
    setOrderStatus("all");
    setSort("orderTime");
    setOrder("desc");
  };

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

  const hasActiveFilters =
    debouncedSearch || paymentStatus !== "all" || orderStatus !== "all";

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          Order Requests
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage incoming orders from customers
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meal, email, or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters Grid */}
              <div className="space-y-3">
                {/* Filter Label */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters</span>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground h-8 px-2 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Filter Selects */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <Select
                    value={orderStatus}
                    onValueChange={(value) =>
                      handleFilterChange("orderStatus", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Order Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={paymentStatus}
                    onValueChange={(value) =>
                      handleFilterChange("paymentStatus", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sort}
                    onValueChange={(value) => handleFilterChange("sort", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orderTime">Order Time</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={order}
                    onValueChange={(value) =>
                      handleFilterChange("order", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
        <p className="text-center sm:text-left">
          Showing {orders.length} of {total} orders
          {isFetching && !isLoading && (
            <span className="ml-2 text-primary">Updating...</span>
          )}
        </p>
        <Select
          value={limit.toString()}
          onValueChange={(value) => handleFilterChange("limit", value)}
        >
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="5">5 / page</SelectItem>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {orders.length > 0 ? (
        <>
          <div className="grid gap-3 sm:gap-4">
            {orders.map((order, index) => {
              const isDisabled =
                order.orderStatus === "cancelled" ||
                order.orderStatus === "delivered";
              const canDeliver = order.orderStatus === "accepted";

              return (
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
                            <Badge
                              variant="outline"
                              className="gap-1 capitalize"
                            >
                              <CreditCard className="h-3 w-3" />
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                            <User className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate">{order.userName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                            <Mail className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate">{order.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4 text-primary shrink-0" />
                            <span>Qty: {order.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="h-4 w-4 text-primary shrink-0" />
                            <span>
                              Total: $
                              {(order.price * order.quantity).toFixed(2)}
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
                          <span className="break-words">
                            {order.userAddress}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(order._id, "cancelled")
                            }
                            disabled={
                              isDisabled || updateOrderMutation.isPending
                            }
                            className="gap-1 flex-1 sm:flex-none"
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:block">Cancel</span>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(order._id, "accepted")
                            }
                            disabled={
                              isDisabled ||
                              order.orderStatus === "accepted" ||
                              updateOrderMutation.isPending
                            }
                            className="gap-1 flex-1 sm:flex-none"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:block">Accept</span>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(order._id, "delivered")
                            }
                            disabled={
                              !canDeliver ||
                              order.paymentStatus !== "paid" ||
                              updateOrderMutation.isPending
                            }
                            className="gap-1 flex-1 sm:flex-none"
                          >
                            <Truck className="h-4 w-4" />
                            <span className="hidden sm:block">Deliver</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-1 sm:gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isFetching}
                className="px-2 sm:px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>

              {/* Mobile: Show current/total */}
              <div className="flex sm:hidden items-center px-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {currentPage}
                </span>
                <span className="mx-1">/</span>
                <span>{totalPages}</span>
              </div>

              {/* Desktop: Show page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, and pages around current
                    return (
                      p === 1 ||
                      p === totalPages ||
                      (p >= currentPage - 1 && p <= currentPage + 1)
                    );
                  })
                  .map((p, idx, arr) => {
                    // Add ellipsis
                    const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <span key={p} className="flex items-center">
                        {showEllipsisBefore && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={p === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(p)}
                          disabled={isFetching}
                          className="w-9"
                        >
                          {p}
                        </Button>
                      </span>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isFetching}
                className="px-2 sm:px-3"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 sm:py-16 px-4 text-center">
            <ClipboardList className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              {hasActiveFilters ? "No orders found" : "No order requests"}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              {hasActiveFilters
                ? "Try adjusting your filters or search query."
                : "When customers order your meals, requests will appear here."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
