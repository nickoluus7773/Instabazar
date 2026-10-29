import { getImageUrl } from "@/lib/imageHelper";

// Add downloaded vendor images to frontend/public/images/vendors/ using these filenames.
// Example: frontend/public/images/vendors/urban-picks.jpg
export const localVendorImages = {
  "boho-collective": "/images/vendor_boho.jpg",
  "heritage-craftsmen": "/images/vendor_heritage.jpg",
  "scuderia-motorsport": "/images/vendor_scuderia.jpg",
  "atelier-de-luxe": "/images/vendor_advance.jpg",
  "district-streetwear": "/images/vendor_standard.jpg",
  "earth-and-thread": "/images/vendor_free.jpg",
  "dev_sales": "/images/vendor_standard.jpg",
  "urban-picks": "/images/vendor_standard.jpg",
  "vintage-vibes": "/images/vendor_boho.jpg",
  "thrift-queen": "/images/vendor_free.jpg",
  "craft-corner": "/images/vendor_heritage.jpg",
};

export function getLocalVendorImage(vendor) {
  if (!vendor) return "";
  if (vendor.logo_url) return getImageUrl(vendor.logo_url);
  if (vendor.profile_image) return getImageUrl(vendor.profile_image);
  if (vendor.local_image) return getImageUrl(vendor.local_image);
  return localVendorImages[vendor.store_slug] || "";
}
