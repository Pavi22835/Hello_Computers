import { useState } from "react";
import { getCategoryImageUrl } from "../../data/storeContent";

function CategoryImage({ category, className = "" }) {
  const fallback = getCategoryImageUrl(category);
  const [failedUrl, setFailedUrl] = useState(null);
  const primary = category.imageUrl;
  const src = primary && primary !== failedUrl
    ? primary
    : fallback !== failedUrl
      ? fallback
      : null;

  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailedUrl(src)}
      className={className}
    />
  );
}

export default CategoryImage;
