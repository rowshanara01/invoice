/** Indian/Bangladeshi grouping: 3,69,695.00 */
export function formatTaka(amount: number): string {
    const neg = amount < 0;
    const abs = Math.abs(amount);
    const fixed = abs.toFixed(2);
    const [intPart, dec] = fixed.split(".");
    const grouped = groupIndian(intPart);
    return `${neg ? "−" : ""}৳${grouped}.${dec}`;
}

function groupIndian(intPart: string): string {
    if (intPart.length <= 3) return intPart;
    const last3 = intPart.slice(-3);
    let rest = intPart.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
        parts.unshift(rest.slice(-2));
        rest = rest.slice(0, -2);
    }
    if (rest) parts.unshift(rest);
    return `${parts.join(",")},${last3}`;
}

const ONES = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
];

const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
    if (n < 20) return ONES[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o ? `${TENS[t]} ${ONES[o]}` : TENS[t];
}

function threeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const r = n % 100;
    if (h && r) return `${ONES[h]} Hundred ${twoDigits(r)}`;
    if (h) return `${ONES[h]} Hundred`;
    return twoDigits(r);
}

/** Amount in words using lakh/crore (South Asian). */
export function amountInWords(amount: number): string {
    const rupees = Math.round(Math.abs(amount));
    if (rupees === 0) return "Zero Taka Only.";

    const crore = Math.floor(rupees / 1_00_00_000);
    const lakh = Math.floor((rupees % 1_00_00_000) / 1_00_000);
    const thousand = Math.floor((rupees % 1_00_000) / 1000);
    const hundred = rupees % 1000;

    const parts: string[] = [];
    if (crore) parts.push(`${threeDigits(crore)} Crore`);
    if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
    if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
    if (hundred) parts.push(threeDigits(hundred));

    return `${parts.join(" ")} Taka Only.`;
}

export function lineTotal(item: { qty: number; rate: number; manual: boolean; manualAmount: number }): number {
    if (item.manual) return item.manualAmount || 0;
    return (item.qty || 0) * (item.rate || 0);
}

export function formatQty(qty: number, unit: string, manual: boolean): string {
    if (manual) return "-";
    const q = Number.isInteger(qty) || Math.abs(qty - Math.round(qty)) < 1e-9 ? String(Math.round(qty)) : String(qty);
    if (!unit) return q;
    // "400m" vs "1 roll" / "3 coil"
    return unit.length === 1 ? `${q}${unit}` : `${q} ${unit}`;
}

export function formatRate(rate: number, manual: boolean): string {
    if (manual) return "-";
    return formatTaka(rate);
}
