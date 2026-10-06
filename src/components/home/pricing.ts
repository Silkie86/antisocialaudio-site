// Homepage helpers. Every figure here is worked out from src/data/site.ts, so nothing is retyped.
import { packages, packagePrice } from '../../data/site';

/** Lesson packages with their computed total, per-hour rate and saving. */
export const packageRows = packages.map((p) => ({ ...p, ...packagePrice(p), best: 'best' in p && p.best === true }));

/** The package with the lowest per-hour rate (the 10-hour pack). */
export const cheapest = packageRows.reduce((a, b) => (b.perHour < a.perHour ? b : a));

/** Largest package discount as a whole percentage, e.g. 10. */
export const maxDiscountPct = Math.round(Math.max(...packages.map((p) => p.discount)) * 100);

/** Hours of the multi-hour packs, e.g. [5, 10]. */
export const packHours = packages.filter((p) => p.hours > 1).map((p) => p.hours);

/** "a, b and c" */
export function listJoin(items: readonly (string | number)[], word = 'and'): string {
  const s = items.map(String);
  return s.length < 2 ? s.join('') : `${s.slice(0, -1).join(', ')} ${word} ${s[s.length - 1]}`;
}
