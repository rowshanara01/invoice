import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InvoiceSheet } from "../components/InvoiceSheet";
import { Field, Modal, inputClass } from "../components/Modal";
import { createBlankInvoice, emptyGroup, emptyLineItem, type Invoice, type LineItem } from "../lib/types";
import { getInvoice, loadProfile, upsertInvoice } from "../lib/storage";
import { formatQty, formatRate, formatTaka, lineTotal } from "../lib/money";

type Step = "customer" | "details" | "editor";

export function InvoiceEditorPage() {
    const { id } = useParams();
    const isNew = !id || id === "new";
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const wantPrint = searchParams.get("print") === "1";

    const profile = loadProfile();

    const [invoice, setInvoice] = useState<Invoice | null>(() => {
        if (isNew) return createBlankInvoice(loadProfile().signerName);
        return getInvoice(id) ?? null;
    });
    const [step, setStep] = useState<Step>(() => {
        if (isNew) return "customer";
        const existing = id ? getInvoice(id) : undefined;
        if (!existing) return "customer";
        if (!existing.detailsDone) return "details";
        return "editor";
    });
    const [editCustomerOpen, setEditCustomerOpen] = useState(false);
    const [editMetaOpen, setEditMetaOpen] = useState(false);

    useEffect(() => {
        if (wantPrint && invoice && step === "editor") {
            const t = window.setTimeout(() => window.print(), 350);
            return () => window.clearTimeout(t);
        }
    }, [wantPrint, invoice, step]);

    const persist = (next: Invoice) => {
        const list = upsertInvoice(next);
        return list.find((i) => i.id === next.id) ?? next;
    };

    if (!invoice) {
        return (
            <div className="no-print p-8 text-center text-muted">
                Invoice not found.{" "}
                <Link to="/" className="text-brand underline">
                    Back home
                </Link>
            </div>
        );
    }

    const onCustomerNext = (customer: Invoice["customer"]) => {
        const next = { ...invoice, customer };
        const saved = persist(next);
        setInvoice(saved);
        const fromEditor = editCustomerOpen || step === "editor";
        if (isNew || window.location.hash.includes("/new")) {
            navigate(`/invoices/${saved.id}`, { replace: true });
        }
        setEditCustomerOpen(false);
        if (!fromEditor) setStep("details");
    };

    const onDetailsNext = (meta: Invoice["meta"]) => {
        const next = { ...invoice, meta, detailsDone: true };
        setInvoice(persist(next));
        setEditMetaOpen(false);
        setStep("editor");
    };

    const updateInvoice = (fn: (inv: Invoice) => Invoice) => {
        setInvoice((prev) => {
            if (!prev) return prev;
            return persist(fn(prev));
        });
    };

    return (
        <div className="min-h-svh">
            {step === "customer" && (
                <CustomerModal initial={invoice.customer} onNext={onCustomerNext} onCancel={() => navigate("/")} />
            )}
            {step === "details" && (
                <DetailsModal initial={invoice.meta} onNext={onDetailsNext} onBack={() => setStep("customer")} />
            )}
            {editCustomerOpen && (
                <CustomerModal
                    initial={invoice.customer}
                    onNext={onCustomerNext}
                    onCancel={() => setEditCustomerOpen(false)}
                />
            )}
            {editMetaOpen && (
                <DetailsModal initial={invoice.meta} onNext={onDetailsNext} onBack={() => setEditMetaOpen(false)} />
            )}

            {step === "editor" && (
                <div className="lg:grid lg:grid-cols-[minmax(320px,420px)_1fr] lg:gap-4 lg:p-4">
                    <aside className="no-print max-h-svh overflow-y-auto border-r border-rule bg-paper p-4">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <Link to="/" className="rounded border border-rule px-3 py-1.5 text-sm hover:border-brand">
                                ← Home
                            </Link>
                            <button
                                type="button"
                                onClick={() => setEditCustomerOpen(true)}
                                className="rounded border border-rule px-3 py-1.5 text-sm"
                            >
                                Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditMetaOpen(true)}
                                className="rounded border border-rule px-3 py-1.5 text-sm"
                            >
                                Invoice details
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="rounded bg-brand px-3 py-1.5 text-sm font-semibold text-white"
                            >
                                Print
                            </button>
                        </div>

                        <p className="mb-2 text-xs text-muted">
                            Autosaved to this browser · {invoice.customer.clientName || "…"}
                        </p>

                        <ItemEditor invoice={invoice} onChange={updateInvoice} />
                    </aside>

                    <div className="overflow-x-auto bg-desk p-4">
                        <InvoiceSheet profile={profile} invoice={invoice} />
                    </div>
                </div>
            )}
        </div>
    );
}

