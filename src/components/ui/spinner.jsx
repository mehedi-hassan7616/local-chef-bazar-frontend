import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, size = "default" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
    />
  );
}

export function LoadingSpinner({ className, size = "default" }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner size={size} className={className} />
    </div>
  );
}

