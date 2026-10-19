import {
  DEFAULT_PROFILE,
  type BusinessProfile,
  type Invoice,
} from "./types";

const PROFILE_KEY = "invoice-maker:profile";
const INVOICES_KEY = "invoice-maker:invoices";

export function loadProfile(): BusinessProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: BusinessProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Invoice[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function upsertInvoice(invoice: Invoice): Invoice[] {
  const list = loadInvoices();
  const next = { ...invoice, updatedAt: new Date().toISOString() };
  const idx = list.findIndex((i) => i.id === next.id);
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  saveInvoices(list);
  return list;
}

export function deleteInvoice(id: string): Invoice[] {
  const list = loadInvoices().filter((i) => i.id !== id);
  saveInvoices(list);
  return list;
}

export function getInvoice(id: string): Invoice | undefined {
  return loadInvoices().find((i) => i.id === id);
}
