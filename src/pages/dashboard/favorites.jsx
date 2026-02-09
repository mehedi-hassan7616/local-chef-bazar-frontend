import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Heart, Trash2, ChefHat } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";

export default function FavoritesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.email],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/favorites");
      return data.favorites || data || [];
    },
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: async (favoriteId) => {
      await axiosInstance.delete(`/favorites/${favoriteId}`);
    },
    onSuccess: () => {
      toast.success("Meal removed from favorites!");
      queryClient.invalidateQueries(["favorites"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to remove from favorites",
      );
    },
  });

  const handleDelete = async (favoriteId) => {
    const result = await Swal.fire({
      title: "Remove from Favorites?",
      text: "This meal will be removed from your favorites list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove it!",
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(favoriteId);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">Favorite Meals</h1>
        <p className="text-muted-foreground">Your saved favorite meals</p>
      </motion.div>

      {favorites.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meal Name</TableHead>
                      <TableHead>Chef</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {favorites.map((favorite) => (
                      <TableRow key={favorite._id}>
                        <TableCell className="font-medium">
                          {favorite.mealName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ChefHat className="h-4 w-4 text-primary" />
                            {favorite.chefName}
                          </div>
                        </TableCell>
                        <TableCell>${favorite.price}</TableCell>
                        <TableCell>
                          {format(new Date(favorite.addedTime), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(favorite._id)}
                            disabled={deleteMutation.isPending}
                            className="gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
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
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground">
              Add meals to your favorites to see them here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
