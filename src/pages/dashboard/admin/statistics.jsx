import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import axiosInstance from "@/lib/axios";

const COLORS = ["#ea580c", "#22c55e", "#3b82f6", "#a855f7"];

export default function StatisticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["platformStats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/statistics");
      return data;
    },
  });

  if (isLoading) return <PageLoader />;

  const defaultStats = {
    totalPayments: stats?.totalPayments || 0,
    totalUsers: stats?.totalUsers || 0,
    pendingOrders: stats?.pendingOrders || 0,
    deliveredOrders: stats?.deliveredOrders || 0,
    totalChefs: stats?.totalChefs || 0,
    totalMeals: stats?.totalMeals || 0,
  };

  const orderData = [
    { name: "Pending", value: defaultStats.pendingOrders, color: "#f59e0b" },
    { name: "Delivered", value: defaultStats.deliveredOrders, color: "#22c55e" },
  ];

  const overviewData = [
    { name: "Users", value: defaultStats.totalUsers },
    { name: "Chefs", value: defaultStats.totalChefs },
    { name: "Meals", value: defaultStats.totalMeals },
    { name: "Orders", value: defaultStats.pendingOrders + defaultStats.deliveredOrders },
  ];

  const statCards = [
    {
      title: "Total Payments",
      value: `$${defaultStats.totalPayments.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      title: "Total Users",
      value: defaultStats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Pending Orders",
      value: defaultStats.pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Delivered Orders",
      value: defaultStats.deliveredOrders,
      icon: CheckCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">Platform Statistics</h1>
        <p className="text-muted-foreground">
          Overview of platform performance and metrics
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Order Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {orderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">{defaultStats.totalChefs}</p>
                <p className="text-sm text-muted-foreground">Active Chefs</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">{defaultStats.totalMeals}</p>
                <p className="text-sm text-muted-foreground">Total Meals</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">
                  {defaultStats.pendingOrders + defaultStats.deliveredOrders}
                </p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">
                  {defaultStats.deliveredOrders > 0
                    ? ((defaultStats.deliveredOrders / (defaultStats.pendingOrders + defaultStats.deliveredOrders)) * 100).toFixed(0)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
