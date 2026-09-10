// Add downloaded vendor images to frontend/public/images/vendors/ using these filenames.
// Example: frontend/public/images/vendors/urban-picks.jpg
export const localVendorImages = {
  "urban-picks": "/images/vendors/urban-picks.jpg",
  "vintage-vibes": "/images/vendors/vintage-vibes.jpg",
  "thrift-queen": "/images/vendors/thrift-queen.jpg",
  "craft-corner": "/images/vendors/craft-corner.jpg",
};

export function getLocalVendorImage(vendor) {
  return vendor.local_image || localVendorImages[vendor.store_slug] || "";
}
