import { useState } from "react";

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.question}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-lg font-semibold text-slate-900">{item.question}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <p className="mt-4 text-base leading-7 text-slate-600">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
