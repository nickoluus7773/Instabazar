import Badge from "../ui/Badge";
import Button from "../ui/Button";
import SectionContainer from "../ui/SectionContainer";

export default function LegalPageTemplate({
  badge,
  title,
  intro,
  sections,
  ctaTitle = "Questions about vendor policies?",
}) {
  return (
    <>
      <SectionContainer
        padding="pt-24 pb-16 lg:pt-28 lg:pb-20"
        className="bg-gradient-to-b from-white via-slate-50/60 to-white"
      >
        <div className="mx-auto max-w-4xl">
          <Badge>{badge}</Badge>

          <h1 className="mt-8 text-5xl font-black leading-[0.95] text-slate-900 sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            {intro}
          </p>
        </div>
      </SectionContainer>

      <SectionContainer padding="py-20" className="bg-white">
        <div className="mx-auto max-w-4xl space-y-8">
          {sections.map((section) => (
            <article
              key={section.heading}
              className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 shadow-sm sm:p-10"
            >
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {section.heading}
              </h2>

              <div className="mt-5 space-y-5 text-base leading-8 text-slate-600">
                {section.body.map((paragraph, index) => (
                  <p key={`${section.heading}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer padding="py-16" className="bg-slate-50/80">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Need support?
            </p>
            <h3 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              {ctaTitle}
            </h3>
          </div>

          <Button type="button">Contact Support</Button>
        </div>
      </SectionContainer>
    </>
  );
}
