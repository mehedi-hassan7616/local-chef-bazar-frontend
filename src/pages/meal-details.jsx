import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Star,
  MapPinned,
  ChefHat,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Send,
  Leaf,
  Calendar,
  Award,
  Sparkles,
  Pencil,
  Trash2,
  MoreVertical,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PageLoader } from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export default function MealDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, dbUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [userAddress, setUserAddress] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
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

  // Fetch reviews for this meal
  const { data: reviews = [] } = useQuery({
    queryKey: ["mealReviews", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/reviews/meal/${id}`);
      return data.reviews || data || [];
    },
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      // Only send mealId - backend auto-fills the rest
      const { data } = await axiosInstance.post("/favorites", {
        mealId: meal._id,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Added to favorites!");
      queryClient.invalidateQueries(["favorites"]);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to add to favorites";
      if (message.includes("already")) {
        toast.info("This meal is already in your favorites");
      } else {
        toast.error(message);
      }
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      // Only send essential fields - backend auto-fills reviewer info and date
      const data = {
        foodId: id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      };
      const response = await axiosInstance.post("/reviews", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      reset();
      setSelectedRating(0);
      queryClient.invalidateQueries(["mealReviews", id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await axiosInstance.post("/orders", orderData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Order placed successfully!");
      setOrderDialogOpen(false);
      setOrderQuantity(1);
      setUserAddress("");
      queryClient.invalidateQueries(["orders"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }) => {
      const response = await axiosInstance.patch(`/reviews/${reviewId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Review updated successfully!");
      setEditDialogOpen(false);
      setSelectedReview(null);
      setEditRating(0);
      setEditComment("");
      queryClient.invalidateQueries(["mealReviews", id]);
      queryClient.invalidateQueries(["meal", id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update review");
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId) => {
      const response = await axiosInstance.delete(`/reviews/${reviewId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Review deleted successfully!");
      setDeleteDialogOpen(false);
      setSelectedReview(null);
      queryClient.invalidateQueries(["mealReviews", id]);
      queryClient.invalidateQueries(["meal", id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete review");
    },
  });

  const handleAddToFavorites = () => {
    if (dbUser?.status === "fraud") {
      toast.error("Your account is restricted. You cannot add favorites.");
      return;
    }
    addToFavoritesMutation.mutate();
  };

  const handleOrderNow = () => {
    if (dbUser?.status === "fraud") {
      toast.error("Your account is restricted. You cannot place orders.");
      return;
    }
    setOrderDialogOpen(true);
  };

  const handleCreateOrder = () => {
    if (!userAddress.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (orderQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    createOrderMutation.mutate({
      foodId: id,
      quantity: orderQuantity,
      userAddress: userAddress.trim(),
    });
  };

  const onSubmitReview = (data) => {
    submitReviewMutation.mutate(data);
  };

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    setValue("rating", rating);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditDialogOpen(true);
  };

  const handleDeleteReview = (review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleUpdateReview = () => {
    if (editRating < 1) {
      toast.error("Please select a rating");
      return;
    }
    if (editComment.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }
    updateReviewMutation.mutate({
      reviewId: selectedReview._id,
      data: {
        rating: editRating,
        comment: editComment.trim(),
      },
    });
  };

  const handleConfirmDelete = () => {
    if (selectedReview) {
      deleteReviewMutation.mutate(selectedReview._id);
    }
  };

  if (isLoading) return <PageLoader />;

  if (!meal) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Meal Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The meal you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/meals")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Meals
        </Button>
      </div>
    );
  }

  const formattedDate = meal.createdAt
    ? format(new Date(meal.createdAt), "MMM dd, yyyy")
    : null;

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section with Image */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={meal.foodImage || "/placeholder-food.jpg"}
          alt={meal.foodName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleAddToFavorites}
            disabled={addToFavoritesMutation.isPending}
            className={`rounded-full bg-background/80 backdrop-blur-sm hover:bg-background ${
              meal.isFavorite ? "text-red-500" : ""
            }`}
          >
            <Heart
              className={`h-5 w-5 ${meal.isFavorite ? "fill-current" : ""}`}
            />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Content Card */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Fresh
                    </Badge>
                    {formattedDate && (
                      <Badge
                        variant="outline"
                        className="gap-1 text-muted-foreground"
                      >
                        <Calendar className="h-3 w-3" />
                        Added {formattedDate}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {meal.foodName}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold text-yellow-700 dark:text-yellow-500">
                        {meal.rating > 0 ? meal.rating.toFixed(1) : "New"}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {reviews.length || meal.totalReviews || 0}{" "}
                      {(reviews.length || meal.totalReviews || 0) === 1
                        ? "review"
                        : "reviews"}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col items-start md:items-end gap-1">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-4xl font-bold text-primary">
                    ${meal.price?.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Chef Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Prepared by
                </h3>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <ChefHat className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg">{meal.chefName}</p>
                    {meal.chefExperience && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Award className="h-4 w-4 text-primary" />
                        <span>{meal.chefExperience}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPinned className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Delivery area
                    </p>
                    <p className="font-semibold">{meal.deliveryArea || ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Delivery time
                    </p>
                    <p className="font-semibold">
                      {meal.estimatedDeliveryTime || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ingredients</p>
                    <p className="font-semibold">
                      {meal.ingredients?.length || 0} items
                    </p>
                  </div>
                </div>
              </div>

              {/* speatial Ingredients */}
              {meal.ingredients && meal.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Made with fresh ingredients
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {meal.ingredients.map((ingredient, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge
                          variant="outline"
                          className="px-3 py-1.5 text-sm bg-background hover:bg-muted transition-colors"
                        >
                          {ingredient}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="sm:flex-1 gap-2 sm:h-12 text-base"
                  onClick={handleOrderNow}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Order Now - ${meal.price?.toFixed(2)}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`gap-2 sm:h-12 ${
                    meal.isFavorite
                      ? "border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950 hover:text-red-500"
                      : ""
                  }`}
                  onClick={handleAddToFavorites}
                  disabled={addToFavoritesMutation.isPending}
                >
                  <Heart
                    className={`h-5 w-5 ${meal.isFavorite ? "fill-current" : ""}`}
                  />
                  {addToFavoritesMutation.isPending
                    ? "Adding..."
                    : meal.isFavorite
                      ? "Favorited"
                      : "Add to Favorites"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <Badge variant="secondary" className="text-sm">
              {reviews.length || meal.totalReviews || 0}{" "}
              {(reviews.length || meal.totalReviews || 0) === 1
                ? "Review"
                : "Reviews"}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Review Form */}
            <Card className="lg:col-span-1 h-fit shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  {meal.isReviewed ? "Your Review" : "Write a Review"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {meal.isReviewed ? (
                  <div className="text-center py-6">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-green-500 fill-green-500" />
                    </div>
                    <p className="font-medium text-green-600 dark:text-green-400 mb-1">
                      Thanks for your review!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You've already reviewed this meal.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit(onSubmitReview)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label className="text-sm">
                        How would you rate this meal?
                      </Label>
                      <div className="flex gap-1 p-3 rounded-lg bg-muted/50 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-all hover:scale-125"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                star <= (hoverRating || selectedRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {errors.rating && (
                        <p className="text-sm text-destructive text-center">
                          {errors.rating.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comment" className="text-sm">
                        Share your experience
                      </Label>
                      <Textarea
                        id="comment"
                        placeholder="What did you love about this meal?"
                        rows={4}
                        {...register("comment")}
                        className={`resize-none ${errors.comment ? "border-destructive" : ""}`}
                      />
                      {errors.comment && (
                        <p className="text-sm text-destructive">
                          {errors.comment.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={submitReviewMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                      {submitReviewMutation.isPending
                        ? "Submitting..."
                        : "Submit Review"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={review.reviewerImage} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {review.reviewerName?.charAt(0).toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="font-semibold">
                                  {review.reviewerName}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-muted-foreground/20"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs shrink-0"
                                >
                                  {format(
                                    new Date(review.date),
                                    "MMM dd, yyyy",
                                  )}
                                </Badge>
                                {/* Show edit/delete menu only for user's own review */}
                                {user?.email === review.reviewerEmail && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleEditReview(review)}
                                        className="gap-2"
                                      >
                                        <Pencil className="h-4 w-4" />
                                        Edit Review
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeleteReview(review)
                                        }
                                        className="gap-2 text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Review
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="shadow-md border-0">
                  <CardContent className="py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-muted-foreground">
                      Be the first to share your experience with this meal!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Place Your Order
            </DialogTitle>
            <DialogDescription>
              Complete your order for {meal?.foodName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Meal Summary */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <img
                src={meal?.foodImage || "/placeholder-food.jpg"}
                alt={meal?.foodName}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{meal?.foodName}</p>
                <p className="text-primary font-bold">
                  ${meal?.price?.toFixed(2)} each
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                  disabled={orderQuantity <= 1}
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) =>
                    setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setOrderQuantity((q) => q + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea
                id="address"
                placeholder="Enter your full delivery address..."
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Order Summary */}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({orderQuantity}{" "}
                  {orderQuantity === 1 ? "item" : "items"})
                </span>
                <span className="font-medium">
                  ${(meal?.price * orderQuantity).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  ${(meal?.price * orderQuantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOrderDialogOpen(false)}
              disabled={createOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={createOrderMutation.isPending || !userAddress.trim()}
              className="gap-2"
            >
              {createOrderMutation.isPending ? (
                "Placing Order..."
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Place Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Your Review
            </DialogTitle>
            <DialogDescription>
              Update your review for {meal?.foodName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-sm">Rating</Label>
              <div className="flex gap-1 p-3 rounded-lg bg-muted/50 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    onMouseEnter={() => setEditHoverRating(star)}
                    onMouseLeave={() => setEditHoverRating(0)}
                    className="p-1 transition-all hover:scale-125"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (editHoverRating || editRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="editComment" className="text-sm">
                Your Review
              </Label>
              <Textarea
                id="editComment"
                placeholder="What did you love about this meal?"
                rows={4}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updateReviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateReview}
              disabled={
                updateReviewMutation.isPending ||
                editRating < 1 ||
                editComment.trim().length < 10
              }
              className="gap-2"
            >
              {updateReviewMutation.isPending ? (
                "Updating..."
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Update Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReviewMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteReviewMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
