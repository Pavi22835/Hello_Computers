import { useState } from "react";
import { Package } from "lucide-react";
import { categoryIcons, getProductImageUrl } from "../../data/storeContent";

function ProductVisual({ src, alt, category, productName, className = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const categoryKey = typeof category === "string" ? category.toLowerCase() : "";
  const Icon = categoryIcons[categoryKey] || categoryIcons.default || Package;
  const fallback = getProductImageUrl(productName || alt, category);
  const imageSrc = src && src !== failedSrc
    ? src
    : fallback !== failedSrc
      ? fallback
      : null;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 ${className}`}>
      <div className="absolute h-2/3 w-2/3 rounded-full bg-blue-400/20 blur-3xl transition duration-500 group-hover:scale-125" />
      {imageSrc ? (
        <img src={imageSrc} alt={alt} onError={() => setFailedSrc(imageSrc)} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      ) : (
        <Icon size={72} strokeWidth={1.1} aria-hidden="true" className="relative text-blue-600/70 transition duration-500 group-hover:scale-110 group-hover:-rotate-3" />
      )}
    </div>
  );
}

export default ProductVisual;
