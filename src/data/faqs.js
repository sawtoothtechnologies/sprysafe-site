// All FAQ copy lives here so it can be reused on the homepage teaser and /faq.
// Answers allow inline HTML (links).
// Copy rules (see CLAUDE.md): no em dashes, plain language, no fear or shame
// framing, and any mention of risk is followed by the thing to do about it.

export const faqs = [
  {
    id: 'knows',
    q: 'Does my loved one know they’re enrolled?',
    a: `<p>Always. Personal consent is required, and we never test anyone in secret. What keeps ScamPrep effective is that they don't know <em>when</em> the next drill will come or <em>what form</em> it will take. Real scammers don't make appointments either.</p>`,
  },
  {
    id: 'upset',
    q: 'What if it upsets or embarrasses them?',
    a: `<p>Drills follow published research on how older adults learn best: private and positive, with reassurance right away. Missing a drill brings a 30-second friendly lesson, visible only to them and the people they've approved. If it isn't landing well, unenroll in one click.</p>`,
  },
  {
    id: 'never-fall',
    q: 'What if they never fall for a single drill?',
    a: `<p>Wonderful. The Resilience Report proves it, quarter after quarter, and that proof is worth as much as the training. Scams change constantly, so staying enrolled keeps skills current against tactics that didn't exist a few months ago. Think of it like a smoke detector: even if you haven’t had a fire yet, you have it in case of one.</p>`,
  },
  {
    id: 'work',
    q: 'Will this actually work?',
    a: `<p>No one can promise a person will never be scammed, and you should walk away from anyone who does. What the research shows: one-time education fades within about a month, while simulated practice with immediate coaching is the approach a 2024 federal research review called promising. It's also how nearly every large company trains its employees. See <a href="/why-it-works">Why it works</a>.</p>`,
  },
  {
    id: 'bank',
    q: 'Do you access bank accounts or financial information?',
    a: `<p>Never. ScamPrep doesn't monitor money. We only need contact channels, like an email address and phone number.</p>`,
  },
  {
    id: 'app',
    q: "Is this another app they'll have to manage?",
    a: `<p>No, and that's deliberate. There is nothing to download and no password to remember. Drills and briefings arrive through the channels they already use every day, like their email inbox and cell phone. There's nothing new to check or keep charged. If they can read a text, that's all the setup there is.</p>`,
  },
  {
    id: 'kinds',
    q: 'What kinds of practice scams do you send?',
    a: `<p>Practice versions of what's actually circulating: fake bank alerts, delivery texts, Social Security notices, tech-support emails, "grandparent in trouble" calls, and new variants as they appear. The library is refreshed monthly from FBI, FTC, and state regulator reporting. Nothing ever involves real money or real personal risk.</p>`,
  },
  {
    id: 'channels',
    q: 'Which channels do drills use?',
    a: `<p>Email from day one. Text and phone drills are added with their written consent. Between drills, short snippets on the newest scams arrive through the same channels.</p>`,
  },
  {
    id: 'legal',
    q: 'Is it legal to send simulated scam texts and calls?',
    a: `<p>Yes, with proper consent, which we collect in writing before any text or voice drill, as the Telephone Consumer Protection Act requires. It's why every enrollment starts with email, and why we treat consent as a feature rather than paperwork. The full detail is in <a href="/promise">Our promise</a>.</p>`,
  },
  {
    id: 'sharp',
    q: 'My loved one is sharp as a tack. Will they be offended by this?',
    a: `<p>Sharp people get scammed every day. Optimism bias ("it won't happen to me") is exactly what scammers count on, and today's AI voice scams fool professionals. A framing that helps: this is the same training Fortune 500 companies require of every employee, CEO included. Being sharp is the starting point, and practice is what keeps us that way.</p>`,
  },
  {
    id: 'report',
    q: 'Who sees the Resilience Report?',
    a: `<p>Your loved one and the family members they choose, every quarter. It shows which drills ran, what was caught, what was missed, and what we're reinforcing next. Nobody else sees it, and nobody is monitored behind their back.</p>`,
  },
  {
    id: 'self',
    q: 'Can I enroll myself?',
    a: `<p>Yes. Enroll yourself the same way, and the Resilience Report goes wherever you want, including only to you.</p>`,
  },
  {
    id: 'cost',
    q: 'What does it cost?',
    a: `<p>$9 a month for one person, $15 for two (the Pairs plan), or $19 for up to four, billed annually. Every plan starts with a 14-day free trial and carries a 60-day money-back guarantee. Financial advisors can sponsor their clients at partner pricing, starting with a founding pilot. <a href="/pricing">See pricing</a></p>`,
  },
  {
    id: 'start',
    q: 'When can we start?',
    a: `<p>Family plans open this fall. We onboard from the early-access list in small groups, so every family gets white-glove setup. <a href="/early-access">Join the list</a> and we'll tell you exactly where you are in line.</p>`,
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
