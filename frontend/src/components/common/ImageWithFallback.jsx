import { useState } from "react";

function ImageWithFallback({ src, fallbackSrc, alt = "", className = "", ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const imageSrc = src && src !== failedSrc
    ? src
    : fallbackSrc !== failedSrc
      ? fallbackSrc
      : null;

  if (!imageSrc) return null;

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={() => setFailedSrc(imageSrc)}
      loading="lazy"
      className={className}
      {...props}
    />
  );
}

export default ImageWithFallback;
