import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function ReviewCard({ review, index = 0 }) {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Unknown date";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <Quote className="h-8 w-8 text-primary/20 mb-4" />
          
          <p className="text-muted-foreground mb-4 line-clamp-3">
            "{review.comment}"
          </p>

          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewerImage} alt={review.reviewerName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {review.reviewerName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{review.reviewerName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
