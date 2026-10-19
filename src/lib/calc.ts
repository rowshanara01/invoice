import { lineTotal } from "./money";
import type { Invoice, InvoiceGroup, LineItem } from "./types";

export type ComputedLine = LineItem & {
  sl: number;
  total: number;
};

export type ComputedGroup = {
  group: InvoiceGroup;
  lines: ComputedLine[];
  startSl: number;
  endSl: number;
  subtotal: number;
  discount: number;
  net: number;
  rangeLabel: string;
};

export type ComputedInvoice = {
  groups: ComputedGroup[];
  grandTotal: number;
  /** Only groups that have items (for print) */
  printableGroups: ComputedGroup[];
};

export function computeInvoice(invoice: Invoice): ComputedInvoice {
  let sl = 1;
  const groups: ComputedGroup[] = [];

  for (const group of invoice.groups) {
    const startSl = sl;
    const lines: ComputedLine[] = group.items.map((item) => {
      const row: ComputedLine = {
        ...item,
        sl,
        total: lineTotal(item),
      };
      sl += 1;
      return row;
    });
    const endSl = lines.length ? sl - 1 : startSl - 1;
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const discount = group.discount > 0 ? group.discount : 0;
    const net = subtotal - discount;
    const rangeLabel =
      lines.length > 0
        ? lines.length === 1
          ? `SL ${startSl}`
          : `SL ${startSl}–${endSl}`
        : "";

    groups.push({
      group,
      lines,
      startSl,
      endSl,
      subtotal,
      discount,
      net,
      rangeLabel,
    });
  }

  const printableGroups = groups.filter((g) => g.lines.length > 0);
  const grandTotal = printableGroups.reduce((s, g) => s + g.net, 0);

  return { groups, grandTotal, printableGroups };
}

export function letterheadLine(profile: {
  address: string;
  phone: string;
  web: string;
}): string {
  return `${profile.address} | Phone: ${profile.phone} | Web: ${profile.web}`;
}
