import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "../lib/commerce";

/** Logs a page_view on every public route change (admin routes are skipped). */
export function RouteTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    void trackEvent("page_view", pathname);
  }, [pathname]);
  return null;
}
