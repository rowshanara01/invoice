import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteInvoice,
  loadInvoices,
  loadProfile,
  saveProfile,
} from "../lib/storage";
import { DEFAULT_PROFILE, type BusinessProfile, type Invoice } from "../lib/types";
import { computeInvoice } from "../lib/calc";
import { formatTaka } from "../lib/money";
import { Field, inputClass } from "../components/Modal";

export function HomePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile>(() => loadProfile());
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadInvoices());
  const [savedFlash, setSavedFlash] = useState(false);

  const onSaveProfile = () => {
    saveProfile(profile);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    setInvoices(deleteInvoice(id));
  };

  const onPrint = (id: string) => {
    navigate(`/invoices/${id}?print=1`);
  };

  return (
    <div className="no-print mx-auto min-h-svh max-w-5xl px-4 py-8">
      <header className="mb-8 text-left">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          Local portal
        </p>
        <h1 className="mt-1 text-3xl font-bold text-brand-deep">
          Invoice Maker
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Set your letterhead once, then create A4 invoices that stay in this
          browser. Everything is saved in local storage — no server.
        </p>
      </header>

      <section className="mb-8 rounded-lg border border-rule bg-paper p-5 text-left shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">Business letterhead</h2>
          <div className="flex items-center gap-2">
            {savedFlash && (
              <span className="text-sm text-brand">Saved</span>
            )}
            <button
              type="button"
              onClick={() => setProfile({ ...DEFAULT_PROFILE })}
              className="rounded border border-rule px-3 py-1.5 text-sm text-muted hover:border-brand hover:text-brand"
            >
              Reset defaults
            </button>
            <button
              type="button"
              onClick={onSaveProfile}
              className="rounded bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Save
            </button>
          </div>
        </div>

        <div className="grid gap-x-4 md:grid-cols-2">
          <Field label="Brand name / Title">
            <input
              className={inputClass}
              value={profile.brandName}
              onChange={(e) =>
                setProfile({ ...profile, brandName: e.target.value })
              }
            />
          </Field>
          <Field label="Document label">
            <input
              className={inputClass}
              value={profile.docLabel}
              onChange={(e) =>
                setProfile({ ...profile, docLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Address">
            <input
              className={inputClass}
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputClass}
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </Field>
          <Field label="Web">
            <input
              className={inputClass}
              value={profile.web}
              onChange={(e) => setProfile({ ...profile, web: e.target.value })}
            />
          </Field>
          <Field label="Note">
            <input
              className={inputClass}
              value={profile.note}
              onChange={(e) =>
                setProfile({ ...profile, note: e.target.value })
              }
            />
          </Field>
          <Field label="Authorized signer name">
            <input
              className={inputClass}
              value={profile.signerName}
              onChange={(e) =>
                setProfile({ ...profile, signerName: e.target.value })
              }
            />
          </Field>
          <Field label="Signer role">
            <input
              className={inputClass}
              value={profile.signerRole}
              onChange={(e) =>
                setProfile({ ...profile, signerRole: e.target.value })
              }
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Footer">
              <input
                className={inputClass}
                value={profile.footer}
                onChange={(e) =>
                  setProfile({ ...profile, footer: e.target.value })
                }
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-rule bg-paper p-5 text-left shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">Invoices</h2>
          <Link
            to="/invoices/new"
            className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Create Invoice
          </Link>
        </div>

        {invoices.length === 0 ? (
          <p className="text-sm text-muted">
            No invoices yet. Create one to get started.
          </p>
        ) : (
          <ul className="divide-y divide-rule">
            {invoices.map((inv) => {
              const total = computeInvoice(inv).grandTotal;
              return (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <div className="font-semibold text-ink">
                      {inv.customer.clientName || "Untitled customer"}
                    </div>
                    <div className="text-sm text-muted">
                      {inv.meta.invoiceNo || "No invoice #"} · {inv.meta.date} ·{" "}
                      {formatTaka(total)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="rounded border border-rule px-3 py-1.5 text-sm hover:border-brand hover:text-brand"
                    >
                      Open / Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onPrint(inv.id)}
                      className="rounded border border-rule px-3 py-1.5 text-sm hover:border-brand hover:text-brand"
                    >
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(inv.id)}
                      className="rounded border border-rule px-3 py-1.5 text-sm text-red-700 hover:border-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
