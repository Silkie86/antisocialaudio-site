// Frequently asked questions, in the order they appear on the FAQ page.
// Answers are plain text. Wording is taken from the original site.
// The services, rates and DAW answers are built from src/data/site.ts (services, prices, payments, daws),
// so they always match the rest of the site: change those facts there, not here.
import { site, hourlyRate, payments, gbp, services, daws } from './site';
import { packageRows } from './pricing';

/** "a, b and c" */
const list = (items: readonly string[]) => new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(items);

const packOffers = new Intl.ListFormat('en-GB', { type: 'disjunction' }).format(
  packageRows.filter((p) => p.hours > 1).map((p) => `${p.name} for ${gbp(p.total, { pence: true })} (${p.off}% off)`),
);
const payLater = payments.payLater
  ? ' Buy now, pay later options are available at checkout and may vary based on your location.'
  : '';

export const faq = [
  {
    q: 'What services do you offer?',
    a: `Bass music production education: customised learning plans, one-to-one online classes and live online workshops. Lessons cover ${list(services.map((s) => s.toLowerCase()))}, from the basics to advanced techniques.`,
  },
  {
    q: 'How do I book?',
    a: 'Hit Book, then pick a service and a time and date that suits you. Not sure where to start? Book the free 30-minute consultation first.',
  },
  {
    q: 'What are your rates?',
    a: `Lessons are ${gbp(hourlyRate)} per hour. You can save by buying a package: ${packOffers}.${payLater}`,
  },
  {
    q: 'How do I get a consultation?',
    a: 'Hit Book and choose the free 30-minute consultation to set up a call with Silkie. You can talk about your music production goals, get your skill level assessed and explore how classes can be tailored to you.',
  },
  {
    q: 'Which DAWs are covered?',
    a: `${site.tutor.name} aka ${site.tutor.alias} specialises in ${list(daws.specialist)}, but teaches fundamentals of music theory, sound design, arranging, mixing and mastering that apply to other DAWs such as ${list(daws.fundamentals)}.`,
  },
];
