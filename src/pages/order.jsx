import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  MapPin,
  ChefHat,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/ui/loading";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";

const orderSchema = z.object({
  userAddress: z.string().min(10, "Please enter a valid delivery address"),
});

export default function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, dbUser } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      userAddress: dbUser?.address || "",
    },
  });

  // Fetch meal details
  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/meals/${id}`);
      return data;
    },
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const { data } = await axiosInstance.post("/orders", orderData);
      return data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
        confirmButtonColor: "#ea580c",
      }).then(() => {
        navigate("/dashboard/my-orders");
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
  });

  const totalPrice = meal ? (meal.price * quantity).toFixed(2) : 0;

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + change)));
  };

  const onSubmit = async (data) => {
    if (dbUser?.status === "fraud") {
      toast.error("Your account is restricted. You cannot place orders.");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Order",
      html: `
        <div class="text-left">
          <p><strong>Meal:</strong> ${meal.foodName}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>Total Price:</strong> $${totalPrice}</p>
        </div>
        <p class="mt-4">Do you want to confirm this order?</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, place order!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // Only send required fields - backend auto-fills the rest
      const orderData = {
        foodId: meal._id,
        quantity,
        userAddress: data.userAddress,
      };

      placeOrderMutation.mutate(orderData);
    }
  };

  if (isLoading) return <PageLoader />;

  if (!meal) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Meal Not Found</h2>
        <Button onClick={() => navigate("/meals")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Meals
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8 text-center">
            Complete Your <span className="text-primary">Order</span>
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={meal.foodImage || "/placeholder-food.jpg"}
                    alt={meal.foodName}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{meal.foodName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <ChefHat className="h-4 w-4" />
                      <span>{meal.chefName}</span>
                    </div>
                    <p className="text-primary font-semibold mt-2">
                      ${meal.price} per item
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Quantity</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold text-lg">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 10}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Delivery Fee
                      </span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">${totalPrice}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="mealName">Meal Name</Label>
                    <Input
                      id="mealName"
                      value={meal.foodName}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Item</Label>
                    <Input
                      id="price"
                      value={`$${meal.price}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chefId">Chef ID</Label>
                    <Input
                      id="chefId"
                      value={meal.chefId}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Your Email</Label>
                    <Input
                      id="userEmail"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userAddress">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Delivery Address
                    </Label>
                    <Textarea
                      id="userAddress"
                      placeholder="Enter your full delivery address"
                      rows={3}
                      {...register("userAddress")}
                      className={errors.userAddress ? "border-destructive" : ""}
                    />
                    {errors.userAddress && (
                      <p className="text-sm text-destructive">
                        {errors.userAddress.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={placeOrderMutation.isPending}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {placeOrderMutation.isPending
                      ? "Placing Order..."
                      : `Confirm Order - $${totalPrice}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
