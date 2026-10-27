// Price helpers used across the site. Every figure and label here is worked out from src/data/site.ts,
// so nothing is retyped: change hourlyRate or a discount there and all of these follow.
import { packages, packagePrice } from './site';

/** Lesson packages with their computed total, per-hour rate, saving, discount as a whole percentage, name and label. */
export const packageRows = packages.map((p) => {
  const off = Math.round(p.discount * 100);
  return {
    ...p,
    ...packagePrice(p),
    off,
    name: `${p.hours} hour${p.hours === 1 ? '' : 's'}`,
    sub: p.hours === 1 ? 'Single lesson' : `${p.hours}-hour pack · ${off}% off`,
    best: 'best' in p && p.best === true,
  };
});

/** The package with the lowest per-hour rate (the 10-hour pack). */
export const cheapest = packageRows.reduce((a, b) => (b.perHour < a.perHour ? b : a));

/** Largest package discount as a whole percentage, e.g. 10. */
export const maxDiscountPct = Math.max(...packageRows.map((p) => p.off));

/** The multi-hour pack sizes for "a … pack", with a suspended hyphen on all but the last: "5- or 10-hour". */
export const packSizes = `${new Intl.ListFormat('en-GB', { type: 'disjunction' }).format(
  packageRows.filter((p) => p.hours > 1).map((p) => `${p.hours}-`),
)}hour`;
