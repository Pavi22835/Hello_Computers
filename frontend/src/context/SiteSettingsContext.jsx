import { useEffect, useState } from "react";
import { SiteSettingsContext } from "./site-settings.context";
import { getStoreSettings } from "../services/settings.service";

const emptySettings = {
  phone: null,
  whatsappNumber: null,
  email: null,
  address: null,
  hours: null,
  shippingFee: null,
  freeShippingThreshold: null,
};

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getStoreSettings()
      .then((result) => {
        if (active) {
          setSettings(result);
          setError("");
        }
      })
      .catch((issue) => {
        if (active) setError(issue.response?.data?.message || "Store settings could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
