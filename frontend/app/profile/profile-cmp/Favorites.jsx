"use client";
import { Heart, ShoppingBag } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

export default function Favorites() {
  // Dummy data (Replace with API later)
  const favorites = [
    {
      id: 1,
      name: "Oversized Hoodie",
      vendor: "@urbanwear",
      category: "Fashion",
      price: "₹999",
      image:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
    },
    {
      id: 2,
      name: "Wireless Headphones",
      vendor: "@techzone",
      category: "Electronics",
      price: "₹2,499",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    },
    {
      id: 3,
      name: "Premium Sneakers",
      vendor: "@shoehub",
      category: "Footwear",
      price: "₹3,299",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    },
    {
      id: 4,
      name: "Smart Watch",
      vendor: "@gadgets",
      category: "Accessories",
      price: "₹4,999",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    },
  ];

  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-20 text-center">
        <ShoppingBag size={70} className="mx-auto text-gray-300 mb-5" />

        <h2 className="text-2xl font-bold">No Favorite Products</h2>

        <p className="text-gray-500 mt-3">
          Start exploring InstaBazaar and save your favourite products here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
        {favorites.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300"
          >
            {/* Product Image */}

            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-60 object-cover"
              />

              <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition">
                <Heart fill="#ef4444" color="#ef4444" size={20} />
              </button>
            </div>

            {/* Content */}

            <div className="p-5">
              <div className="flex justify-between items-center">
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {item.category}
                </span>

                <span className="text-xl font-bold text-purple-700">
                  {item.price}
                </span>
              </div>

              <h2 className="text-xl font-bold mt-4">{item.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <FaInstagram size={16} className="text-pink-500" />

                <span>{item.vendor}</span>
              </div>

              <button className="mt-6 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white py-3 rounded-xl hover:opacity-90 transition font-semibold">
                View Product
              </button>

              <button className="mt-3 w-full border border-red-400 text-red-500 py-3 rounded-xl hover:bg-red-50 transition">
                Remove from Favorites
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
