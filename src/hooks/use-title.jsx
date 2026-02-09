import { useEffect } from "react";

export function useTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | LocalChefBazaar` : "LocalChefBazaar";
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
