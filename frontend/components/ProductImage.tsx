"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/api";

interface ProductImageProps {
  src: string;
  alt: string;
  /** Use fill layout (requires parent to have position:relative + dimensions) */
  fill?: boolean;
  /** Explicit width (required if fill=false) */
  width?: number;
  /** Explicit height (required if fill=false) */
  height?: number;
  /** Responsive sizes attribute — critical for performance with fill */
  sizes?: string;
  /** Preload the image (use for above-the-fold images) */
  priority?: boolean;
  /** Additional class names */
  className?: string;
  /** Loading behavior */
  loading?: "lazy" | "eager";
  /** Callback when image loads */
  onLoad?: () => void;
  /** Optional style overrides */
  style?: React.CSSProperties;
}

/**
 * ProductImage — unified product image component.
 *
 * - Resolves image URLs via `getProductImageUrl()` (handles /uploads/, data URLs, absolute URLs)
 * - Uses Next.js `<Image>` for optimizable URLs (automatic WebP/AVIF, resizing, lazy loading)
 * - Falls back to `<img>` for data: URLs (which can't be optimized by Next.js)
 * - Shows a CSS skeleton placeholder while the image loads
 * - Supports `priority` for above-the-fold images (hero carousel first slide)
 */
export default function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className = "",
  loading = "lazy",
  onLoad,
  style,
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const resolvedSrc = getProductImageUrl(src || "");
  const isDataUrl = resolvedSrc.startsWith("data:");
  const isProxyUrl = resolvedSrc.startsWith("/api/");
  const showSkeleton = !loaded && !priority;

  // ─── Data URL or proxy URL fallback — can't be optimized by Next.js ───
  if (isDataUrl || isProxyUrl) {
    return (
      <div className={`relative ${fill ? "w-full h-full" : ""}`}>
        {showSkeleton && (
          <div className="absolute inset-0 bg-[var(--bg-tertiary)] img-skeleton" />
        )}
        <img
          src={resolvedSrc}
          alt={alt}
          loading={loading}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          onLoad={handleLoad}
          className={`transition-opacity duration-500 ${className} ${
            loaded || priority ? "opacity-100" : "opacity-0"
          }`}
          style={{
            ...(fill ? { objectFit: "cover", width: "100%", height: "100%" } : {}),
            ...style,
          }}
        />
      </div>
    );
  }

  // ─── Next.js optimized image ───
  return (
    <div className={`relative ${fill ? "w-full h-full" : ""}`}>
      {showSkeleton && (
        <div className="absolute inset-0 bg-[var(--bg-tertiary)] img-skeleton" />
      )}
      <Image
        src={resolvedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={
          sizes ||
          (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)
        }
        priority={priority}
        loading={priority ? undefined : loading}
        onLoad={handleLoad}
        className={`transition-opacity duration-500 ${className} ${
          loaded || priority ? "opacity-100" : "opacity-0"
        }`}
        style={style}
      />
    </div>
  );
}
