"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = {
  question: string;
  answer: string;
};

type AccordionProps = {
  items: FaqItem[];
};

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border border border-border bg-white">
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-forest transition-colors hover:bg-cream"
                onClick={() => setOpenIndex(open ? null : index)}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-forest-bright transition-transform ${open ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
            </h3>
            {open ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-5 pb-5 text-sm leading-relaxed text-ink/85"
              >
                <p>{item.answer}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
