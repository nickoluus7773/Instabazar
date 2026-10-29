/**
 * Global Image Helper for InstaBazaar
 * Resolves images from frontend/public/images/ locally or external URLs globally.
 */

export function getImageUrl(image, fallback = "/images/heroimg1.png") {
  if (!image) return fallback;

  if (typeof image === "object" && image.url) {
    image = image.url;
  }

  if (typeof image !== "string") return fallback;

  image = image.trim();
  if (!image) return fallback;

  // Blob or Data URLs (client-side previews)
  if (image.startsWith("blob:") || image.startsWith("data:")) {
    return image;
  }

  // Already a local path like "/images/xyz.jpg"
  if (image.startsWith("/images/")) {
    return image;
  }
  if (image.startsWith("images/")) {
    return `/${image}`;
  }

  // Django media paths or product paths: /media/products/xxx.jpg or /products/xxx.jpg
  if (
    image.includes("/products/") ||
    image.includes("/vendor_profiles/") ||
    image.includes("/media/")
  ) {
    const filename = image.split("/").filter(Boolean).pop();
    if (filename) {
      return `/images/${filename}`;
    }
  }

  // External full URLs that are localhost Django media
  if (image.startsWith("http://") || image.startsWith("https://")) {
    if (
      image.includes(":8000/media/") ||
      image.includes("127.0.0.1:8000") ||
      image.includes("localhost:8000")
    ) {
      const filename = image.split("/").filter(Boolean).pop();
      if (filename) {
        return `/images/${filename}`;
      }
    }
    // Genuine external URLs (e.g. Unsplash)
    return image;
  }

  // Plain filename
  const filename = image.split("/").filter(Boolean).pop();
  return filename ? `/images/${filename}` : fallback;
}

export default getImageUrl;