function CustomerModal({
    initial,
    onNext,
    onCancel,
}: {
    initial: Invoice["customer"];
    onNext: (c: Invoice["customer"]) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState(initial);
    return (
        <Modal
            title="Customer Details"
            onClose={onCancel}
            footer={
                <>
                    <button type="button" onClick={onCancel} className="rounded border border-rule px-4 py-2 text-sm">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onNext(form)}
                        className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white"
                    >
                        Next
                    </button>
                </>
            }
        >
            <Field label="Client Name">
                <input
                    className={inputClass}
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    autoFocus
                />
            </Field>
            <Field label="Organization">
                <input
                    className={inputClass}
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                />
            </Field>
            <Field label="Contact No">
                <input
                    className={inputClass}
                    value={form.contactNo}
                    onChange={(e) => setForm({ ...form, contactNo: e.target.value })}
                />
            </Field>
            <Field label="Address">
                <input
                    className={inputClass}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
            </Field>
        </Modal>
    );
}

function DetailsModal({
    initial,
    onNext,
    onBack,
}: {
    initial: Invoice["meta"];
    onNext: (m: Invoice["meta"]) => void;
    onBack: () => void;
}) {
    const [form, setForm] = useState(initial);
    return (
        <Modal
            title="Invoice Details"
            footer={
                <>
                    <button type="button" onClick={onBack} className="rounded border border-rule px-4 py-2 text-sm">
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={() => onNext(form)}
                        className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white"
                    >
                        Next
                    </button>
                </>
            }
        >
            <Field label="Invoice No">
                <input
                    className={inputClass}
                    value={form.invoiceNo}
                    onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                    placeholder="OV-IT-S-001 & OV-IT-S-002"
                    autoFocus
                />
            </Field>
            <Field label="Date (DD-MM-YYYY)">
                <input
                    className={inputClass}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
            </Field>
            <Field label="Prepared By">
                <input
                    className={inputClass}
                    value={form.preparedBy}
                    onChange={(e) => setForm({ ...form, preparedBy: e.target.value })}
                />
            </Field>
        </Modal>
    );
}

type ItemModalState = { mode: "add"; groupIndex: number } | { mode: "edit"; groupIndex: number; item: LineItem };

