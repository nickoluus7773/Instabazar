export default function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      name: "Riya Patel",
      review:
        "Found amazing handmade gifts that I couldn't find anywhere else.",
    },
    {
      id: 2,
      name: "Aarav Shah",
      review:
        "Love the concept. Directly connecting with Instagram sellers is super convenient.",
    },
    {
      id: 3,
      name: "Priya Mehta",
      review:
        "The platform feels clean and discovering small creators is really fun.",
    },
  ];

  return (
    <section className="bg-[#081225] max-w-8xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-[#F5AE30] text-3xl font-bold">What People Say</h2>
        <p className="text-gray-500 mt-2">Reviews from our growing community</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition"
          >

            <p className="text-gray-600 italic">"{review.review}"</p>

            <h4 className="text-[#F5AE30] font-bold mt-4">{review.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}
