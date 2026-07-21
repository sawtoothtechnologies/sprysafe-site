# Stripe setup for sprysafe.com — Payment Links

> The site side is already wired: paste six payment-link URLs into
> `src/data/checkout.js`, push, done. This doc is the Stripe-dashboard side.
> Until links are pasted, "Start free trial" buttons safely fall back to /early-access.

## How it fits together

- Each plan/billing combo gets a **Stripe Payment Link** (a hosted checkout URL).
- The pricing page's annual/monthly toggle swaps which link each button points to.
- After checkout, Stripe redirects the customer to **sprysafe.com/thanks** (already built),
  which tells them you'll email within one business day to start enrollment.
- Fulfillment is manual (white-glove) for now: Stripe emails you on each new subscription.
  Upgrade path to automated provisioning (Checkout API + webhooks) stays open.

## One-time dashboard setup (~45 min)

### 1. Activate the account
Stripe Dashboard → complete business activation with Sawtooth Technologies LLC details and
the business bank account. Until activated you can still do everything in **test mode**.

### 2. Create the products & prices (test mode first)
Product catalog → Add product. Create **three products**, each with **two recurring prices**:

| Product | Annual price | Monthly price |
|---|---|---|
| Spry — Individual | **$108 / year** | **$12 / month** |
| Spry — Couples & pairs | **$180 / year** | **$20 / month** |
| Spry — Family | **$228 / year** | **$25 / month** |

Annual prices match the site's "$9 / $15 / $19 per month, billed annually" framing.

### 3. Create six Payment Links
For each of the six prices: Payment Links → New →
- **Subscription** with that price
- **Free trial: 14 days** (matches the site promise; card collected up front)
- After payment → **Don't show confirmation page → redirect to** `https://sprysafe.com/thanks`
- Leave promotion codes **off** (site policy: integrity pricing, no coupon-hunting)
- Optional: enable **phone number collection** if you want it for onboarding

### 4. Paste the URLs into the site
Open `src/data/checkout.js` in the site repo, paste each `https://buy.stripe.com/...` URL
into its labeled slot, then commit + push. Cloudflare redeploys in ~2 min.

### 5. Billing settings (Settings → Billing)
- **Customer portal: ON**, with "cancel subscription" allowed — backs the site's
  "cancel anytime" promise. Customers reach it from Stripe's receipt emails.
- **Trial reminder email: ON** ("send a reminder before a free trial ends") — card-network
  rules require notice before a trial converts; Stripe handles it for you.
- **Email receipts: ON** (Settings → Emails → successful payments + refunds).

### 6. Test, then go live
1. In **test mode**, paste the test-mode link URLs into `checkout.js`, push, and run a
   checkout with card `4242 4242 4242 4242` (any future expiry/CVC). Confirm the trial
   shows, the redirect lands on /thanks, and the subscription appears in the dashboard.
2. Flip the dashboard to **live mode**, recreate the six links (links don't cross modes),
   paste the live URLs, push again.

## Operating notes

- **New subscriber** → Stripe notifies you (turn on: Profile → Notifications). Onboard them
  personally within one business day, as /thanks promises.
- **60-day guarantee** → manual: Dashboard → Payments → payment → **Refund**. Refund in full,
  no questions, per the site.
- **Annual refunds for cancellation** → the site promises "annual plans refund unused months";
  that's also a manual (prorated) refund from the dashboard.
- **Sales tax**: SaaS/services taxability varies by state. Fine to defer at validation volume,
  but revisit (Stripe Tax is a toggle + ~0.5% fee) once revenue is real. Ask the attorney.

## ⚠️ Before charging real cards

- [ ] `/privacy` and `/terms` are still marked DRAFT — the pre-marketing checklist calls for
      attorney review **before charging customers**. That moment is now.
- [ ] Confirm the SPRY/SPRYSAFE trademark quick-screen is done (checklist item).
- [ ] Fix the early-access Formspree placeholder — with checkout live, the waitlist is still
      the nav CTA and it currently captures nothing.