function ItemEditor({ invoice, onChange }: { invoice: Invoice; onChange: (fn: (inv: Invoice) => Invoice) => void }) {
    const [itemModal, setItemModal] = useState<ItemModalState | null>(null);

    const addSection = () => {
        onChange((inv) => ({
            ...inv,
            groups: [...inv.groups, emptyGroup("")],
        }));
    };

    const updateGroup = (groupIndex: number, patch: Partial<Invoice["groups"][number]>) => {
        onChange((inv) => {
            const groups = inv.groups.map((g, i) => (i === groupIndex ? { ...g, ...patch } : g));
            return { ...inv, groups };
        });
    };

    const removeItem = (groupIndex: number, itemId: string) => {
        onChange((inv) => {
            const groups = inv.groups.map((g, i) =>
                i === groupIndex ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g,
            );
            return { ...inv, groups };
        });
    };

    const removeGroup = (groupIndex: number) => {
        if (invoice.groups.length <= 1) return;
        onChange((inv) => ({
            ...inv,
            groups: inv.groups.filter((_, i) => i !== groupIndex),
        }));
    };

    const submitItem = (groupIndex: number, item: LineItem, mode: "add" | "edit") => {
        onChange((inv) => {
            const groups = inv.groups.map((g, i) => {
                if (i !== groupIndex) return g;
                if (mode === "add") return { ...g, items: [...g.items, item] };
                return {
                    ...g,
                    items: g.items.map((it) => (it.id === item.id ? item : it)),
                };
            });
            return { ...inv, groups };
        });
        setItemModal(null);
    };

    const slById = new Map<string, number>();
    {
        let n = 0;
        for (const g of invoice.groups) {
            for (const item of g.items) {
                n += 1;
                slById.set(item.id, n);
            }
        }
    }

    return (
        <div className="space-y-5 text-left">
            <button
                type="button"
                onClick={() => setItemModal({ mode: "add", groupIndex: 0 })}
                className="w-full rounded bg-brand px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
                Add Item
            </button>

            {invoice.groups.map((group, gi) => (
                <section key={group.id} className="rounded border border-rule bg-paper p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-brand-deep">
                            Section {gi + 1}
                            {gi === 0 ? " (main)" : ""}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setItemModal({ mode: "add", groupIndex: gi })}
                                className="text-xs font-medium text-brand hover:underline"
                            >
                                + Item
                            </button>
                            {invoice.groups.length > 1 && (
                                <button
                                    type="button"
                                    className="text-xs text-red-700 hover:underline"
                                    onClick={() => removeGroup(gi)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mb-3 grid gap-2 sm:grid-cols-2">
                        <label className="block text-left">
                            <span className="mb-1 block text-xs font-medium text-muted">Section title</span>
                            <input
                                className={inputClass}
                                value={group.title}
                                placeholder={gi === 1 ? "Extra 4 Camera Added Cost" : "Optional"}
                                onChange={(e) => updateGroup(gi, { title: e.target.value })}
                            />
                        </label>
                        <label className="block text-left">
                            <span className="mb-1 block text-xs font-medium text-muted">Discount (৳)</span>
                            <input
                                type="number"
                                min={0}
                                className={inputClass}
                                value={group.discount || ""}
                                onChange={(e) =>
                                    updateGroup(gi, {
                                        discount: Number(e.target.value) || 0,
                                    })
                                }
                            />
                        </label>
                    </div>

                    {group.items.length === 0 ? (
                        <p className="rounded border border-dashed border-rule px-3 py-4 text-center text-xs text-muted">
                            No items yet
                        </p>
                    ) : (
                        <ul className="divide-y divide-rule rounded border border-rule">
                            {group.items.map((item) => {
                                return (
                                    <li
                                        key={item.id}
                                        className="group relative flex items-start gap-2 px-3 py-2.5 hover:bg-tint/60"
                                    >
                                        <span className="w-6 shrink-0 pt-0.5 text-xs text-muted">
                                            {slById.get(item.id)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium text-ink">
                                                {item.name || "Untitled item"}
                                            </div>
                                            <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
                                                <span>{item.brand.trim() || "-"}</span>
                                                <span>Qty {formatQty(item.qty, item.unit, item.manual)}</span>
                                                <span>{item.manual ? "Manual" : formatRate(item.rate, false)}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-sm font-semibold text-brand-deep">
                                                {formatTaka(lineTotal(item))}
                                            </div>
                                            <div className="no-print mt-1 flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                                <button
                                                    type="button"
                                                    className="text-xs font-medium text-brand hover:underline"
                                                    onClick={() =>
                                                        setItemModal({
                                                            mode: "edit",
                                                            groupIndex: gi,
                                                            item,
                                                        })
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-xs font-medium text-red-700 hover:underline"
                                                    onClick={() => removeItem(gi, item.id)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            ))}

            <button
                type="button"
                onClick={addSection}
                className="w-full rounded border border-dashed border-brand px-3 py-2 text-sm font-medium text-brand"
            >
                Add section
            </button>

            {itemModal && (
                <ItemFormModal
                    key={itemModal.mode === "edit" ? itemModal.item.id : `add-${itemModal.groupIndex}`}
                    mode={itemModal.mode}
                    sectionLabel={`Section ${itemModal.groupIndex + 1}`}
                    initial={itemModal.mode === "edit" ? itemModal.item : emptyLineItem()}
                    onClose={() => setItemModal(null)}
                    onSubmit={(item) => submitItem(itemModal.groupIndex, item, itemModal.mode)}
                />
            )}
        </div>
    );
}

function ItemFormModal({
    mode,
    sectionLabel,
    initial,
    onClose,
    onSubmit,
}: {
    mode: "add" | "edit";
    sectionLabel: string;
    initial: LineItem;
    onClose: () => void;
    onSubmit: (item: LineItem) => void;
}) {
    const [form, setForm] = useState<LineItem>(initial);
    const total = lineTotal(form);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onSubmit(form);
    };

    return (
        <Modal
            title={mode === "add" ? "Add Item" : "Edit Item"}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className="rounded border border-rule px-4 py-2 text-sm">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="item-form"
                        className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
                    >
                        {mode === "add" ? "Submit" : "Save"}
                    </button>
                </>
            }
        >
            <p className="mb-3 text-xs text-muted">Adding to {sectionLabel}</p>
            <form id="item-form" onSubmit={handleSubmit}>
                <Field label="Product & Description">
                    <input
                        className={inputClass}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        autoFocus
                        required
                    />
                </Field>
                <Field label="Brand">
                    <input
                        className={inputClass}
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        placeholder="-"
                    />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                    <Field label="Qty">
                        <input
                            type="number"
                            className={inputClass}
                            disabled={form.manual}
                            value={form.manual ? "" : form.qty}
                            onChange={(e) => setForm({ ...form, qty: Number(e.target.value) || 0 })}
                        />
                    </Field>
                    <Field label="Unit (m, roll, coil…)">
                        <input
                            className={inputClass}
                            disabled={form.manual}
                            value={form.unit}
                            onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        />
                    </Field>
                </div>
                <Field label="Rate (৳)">
                    <input
                        type="number"
                        className={inputClass}
                        disabled={form.manual}
                        value={form.manual ? "" : form.rate}
                        onChange={(e) => setForm({ ...form, rate: Number(e.target.value) || 0 })}
                    />
                </Field>
                <label className="mb-3 flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.manual}
                        onChange={(e) => setForm({ ...form, manual: e.target.checked })}
                    />
                    Manual amount (qty/rate as -)
                </label>
                {form.manual && (
                    <Field label="Manual total (৳)">
                        <input
                            type="number"
                            className={inputClass}
                            value={form.manualAmount || ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    manualAmount: Number(e.target.value) || 0,
                                })
                            }
                        />
                    </Field>
                )}
                <p className="text-right text-sm font-semibold text-brand-deep">Total: {formatTaka(total)}</p>
            </form>
        </Modal>
    );
}
