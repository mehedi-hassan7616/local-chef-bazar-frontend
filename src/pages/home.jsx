import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChefHat,
  Truck,
  Shield,
  Star,
  Clock,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MealCard from "@/components/shared/meal-card";
import ReviewCard from "@/components/shared/review-card";
import { PageLoader } from "@/components/ui/loading";
import axiosInstance from "@/lib/axios";

export default function HomePage() {
  // Fetch daily meals (6 items)
  const { data: meals = [], isLoading: mealsLoading } = useQuery({
    queryKey: ["dailyMeals"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/meals?limit=6");
      return data.meals || data || [];
    },
  });

  // Fetch customer reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["customerReviews"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/reviews?limit=6");
      return data.reviews || data || [];
    },
  });

  const features = [
    {
      icon: ChefHat,
      title: "Local Home Chefs",
      description:
        "Discover talented cooks in your neighborhood serving authentic homemade dishes.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "Get your freshly prepared meals delivered right to your doorstep.",
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description:
        "All our chefs are verified and meals are prepared with high hygiene standards.",
    },
    {
      icon: Star,
      title: "Rated & Reviewed",
      description:
        "Read honest reviews from customers before ordering your favorite meals.",
    },
  ];

  const stats = [
    { value: "500+", label: "Active Chefs", icon: ChefHat },
    { value: "10K+", label: "Happy Customers", icon: Users },
    { value: "50K+", label: "Meals Delivered", icon: UtensilsCrossed },
    { value: "30 min", label: "Avg. Delivery", icon: Clock },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                <ChefHat className="h-4 w-4" />
                Homemade with Love
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              >
                Discover <span className="text-primary">Delicious</span>{" "}
                Home-Cooked Meals
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground max-w-lg"
              >
                Connect with local home chefs and enjoy fresh, authentic meals
                delivered straight to your door. Experience the taste of home,
                every day.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/meals">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Explore Meals
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                  >
                    <ChefHat className="h-4 w-4" />
                    Become a Chef
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=500&fit=crop"
                  alt="Delicious homemade food"
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-4 -right-4 md:bottom-8 md:-right-8 bg-card p-4 rounded-xl shadow-xl border z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <Star className="h-5 w-5 text-green-500 fill-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">4.9 Rating</p>
                    <p className="text-xs text-muted-foreground">
                      2000+ Reviews
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Meals Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Today's <span className="text-primary">Special</span> Meals
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Freshly prepared meals by our talented local chefs. Order now and
              enjoy the authentic taste of homemade food.
            </p>
          </motion.div>

          {mealsLoading ? (
            <PageLoader />
          ) : meals.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.slice(0, 6).map((meal, index) => (
                  <MealCard key={meal._id} meal={meal} index={index} />
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-10"
              >
                <Link to="/meals">
                  <Button size="lg" variant="outline" className="gap-2">
                    View All Meals
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No meals available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-primary">LocalChefBazaar</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We bring you the best homemade food experience with quality,
              convenience, and community at the heart of everything we do.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our <span className="text-primary">Customers</span> Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real reviews from real food lovers who experienced the magic of
              home-cooked meals through LocalChefBazaar.
            </p>
          </motion.div>

          {reviewsLoading ? (
            <PageLoader />
          ) : reviews.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, index) => (
                <ReviewCard key={review._id} review={review} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <ChefHat className="h-12 w-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Share Your Culinary Skills?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Join our community of home chefs and start earning from your
              kitchen. No restaurant needed – just your passion for cooking!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 w-full sm:w-auto"
                >
                  <ChefHat className="h-4 w-4" />
                  Start as a Chef
                </Button>
              </Link>
              <Link to="/meals">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 w-full sm:w-auto bg-transparent border-primary-foreground hover:bg-primary-foreground/10"
                >
                  Explore Meals
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
