import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MealCard from "@/components/shared/meal-card";
import { PageLoader } from "@/components/ui/loading";
import axiosInstance from "@/lib/axios";

export default function MealsPage() {
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch meals with pagination and sorting
  const { data, isLoading, isError } = useQuery({
    queryKey: ["meals", page, sortOrder, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (sortOrder) {
        params.append("sort", "price");
        params.append("order", sortOrder);
      }

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const { data } = await axiosInstance.get(`/meals?${params.toString()}`);
      return data;
    },
  });

  const meals = data?.meals || data || [];
  const totalPages = data?.totalPages || Math.ceil((data?.total || 0) / limit) || 1;
  const totalMeals = data?.total || meals.length;

  const handleSortChange = (value) => {
    setSortOrder(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 via-background to-primary/5 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Our <span className="text-primary">Delicious</span> Meals
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse through our collection of fresh, homemade meals prepared by
              talented local chefs. Find your perfect dish today!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-6 border-b bg-background sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search meals or chef..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Sort by Price:
              </span>
              <Select value={sortOrder} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select order">
                    {sortOrder === "asc" && (
                      <span className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4" /> Low to High
                      </span>
                    )}
                    {sortOrder === "desc" && (
                      <span className="flex items-center gap-2">
                        <SortDesc className="h-4 w-4" /> High to Low
                      </span>
                    )}
                    {!sortOrder && "Select order"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    <span className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" /> Low to High
                    </span>
                  </SelectItem>
                  <SelectItem value="desc">
                    <span className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" /> High to Low
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {sortOrder && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder("")}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Meals Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <div className="text-center py-16">
              <UtensilsCrossed className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
              <p className="text-muted-foreground">Failed to load meals. Please try again.</p>
            </div>
          ) : meals.length > 0 ? (
            <>
              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} -{" "}
                  {Math.min(page * limit, totalMeals)} of {totalMeals} meals
                </p>
              </div>

              {/* Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {meals.map((meal, index) => (
                  <MealCard key={meal._id} meal={meal} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 mt-10"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => setPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <UtensilsCrossed className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No meals found</h3>
              <p className="text-muted-foreground mb-4">
                {debouncedSearch
                  ? "Try adjusting your search terms"
                  : "No meals are available at the moment"}
              </p>
              {debouncedSearch && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
