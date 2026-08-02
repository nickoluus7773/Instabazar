// Mock products data for vendor store pages
// This mirrors the Product model fields: productTitle, productDescription, productPrice, productImage
// Each product belongs to a vendor via store_slug

export const vendorProducts = {
  "urban-picks": {
    category: "Fashion & Accessories",
    products: [
      {
        id: 1,
        productTitle: "Handwoven Macramé Wall Hanging",
        productDescription: "Beautiful handwoven macramé wall hanging made with 100% cotton rope. Perfect for adding warmth to any room.",
        productPrice: "649.00",
        productImage: "🧶",
        productCondition: "new",
        category: "Handmade",
        createdAt: "2025-01-10T00:00:00Z",
      },
      {
        id: 2,
        productTitle: "Gold Chain Necklace",
        productDescription: "Elegant gold-plated chain necklace with adjustable length. Perfect for daily wear or special occasions.",
        productPrice: "349.00",
        productImage: "💎",
        productCondition: "new",
        category: "Jewellery",
        createdAt: "2025-01-12T00:00:00Z",
      },
      {
        id: 3,
        productTitle: "Portable Vinyl Player",
        productDescription: "Vintage-style portable vinyl record player with built-in speakers. Supports 33⅓ and 45 RPM records.",
        productPrice: "3499.00",
        productImage: "📀",
        productCondition: "new",
        category: "Electronics",
        createdAt: "2025-01-15T00:00:00Z",
      },
      {
        id: 4,
        productTitle: "Classic Novel Collection",
        productDescription: "Set of 5 classic novels in hardcover edition. Includes timeless works from renowned authors.",
        productPrice: "899.00",
        productImage: "📚",
        productCondition: "new",
        category: "Books",
        createdAt: "2025-01-08T00:00:00Z",
      },
    ],
  },
  "vintage-vibes": {
    category: "Vintage & Retro",
    products: [
      {
        id: 5,
        productTitle: "Vintage Polaroid Camera",
        productDescription: "Fully functional vintage Polaroid camera. Comes with 3 packs of film. Perfect for instant photography lovers.",
        productPrice: "2499.00",
        productImage: "📷",
        productCondition: "refurbished",
        category: "Electronics",
        createdAt: "2025-01-05T00:00:00Z",
      },
      {
        id: 6,
        productTitle: "Retro Denim Jacket",
        productDescription: "Classic 90s-style denim jacket in excellent condition. Authentic vintage wash with slight distressing.",
        productPrice: "1899.00",
        productImage: "🧥",
        productCondition: "used",
        category: "Fashion",
        createdAt: "2025-01-06T00:00:00Z",
      },
      {
        id: 7,
        productTitle: "Vinyl Record Collection",
        productDescription: "Collection of 10 classic rock vinyl records from the 70s and 80s. All in good playing condition.",
        productPrice: "2999.00",
        productImage: "🎵",
        productCondition: "used",
        category: "Music",
        createdAt: "2025-01-07T00:00:00Z",
      },
    ],
  },
  "thrift-queen": {
    category: "Thrift & Pre-loved",
    products: [
      {
        id: 8,
        productTitle: "Classic Novel Collection",
        productDescription: "Beautifully preserved set of 5 classic novels. Perfect for book lovers and collectors.",
        productPrice: "899.00",
        productImage: "📚",
        productCondition: "used",
        category: "Books",
        createdAt: "2025-01-03T00:00:00Z",
      },
      {
        id: 9,
        productTitle: "Vintage Silk Scarf",
        productDescription: "Authentic vintage silk scarf with hand-rolled edges. Beautiful floral pattern in rich jewel tones.",
        productPrice: "499.00",
        productImage: "🧣",
        productCondition: "used",
        category: "Fashion",
        createdAt: "2025-01-04T00:00:00Z",
      },
      {
        id: 10,
        productTitle: "Antique Brass Lamp",
        productDescription: "Beautiful antique brass table lamp with original glass shade. Fully rewired and working.",
        productPrice: "1299.00",
        productImage: "🪔",
        productCondition: "refurbished",
        category: "Home Decor",
        createdAt: "2025-01-05T00:00:00Z",
      },
      {
        id: 11,
        productTitle: "Leather Crossbody Bag",
        productDescription: "Genuine leather crossbody bag in cognac brown. Minimal signs of wear, great condition.",
        productPrice: "1599.00",
        productImage: "👝",
        productCondition: "used",
        category: "Accessories",
        createdAt: "2025-01-06T00:00:00Z",
      },
      {
        id: 12,
        productTitle: "Handmade Ceramic Mug Set",
        productDescription: "Set of 4 handmade ceramic mugs in assorted earth tones. Microwave and dishwasher safe.",
        productPrice: "699.00",
        productImage: "☕",
        productCondition: "new",
        category: "Home Decor",
        createdAt: "2025-01-02T00:00:00Z",
      },
    ],
  },
};

// Get products for a given store slug
export function getVendorStoreData(slug) {
  return vendorProducts[slug] || null;
}

// Get all products across vendors (for gallery/search)
export function getAllProducts() {
  const all = [];
  Object.entries(vendorProducts).forEach(([slug, store]) => {
    store.products.forEach((p) => {
      all.push({ ...p, storeSlug: slug });
    });
  });
  return all;
}

