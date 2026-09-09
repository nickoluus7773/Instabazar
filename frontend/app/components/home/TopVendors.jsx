export default function TopVendors() {
  const vendors = [
    {
      id: 1,
      name: "Urban Picks",
      username: "@urban_picks",
      products: 24,
      badge: true,
    },
    {
      id: 2,
      name: "Vintage Vibes",
      username: "@vintage_vibes",
      products: 18,
      badge: false,
    },
    {
      id: 3,
      name: "Craft Corner",
      username: "@craft_corner",
      products: 31,
      badge: true,
    },
    {
      id: 4,
      name: "Thrift Queen",
      username: "@thrift_queen",
      products: 15,
      badge: false,
    },
  ];

  return (
    <section className="bg-[#081225] max-w-8xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-[#F5AE30] text-3xl font-bold">Top Vendors</h2>
        <p className="text-gray-500 mt-2">Trusted sellers from our community</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white rounded-3xl p-6 text-center shadow-sm hover:shadow-xl transition"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-2xl font-bold text-purple-600">
              {vendor.name.charAt(0)}
            </div>

            <h3 className="mt-4 font-bold text-lg">{vendor.name}</h3>

            <p className="text-gray-500 text-sm">{vendor.username}</p>

            <p className="mt-2 text-sm text-gray-600">
              {vendor.products} Products
            </p>

          </div>
        ))}
      </div>
    </section>
  );
}
