'use client';

import { Download } from 'lucide-react';

export default function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 bg-charcoal text-cream px-6 py-3 text-xs tracking-[0.25em] uppercase hover:bg-bronze transition-colors"
    >
      <Download size={16} />
      Download / Print Receipt
    </button>
  );
}
