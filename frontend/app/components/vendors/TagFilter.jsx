const TAGS = [
  { label: "All", value: "All", emoji: "" },
  { label: "Handmade", value: "Handmade", emoji: "🧶" },
  { label: "Fashion", value: "Fashion", emoji: "👗" },
  { label: "Home Decor", value: "Home Decor", emoji: "🏺" },
  { label: "Jewellery", value: "Jewellery", emoji: "💍" },
  { label: "Art", value: "Art", emoji: "🎨" },
  { label: "Food", value: "Food", emoji: "🍫" },
];

export default function TagFilter({ active, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {TAGS.map((tag) => {
        const isActive = tag.value === active;
        return (
          <button
            key={tag.value}
            onClick={() => onChange(tag.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              isActive
                ? "border-terracotta bg-terracotta/10 text-terracotta"
                : "border-black/10 bg-white text-ink/70 hover:border-terracotta/40"
            }`}
          >
            {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}
