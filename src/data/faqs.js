// All FAQ copy lives here so it can be reused on the homepage teaser and /faq.
// Answers allow inline HTML (links).
// Copy rules (see CLAUDE.md): no em dashes, plain language, no fear or shame
// framing, and any mention of risk is followed by the thing to do about it.

export const faqs = [
  {
    id: 'knows',
    q: 'Does my parent know they’re enrolled?',
    a: `<p>Always. Personal consent is required, and we never test anyone in secret. What keeps it effective is that they don't know <em>when</em> the next drill will come or <em>what form</em> it will take. Real scammers don't make appointments either.</p>`,
  },
  {
    id: 'upset',
    q: 'What if it upsets or embarrasses them?',
    a: `<p>Drills follow published research on how older adults learn best: private and positive, with reassurance right away. Missing a drill brings a 30-second friendly lesson, visible only to the family members your parent approved. If it isn't landing well, unenroll in one click.</p>`,
  },
  {
    id: 'never-fall',
    q: 'What if they never fall for a single drill?',
    a: `<p>Wonderful. The Resilience Report proves it, quarter after quarter, and that proof is worth as much as the training. Scams change constantly, so staying enrolled keeps skills current against tactics that didn't exist a few months ago. Think of it like a smoke detector that also texts you "all clear, and here's why."</p>`,
  },
  {
    id: 'work',
    q: 'Will this actually work?',
    a: `<p>No one can promise a person will never be scammed, and you should walk away from anyone who does. What the research shows: one-time education fades within about a month, while simulated practice with immediate coaching is the approach a 2024 federal research review called promising. It's also how nearly every large company trains its employees. See <a href="/why-it-works">Why it works</a>.</p>`,
  },
  {
    id: 'bank',
    q: 'Do you access bank accounts or financial information?',
    a: `<p>Never. ScamPrep doesn't monitor money at all. That's a different, complementary kind of product. We only need contact channels: an email address, and optionally a phone number and mailing address.</p>`,
  },
  {
    id: 'app',
    q: "Is this another app they'll have to manage?",
    a: `<p>No, and that's deliberate. There is nothing to download and no password to remember. Drills and briefings arrive through the channels they already use every day, like their inbox and their text messages. There's nothing new to check or keep charged. If they can read an email, they're already set up.</p>`,
  },
  {
    id: 'kinds',
    q: 'What kinds of practice scams do you send?',
    a: `<p>Practice versions of what's actually circulating: fake bank alerts, delivery texts, prize notifications, tech-support pop-ups, "grandparent in trouble" messages, and new AI-driven variants. The library is refreshed monthly from FBI, FTC, and state regulator reporting. Nothing ever involves real money or real personal risk.</p>`,
  },
  {
    id: 'legal',
    q: 'Is it legal to send simulated scam texts and calls?',
    a: `<p>Yes, with proper consent, which we collect in writing before any text or voice drill, as the Telephone Consumer Protection Act requires. It's why every enrollment starts with email, and why we treat consent as a feature rather than paperwork.</p>`,
  },
  {
    id: 'sharp',
    q: "My dad is sharp as a tack. Isn't this insulting?",
    a: `<p>Sharp people get scammed every day. Optimism bias ("it won't happen to me") is exactly what scammers count on, and today's AI voice scams fool professionals. A framing that helps: this is the same training Fortune 500 companies require of every employee, CEO included. Being sharp is the starting point. Practice is what keeps it that way.</p>`,
  },
  {
    id: 'self',
    q: 'Can I enroll myself?',
    a: `<p>Yes. Enroll yourself the same way, and the Resilience Report goes wherever you want, including only to you.</p>`,
  },
  {
    id: 'cost',
    q: 'What does it cost?',
    a: `<p>$9/month for one person or $15/month for two, billed annually ($12 and $20 if billed monthly). Family plans open this fall, and every plan will start with a 14-day free trial and carry a 60-day money-back guarantee. For organizations, founding-partner pilots are open now, with volume pricing from $4 to $8 per person monthly. <a href="/pricing">See pricing</a></p>`,
  },
  {
    id: 'start',
    q: 'When can we start?',
    a: `<p>We're onboarding founding families from the early-access list now, in small cohorts so every family gets white-glove setup. Join the list and we'll tell you exactly where you are in line.</p>`,
  },
];

const byId = (id) => {
  const item = faqs.find((f) => f.id === id);
  if (!item) throw new Error(`Unknown FAQ id: ${id}`);
  return item;
};

// The subset shown on the homepage teaser, in display order. Selected by id so
// reordering or removing questions above never silently changes the homepage.
export const homeFaqs = ['knows', 'sharp', 'never-fall', 'app', 'bank'].map(byId);
