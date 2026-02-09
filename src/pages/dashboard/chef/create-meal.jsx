import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  X,
  Upload,
  ChefHat,
  ImagePlus,
  Clock,
  DollarSign,
  UtensilsCrossed,
  User,
  Mail,
  Hash,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";

const mealSchema = z.object({
  foodName: z.string().min(3, "Food name must be at least 3 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  estimatedDeliveryTime: z
    .string()
    .min(1, "Estimated delivery time is required"),
  chefExperience: z.string().min(5, "Please describe your experience"),
});

export default function CreateMealPage() {
  const navigate = useNavigate();
  const { user, dbUser } = useAuth();
  const [ingredients, setIngredients] = useState(["rice", "chicken", "spices"]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      foodName: "Chicken Biryani",
      price: 12.99,
      estimatedDeliveryTime: "30-45 minutes",
      deliveryArea: "Within 15 km",
      chefExperience: "5 years of experience in Bengali cuisine",
    },
  });

  const uploadToImageBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return {
      imageUrl: data.data.display_url,
      deleteUrl: data.data.delete_url,
    };
  };

  const createMealMutation = useMutation({
    mutationFn: async (mealData) => {
      let foodImage = null;

      if (imageFile) {
        const uploadResult = await uploadToImageBB(imageFile);
        foodImage = uploadResult.imageUrl;
      }

      const { data } = await axiosInstance.post("/meals", {
        ...mealData,
        foodImage,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Meal created successfully!");
      reset();
      setIngredients([]);
      setImageFile(null);
      setImagePreview("");
      navigate("/dashboard/my-meals");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create meal");
    },
  });

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview("");
    // Reset the file input
    const fileInput = document.getElementById("foodImage");
    if (fileInput) fileInput.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    if (dbUser?.status === "fraud") {
      toast.error("Your account is restricted. You cannot create meals.");
      return;
    }

    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    // Only send necessary fields - backend auto-fills chefId, chefName, chefEmail, rating, createdAt
    const mealData = {
      foodName: data.foodName,
      price: parseFloat(data.price),
      ingredients,
      estimatedDeliveryTime: data.estimatedDeliveryTime,
      deliveryArea: data.deliveryArea,
      chefExperience: data.chefExperience,
    };

    createMealMutation.mutate(mealData);
  };

  // Check if user is chef
  if (dbUser?.role !== "chef") {
    return (
      <div className="text-center py-16">
        <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Chef Access Required</h2>
        <p className="text-muted-foreground">
          You need to be a verified chef to create meals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-xl bg-primary/10">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Create New Meal</h1>
          <p className="text-muted-foreground">
            Add a new delicious meal to your menu
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Info Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Food Name */}
                <div className="space-y-2">
                  <Label htmlFor="foodName">Food Name *</Label>
                  <Input
                    id="foodName"
                    placeholder="e.g., Grilled Chicken Salad"
                    {...register("foodName")}
                    className={errors.foodName ? "border-destructive" : ""}
                  />
                  {errors.foodName && (
                    <p className="text-sm text-destructive">
                      {errors.foodName.message}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="12.99"
                        {...register("price")}
                        className={`pl-9 ${errors.price ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-destructive">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                  //delevery area
                  <div className="space-y-2">
                    <Label htmlFor="deliveryArea">Delivery area</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="deliveryArea"
                        placeholder=" Within 15 km"
                        {...register("deliveryArea")}
                        className={`pl-9 ${errors.deliveryArea ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.deliveryArea && (
                      <p className="text-sm text-destructive">
                        {errors.deliveryArea.message}
                      </p>
                    )}
                  </div>
                  {/* Estimated Delivery Time */}
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDeliveryTime">
                      Delivery Time *
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="estimatedDeliveryTime"
                        placeholder="30 minutes"
                        {...register("estimatedDeliveryTime")}
                        className={`pl-9 ${errors.estimatedDeliveryTime ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.estimatedDeliveryTime && (
                      <p className="text-sm text-destructive">
                        {errors.estimatedDeliveryTime.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type an ingredient and press Enter"
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
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {ingredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-muted/50 min-h-[80px]">
                    {ingredients.map((ingredient, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 py-1.5 px-3 text-sm bg-background"
                      >
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 rounded-lg border border-dashed text-muted-foreground">
                    <p className="text-sm">
                      Add at least one ingredient to your meal
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chef Experience Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Chef's Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="chefExperience"
                  placeholder="e.g., 5 years of experience in Mediterranean cuisine with expertise in healthy salads and grilled dishes..."
                  rows={4}
                  {...register("chefExperience")}
                  className={errors.chefExperience ? "border-destructive" : ""}
                />
                {errors.chefExperience && (
                  <p className="text-sm text-destructive mt-2">
                    {errors.chefExperience.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Image & Chef Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Food Image Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-primary" />
                  Food Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!imagePreview ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("foodImage").click()}
                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                        <ImagePlus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          PNG, JPG, WEBP (max 10MB)
                        </p>
                      </div>
                    </div>
                    <Input
                      id="foodImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full aspect-square object-cover rounded-xl border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          document.getElementById("foodImage").click()
                        }
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleClearImage}
                      >
                        Remove
                      </Button>
                    </div>
                    <Input
                      id="foodImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chef Info Card */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Chef Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Name</span>
                  </div>
                  <p className="font-medium pl-6">
                    {user?.displayName || dbUser?.name || "Not available"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium pl-6 text-sm break-all">
                    {user?.email || "Not available"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>Chef ID</span>
                  </div>
                  <p className="font-medium pl-6 text-sm font-mono">
                    {dbUser?.chefId || "Not available"}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground pt-2 border-t">
                  This information is auto-filled from your profile
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end pt-4 border-t"
        >
          <Button
            type="submit"
            size="lg"
            className="gap-2 min-w-[200px]"
            disabled={createMealMutation.isPending}
          >
            {createMealMutation.isPending ? (
              <>
                <span className="animate-spin">⏳</span>
                Creating Meal...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Create Meal
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
