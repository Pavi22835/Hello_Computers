import { useState } from "react";
import { Package } from "lucide-react";

function ProductGallery({ product }) {
  const images = [
    product?.image,
    ...(product?.images || []),
  ].filter(Boolean);

  const [activeImage, setActiveImage] = useState(
    images[0] || null
  );

  if (!images.length) {
    return (
      <div className="flex min-h-[450px] items-center justify-center rounded-2xl bg-[var(--surface)]">
        <Package
          size={100}
          strokeWidth={1}
          className="text-slate-300"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex min-h-[450px] items-center justify-center rounded-2xl bg-[var(--surface)] p-10">
        <img
          src={activeImage}
          alt={product?.name || "Product"}
          className="max-h-[420px] w-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(image)}
              className={`h-20 w-20 shrink-0 rounded-xl border p-2 ${
                activeImage === image
                  ? "border-[var(--navy)]"
                  : "border-[var(--line)]"
              }`}
            >
              <img
                src={image}
                alt={`${product?.name} ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;