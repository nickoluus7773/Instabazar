import Link from "next/link";
export default function CTASection() {
  return (
    <section className="bg-[#081225] max-w-8xl mx-auto px-6 pb-20">
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-center p-14">
        <h2 className="text-4xl font-bold text-white">
          Start Selling on InstaBazaar
        </h2>

        <p className="text-white/80 mt-4 mb-10">
          Join hundreds of creators and showcase your products.
        </p>
        <Link href="/register" className="mt-8 bg-white text-purple-700 font-bold px-8 py-4 rounded-2xl">
        
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
