import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  Star,
  Edit2,
  Trash2,
  UtensilsCrossed,
  MapPinned,
  X,
  Plus,
  DollarSign,
  ChefHat,
  Calendar,
  Eye,
  Clock,
  MapPin,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageLoader } from "@/components/ui/loading";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";

const mealSchema = z.object({
  foodName: z.string().min(3, "Food name must be at least 3 characters"),
  price: z.string().min(1, "Price is required"),
  deliveryArea: z.string().min(1, "Delivery area is required"),
  estimatedDeliveryTime: z.string().min(1, "Delivery time is required"),
  chefExperience: z.string().min(5, "Please describe your experience"),
});

export default function MyMealsPage() {
  const { dbUser } = useAuth();
  const queryClient = useQueryClient();
  const [editingMeal, setEditingMeal] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mealSchema),
  });

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ["chefMeals", dbUser?.chefId],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/meals/chef");
      return data.meals || data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (mealId) => {
      await axiosInstance.delete(`/meals/${mealId}`);
    },
    onSuccess: () => {
      toast.success("Meal deleted successfully!");
      queryClient.invalidateQueries(["chefMeals"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete meal");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ mealId, data }) => {
      await axiosInstance.patch(`/meals/${mealId}`, { ...data, ingredients });
    },
    onSuccess: () => {
      toast.success("Meal updated successfully!");
      setEditingMeal(null);
      reset();
      queryClient.invalidateQueries(["chefMeals"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update meal");
    },
  });

  const handleDelete = async (mealId) => {
    const result = await Swal.fire({
      title: "Delete Meal?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(mealId);
    }
  };

  const [viewingMeal, setViewingMeal] = useState(null);

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setIngredients(meal.ingredients || []);
    setValue("foodName", meal.foodName);
    setValue("price", meal.price.toString());
    setValue("deliveryArea", meal.deliveryArea);
    setValue("deliveryTime", meal.estimatedDeliveryTime);
    setValue("chefExperience", meal.chefExperience);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate stats
  const totalMeals = meals.length;
  const avgRating =
    meals.length > 0
      ? (
          meals.reduce((sum, m) => sum + (m.rating || 0), 0) / meals.length
        ).toFixed(1)
      : "0.0";
  const totalRevenue = meals
    .reduce((sum, m) => sum + (m.price || 0), 0)
    .toFixed(2);

  const handleAddIngredient = () => {
    if (
      ingredientInput.trim() &&
      !ingredients.includes(ingredientInput.trim())
    ) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    updateMutation.mutate({
      mealId: editingMeal._id,
      data: { ...data, price: parseFloat(data.price) },
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">My Meals</h1>
              <p className="text-muted-foreground text-sm">
                Manage your menu items
              </p>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        {meals.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[80px] font-semibold">
                          Image
                        </TableHead>
                        <TableHead className="font-semibold">
                          Food Name
                        </TableHead>
                        <TableHead className="text-right font-semibold">
                          Price
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Rating
                        </TableHead>
                        <TableHead className="font-semibold">
                          Delivery area
                        </TableHead>
                        <TableHead className="font-semibold">
                          Ingredients
                        </TableHead>
                        <TableHead className="font-semibold">Created</TableHead>
                        <TableHead className="text-center font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meals.map((meal, index) => (
                        <TableRow
                          key={meal._id}
                          className="group hover:bg-muted/30 transition-colors whitespace-nowrap"
                        >
                          <TableCell>
                            <div className="relative">
                              <img
                                src={meal.foodImage || "/placeholder-food.jpg"}
                                alt={meal.foodName}
                                className="w-14 h-14 object-cover aspect-square rounded-lg border shadow-sm"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[180px]">
                              <p className="font-medium line-clamp-1">
                                {meal.foodName}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                by {meal.chefName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="secondary"
                              className="font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              ${meal.price.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Star
                                className={`h-4 w-4 ${
                                  meal.rating > 0
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <span className="font-medium">
                                {meal.rating?.toFixed(1) || "0.0"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm">
                              <MapPinned className="h-4 w-4 text-muted-foreground" />
                              <span>{meal.deliveryArea}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-wrap gap-1 max-w-[140px] cursor-help">
                                  {meal.ingredients
                                    ?.slice(0, 2)
                                    .map((ing, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-xs px-2 py-0"
                                      >
                                        {ing}
                                      </Badge>
                                    ))}
                                  {meal.ingredients?.length > 2 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-0"
                                    >
                                      +{meal.ingredients.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-[200px]"
                              >
                                <p className="text-xs">
                                  {meal.ingredients?.join(", ")}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(meal.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setViewingMeal(meal)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View details</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEdit(meal)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit meal</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(meal._id)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete meal</TooltipContent>
                              </Tooltip>
                            </div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="py-16 text-center">
                <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                  <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No meals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first meal to start receiving orders.
                </p>
                <Button asChild>
                  <a href="/dashboard/create-meal">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Meal
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* View Dialog */}
        <Dialog open={!!viewingMeal} onOpenChange={() => setViewingMeal(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Meal Details
              </DialogTitle>
              <DialogDescription>
                View complete information about this meal
              </DialogDescription>
            </DialogHeader>
            {viewingMeal && (
              <div className="space-y-4">
                {/* Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden border">
                  <img
                    src={viewingMeal.foodImage || "/placeholder-food.jpg"}
                    alt={viewingMeal.foodName}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-black/70 text-white">
                    ${viewingMeal.price.toFixed(2)}
                  </Badge>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {viewingMeal.foodName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      by {viewingMeal.chefName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>
                        Rating: {viewingMeal.rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{viewingMeal.deliveryArea}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Ingredients</p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingMeal.ingredients?.map((ing, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">
                      Chef's Experience
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {viewingMeal.chefExperience}
                    </p>
                  </div>

                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Created on {formatDate(viewingMeal.createdAt)}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingMeal} onOpenChange={() => setEditingMeal(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-primary" />
                Edit Meal
              </DialogTitle>
              <DialogDescription>
                Update the details of your meal
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="foodName">Food Name</Label>
                <Input
                  id="foodName"
                  placeholder="Enter food name"
                  {...register("foodName")}
                  className={errors.foodName ? "border-destructive" : ""}
                />
                {errors.foodName && (
                  <p className="text-sm text-destructive">
                    {errors.foodName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      className="pl-9"
                      {...register("price")}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDeliveryTime">Delivery time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="estimatedDeliveryTime"
                      placeholder=" (e.g. 30-45 minutes)"
                      className="pl-9"
                      {...register("estimatedDeliveryTime")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryArea">Delivery Area</Label>
                  <div className="relative">
                    <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deliveryArea"
                      placeholder=" (e.g., Downtown, Uptown)"
                      className="pl-9"
                      {...register("deliveryArea")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ingredients</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type ingredient and press Enter"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddIngredient())
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddIngredient}
                    variant="secondary"
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {ingredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50">
                    {ingredients.map((ing, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 py-1">
                        {ing}
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(i)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No ingredients added
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="chefExperience">Chef's Experience</Label>
                <Textarea
                  id="chefExperience"
                  rows={3}
                  placeholder="Describe your culinary experience..."
                  {...register("chefExperience")}
                  className={errors.chefExperience ? "border-destructive" : ""}
                />
                {errors.chefExperience && (
                  <p className="text-sm text-destructive">
                    {errors.chefExperience.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingMeal(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
