import { motion } from "framer-motion";
import { Star, ChefHat, Utensils, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export default function MealCard({ meal, index = 0 }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSeeDetails = () => {
    if (user) {
      navigate(`/meals/${meal._id}`);
    } else {
      navigate("/login", {
        state: { from: { pathname: `/meals/${meal._id}` } },
      });
    }
  };

  // Get first 3 ingredients for preview
  const ingredientPreview = meal.ingredients?.slice(0, 3) || [];
  const remainingCount = (meal.ingredients?.length || 0) - 3;

  // Format rating display
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
          />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="h-3.5 w-3.5 fill-yellow-400/50 text-yellow-400"
          />,
        );
      } else {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 text-muted-foreground/30" />,
        );
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={meal.foodImage || "/placeholder-food.jpg"}
            alt={meal.foodName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Price Badge */}
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground font-bold text-base px-3 py-1 shadow-lg">
            ${meal.price?.toFixed(2)}
          </Badge>

          {/* Rating on image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white font-medium text-sm">
              {meal.rating > 0 ? meal.rating.toFixed(1) : "New"}
            </span>
          </div>

          {/* Delivery area on image */}
          {meal.deliveryArea && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5 text-white" />
              <span className="text-white text-xs font-medium">
                {meal.deliveryArea}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-4 flex flex-col">
          {/* Food Name */}
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors mb-2">
            {meal.foodName}
          </h3>

          {/* Chef Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10">
              <ChefHat className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">
                {meal.chefName}
              </p>
              {meal.chefExperience && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {meal.chefExperience}
                </p>
              )}
            </div>
          </div>

          {/* Ingredients Preview */}
          {ingredientPreview.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
                <Utensils className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Ingredients</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ingredientPreview.map((ingredient, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs font-normal px-2 py-0.5"
                  >
                    {ingredient}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs font-normal px-2 py-0.5 text-muted-foreground"
                  >
                    +{remainingCount} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Star Rating Display */}
          <div className="flex items-center gap-1 mt-auto mb-3">
            {renderStars(meal.rating || 0)}
            <span className="text-xs text-muted-foreground ml-1">
              {meal.totalReviews > 0
                ? `(${meal.totalReviews} ${meal.totalReviews === 1 ? "review" : "reviews"})`
                : "(No reviews yet)"}
            </span>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleSeeDetails}
            className="w-full group-hover:bg-primary/90"
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
