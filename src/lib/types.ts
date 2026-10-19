export type BusinessProfile = {
  brandName: string;
  address: string;
  phone: string;
  web: string;
  docLabel: string;
  note: string;
  signerName: string;
  signerRole: string;
  footer: string;
};

export type CustomerDetails = {
  clientName: string;
  organization: string;
  contactNo: string;
  address: string;
};

export type InvoiceMeta = {
  invoiceNo: string;
  date: string;
  preparedBy: string;
};

export type LineItem = {
  id: string;
  name: string;
  brand: string;
  qty: number;
  unit: string;
  rate: number;
  /** When true, qty/rate show as "-" and total uses manualAmount */
  manual: boolean;
  manualAmount: number;
};

export type InvoiceGroup = {
  id: string;
  title: string;
  discount: number;
  items: LineItem[];
};

export type Invoice = {
  id: string;
  createdAt: string;
  updatedAt: string;
  customer: CustomerDetails;
  meta: InvoiceMeta;
  groups: InvoiceGroup[];
  /** false until invoice-details popup is completed */
  detailsDone: boolean;
};

export const DEFAULT_PROFILE: BusinessProfile = {
  brandName: "OUR VIMGANJ IT SERVICE",
  address: "Vimgonj bazar, Sherpur",
  phone: "01682-444263, 01633-762940",
  web: "www.ourvimganj.com",
  docLabel: "BILLING INVOICE",
  note: "* Condition for all products*",
  signerName: "Abu Raihan Sany",
  signerRole: "Chairman, Our Vimganj IT",
  footer: "Thank you for choosing Our Vimganj IT Service · www.ourvimganj.com",
};

export function emptyCustomer(): CustomerDetails {
  return {
    clientName: "",
    organization: "",
    contactNo: "",
    address: "",
  };
}

export function emptyLineItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    brand: "",
    qty: 1,
    unit: "",
    rate: 0,
    manual: false,
    manualAmount: 0,
  };
}

export function emptyGroup(title = ""): InvoiceGroup {
  return {
    id: crypto.randomUUID(),
    title,
    discount: 0,
    items: [],
  };
}

export function formatToday(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function createBlankInvoice(preparedBy: string): Invoice {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    customer: emptyCustomer(),
    meta: {
      invoiceNo: "",
      date: formatToday(),
      preparedBy,
    },
    groups: [emptyGroup(""), emptyGroup("")],
    detailsDone: false,
  };
}
