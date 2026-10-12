import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import SectionContainer from "../ui/SectionContainer";

export default function AboutHero() {
  return (
    <SectionContainer
      padding="pt-24 pb-16 lg:pt-28 lg:pb-20"
      className="relative overflow-hidden bg-white"
    >
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl"></div>
      <div className="absolute bottom-8 right-0 h-80 w-80 rounded-full bg-pink-200/30 blur-3xl"></div>

      <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div className="relative z-10">
          <Badge>🚀 About InstaBazaar</Badge>

          <h1 className="mt-8 text-5xl font-black leading-[0.95] text-slate-900 sm:text-6xl lg:text-7xl">
            Empowering
            <span className="mt-3 block bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Instagram
            </span>
            Businesses
            <span className="mt-3 block">To Grow Online</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">
            InstaBazaar helps Instagram businesses organize products, build
            professional catalogs, manage inventory, and prepare for selling
            across multiple online marketplaces — all from one beautiful
            dashboard.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 sm:gap-5">
            <Button href="/vendors">Browse Vendors</Button>
            <Button href="/register/vendor" variant="secondary">Become a Vendor</Button>
          </div>
        </div>

        <div className="relative">
          <Card className="relative p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Vendor Dashboard
                </h3>
                <p className="mt-1 text-slate-500">Social Commerce Platform</p>
              </div>
              <Badge>Verified</Badge>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5">
              {[
                ["Products", "128"],
                ["Followers", "18.5K"],
                ["Categories", "42"],
                ["Orders", "820+"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#f5f7fb] p-5 sm:p-6">
                  <p className="text-sm text-slate-500">{label}</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                    {value}
                  </h2>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
              <h4 className="font-bold text-slate-900">Connected Platforms</h4>
              <div className="mt-5 flex flex-wrap gap-3">
                {['Instagram', 'Catalog', 'Marketplace', 'Analytics'].map((item) => (
                  <span key={item} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Card className="absolute -bottom-6 -right-6 hidden w-44 flex-col items-start px-6 py-5 shadow-xl lg:flex">
              <p className="text-sm text-slate-500">Monthly Growth</p>
              <h2 className="mt-2 text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                +28%
              </h2>
            </Card>
          </Card>
        </div>
      </div>
    </SectionContainer>
  );
}
