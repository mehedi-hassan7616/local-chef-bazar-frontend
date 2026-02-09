import { Link, useRouteError } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-destructive/10">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">
          Oops! Something went wrong here{" "}
        </h1>
        <p className="text-muted-foreground mb-2">
          We encountered an unexpected error.
        </p>
        {error?.statusText || error?.message ? (
          <p className="text-sm text-destructive mb-6">
            {error.statusText || error.message}
          </p>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try Again for find the right path
          </Button>
          <Link to="/">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
