import { useContext } from "react";
import { SiteSettingsContext } from "../context/site-settings.context";

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error("useSiteSettings must be used inside SiteSettingsProvider");
  return context;
}
