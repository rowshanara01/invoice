import { useLayoutEffect, useRef, useState } from "react";

const MIN = 0.55;
const MAX = 1.35;
const TARGET_SLACK_PX = 8;

/**
 * Binary-search --fit so the A4 sheet content fills one page without overflow.
 */
export function useFitScale(deps: unknown[]) {
    const sheetRef = useRef<HTMLElement | null>(null);
    const [fit, setFit] = useState(1);

    useLayoutEffect(() => {
        const el = sheetRef.current;
        if (!el) return;

        let cancelled = false;

        const measure = (scale: number) => {
            el.style.setProperty("--fit", String(scale));
            // force layout
            void el.offsetHeight;
            return el.scrollHeight - el.clientHeight;
        };

        // Find max scale that does not overflow
        let lo = MIN;
        let hi = MAX;
        for (let i = 0; i < 18; i++) {
            const mid = (lo + hi) / 2;
            const overflow = measure(mid);
            if (overflow > TARGET_SLACK_PX) hi = mid;
            else lo = mid;
        }

        if (!cancelled) {
            const next = Math.round(lo * 1000) / 1000;
            el.style.setProperty("--fit", String(next));
            setFit(next);
        }

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { sheetRef, fit };
}
