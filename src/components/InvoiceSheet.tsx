import { computeInvoice, letterheadLine } from "../lib/calc";
import { amountInWords, formatQty, formatRate, formatTaka } from "../lib/money";
import type { BusinessProfile, Invoice } from "../lib/types";
import { useFitScale } from "../hooks/useFitScale";

const WATERMARK_SPOTS = [
    { left: "28%", top: "22%" },
    { left: "74%", top: "34%" },
    { left: "30%", top: "56%" },
    { left: "72%", top: "70%" },
    { left: "34%", top: "88%" },
];

type Props = {
    profile: BusinessProfile;
    invoice: Invoice;
    className?: string;
};

export function InvoiceSheet({ profile, invoice, className = "" }: Props) {
    const computed = computeInvoice(invoice);
    const deps = [
        invoice.id,
        invoice.updatedAt,
        JSON.stringify(invoice.groups),
        JSON.stringify(invoice.customer),
        JSON.stringify(invoice.meta),
        profile.brandName,
        profile.note,
        profile.signerName,
    ];
    const { sheetRef } = useFitScale(deps);
    const watermarkUrl = `${import.meta.env.BASE_URL}brand/our-vimganj.webp`;

    return (
        <main ref={sheetRef} className={`invoice-sheet print-only-sheet ${className}`}>
            <div className="watermark" aria-hidden="true">
                {WATERMARK_SPOTS.map((pos) => (
                    <i
                        key={`${pos.left}-${pos.top}`}
                        style={{
                            left: pos.left,
                            top: pos.top,
                            backgroundImage: `url("${watermarkUrl}")`,
                        }}
                    />
                ))}
            </div>

            <header className="head">
                <div>
                    <div className="brand-name">{profile.brandName}</div>
                    <div className="brand-line">{letterheadLine(profile)}</div>
                </div>
                <div className="doc-tag">
                    <div className="label">{profile.docLabel}</div>
                </div>
            </header>

            <section className="details">
                <div className="box">
                    <h3>
                        Customer Details / <span className="bn">গ্রাহকের তথ্য</span>
                    </h3>
                    <dl>
                        <dt>Client Name:</dt>
                        <dd>{invoice.customer.clientName || "—"}</dd>
                        <dt>Organization:</dt>
                        <dd>{invoice.customer.organization || "—"}</dd>
                        <dt>Contact No:</dt>
                        <dd>{invoice.customer.contactNo || "—"}</dd>
                        <dt>Address:</dt>
                        <dd>{invoice.customer.address || "—"}</dd>
                    </dl>
                </div>
                <div className="box">
                    <h3>
                        Invoice Details / <span className="bn">তথ্য</span>
                    </h3>
                    <dl>
                        <dt>Invoice No:</dt>
                        <dd>{invoice.meta.invoiceNo || "—"}</dd>
                        <dt>Date:</dt>
                        <dd>{invoice.meta.date || "—"}</dd>
                        <dt>Prepared By:</dt>
                        <dd>{invoice.meta.preparedBy || "—"}</dd>
                    </dl>
                </div>
            </section>

            <section className="section">
                <table>
                    <colgroup>
                        <col className="sl" />
                        <col />
                        <col className="brandc" />
                        <col className="qty" />
                        <col className="rate" />
                        <col className="tot" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="c">SL</th>
                            <th>
                                Product &amp; Description / <span className="bn">পণ্যের নাম ও বিবরণ</span>
                            </th>
                            <th className="c">Brand</th>
                            <th className="c">Qty</th>
                            <th className="r">Rate (৳)</th>
                            <th className="r">Total (৳)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {computed.printableGroups.map((g, gi) => (
                            <GroupRows key={g.group.id} g={g} showGapBefore={gi > 0} />
                        ))}
                        {computed.printableGroups.length === 0 && (
                            <tr>
                                <td className="c" colSpan={6}>
                                    No items yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            <section className="grand">
                <div className="box breakdown num">
                    {computed.printableGroups.map((g) => (
                        <div key={g.group.id}>
                            <span>Total ({g.rangeLabel})</span>
                            <span>{formatTaka(g.net)}</span>
                        </div>
                    ))}
                    <div className="words">
                        <span>
                            <b>Amount in Words:</b> <em>{amountInWords(computed.grandTotal)}</em>
                        </span>
                    </div>
                </div>
                <div className="total-card">
                    <div className="t-label">
                        Grand Total (<span className="bn">সর্বমোট</span>)
                    </div>
                    <div className="t-val">{formatTaka(computed.grandTotal)}</div>
                </div>
            </section>

            <div className="note">{profile.note}</div>

            <section className="signs">
                <div className="sig">
                    <div className="line" />
                    <b>Customer Signature</b> / <span className="bn">গ্রাহকের স্বাক্ষর</span>
                </div>
                <div className="sig right">
                    <div className="line" />
                    <div>
                        <b>Authorized Signature</b>
                    </div>
                    <div className="who">{profile.signerName}</div>
                    <div className="role">{profile.signerRole}</div>
                </div>
            </section>

            <div className="foot">{profile.footer}</div>
        </main>
    );
}

function GroupRows({
    g,
    showGapBefore,
}: {
    g: ReturnType<typeof computeInvoice>["printableGroups"][number];
    showGapBefore: boolean;
}) {
    const title = g.group.title.trim();
    return (
        <>
            {showGapBefore && (
                <tr className="gap">
                    <td colSpan={6} />
                </tr>
            )}
            {title && (
                <tr className="grp">
                    <td colSpan={6}>
                        {title} ({g.rangeLabel})
                    </td>
                </tr>
            )}
            {g.lines.map((line) => (
                <tr key={line.id}>
                    <td className="c">{line.sl}</td>
                    <td>{line.name || "—"}</td>
                    <td className="c">{line.brand.trim() || "-"}</td>
                    <td className="c">{formatQty(line.qty, line.unit, line.manual)}</td>
                    <td className="r">{formatRate(line.rate, line.manual)}</td>
                    <td className="r">{formatTaka(line.total)}</td>
                </tr>
            ))}
            {g.discount > 0 ? (
                <>
                    <tr className="sec-sum">
                        <td className="lbl" colSpan={5}>
                            Sub Total ({g.rangeLabel})
                        </td>
                        <td className="r">{formatTaka(g.subtotal)}</td>
                    </tr>
                    <tr className="sec-sum">
                        <td className="lbl" colSpan={5}>
                            Discount (<span className="bn">ছাড়</span>)
                        </td>
                        <td className="r">−{formatTaka(g.discount)}</td>
                    </tr>
                    <tr className="sec-sum net">
                        <td className="lbl" colSpan={5}>
                            Total ({g.rangeLabel})
                        </td>
                        <td className="r">{formatTaka(g.net)}</td>
                    </tr>
                </>
            ) : (
                <tr className="sec-sum net">
                    <td className="lbl" colSpan={5}>
                        Total ({g.rangeLabel})
                    </td>
                    <td className="r">{formatTaka(g.net)}</td>
                </tr>
            )}
        </>
    );
}
