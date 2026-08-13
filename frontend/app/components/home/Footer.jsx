import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#081225] text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-purple-600">InstaBazaar</h3>

            <p className="text-gray-400 mt-3">
              Discover unique products from real creators.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3">Marketplace</h4>

            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/gallery">Gallery</Link>
              </li>

              <li>
                <Link href="/vendors">Vendors</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3">Company</h4>

            <ul className="space-y-2 text-gray-500">
              <li>
                <Link href="/about">About</Link>
              </li>

              <li>
                <Link href="/reviews">Reviews</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3">Legal</h4>

            <ul className="space-y-2 text-gray-500">
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-and-conditions">Terms & Conditions</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 text-center text-gray-500">
          © 2026 InstaBazaar. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
