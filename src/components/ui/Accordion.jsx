import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-verde-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        aria-expanded={open}
      >
        <span className="font-heading text-xl font-semibold text-verde-800">{question}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-verde-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-text-secondary font-body leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
