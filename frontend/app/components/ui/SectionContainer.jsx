export default function SectionContainer({
  children,
  className = "",
  padding = "py-24",
}) {
  return (
    <section className={`${padding} ${className}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}