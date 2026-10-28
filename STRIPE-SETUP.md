# Stripe setup for ScamPrep

> Rewritten October 22, 2026. The previous version described a 14-day free trial, a `/thanks`
> redirect, and a refund policy that no longer apply. Decisions live in
> `~/ScamPrep/product/decisions.md` and `~/ScamPrep/product/mvp-spec.md`; if they disagree
> with this file, they win.

## How it fits together

- Six Payment Links, one per plan and billing period.
- The pricing page's annual/monthly toggle swaps which link each button points to.
- After payment, Stripe redirects to **`getscamprep.com/welcome`**, a branded page that
  collects the enrollee details and captures to Formspree.
- Bryce then sends each parent's invite **by hand** from hello@. No Apps Script.

## Identity: ScamPrep, not Sawtooth

The legal entity is Sawtooth Technologies LLC and stays that way. Everything buyer-facing
says ScamPrep. The Terms establish the d/b/a.

| Setting | Value |
| --- | --- |
| Statement descriptor (Business details) | `SCAMPREP` |
| Public business name (Public details) | `ScamPrep` |
| Support email / website | hello@getscamprep.com / getscamprep.com |
| Legal business name | Sawtooth Technologies LLC (unchanged) |

## Branding (Settings > Branding, in live mode)

| Field | Value |
| --- | --- |
| Icon | `~/ScamPrep/brand/social-kit-2026-10/logos/stripe-icon-512.png` |
| Logo | `~/ScamPrep/brand/social-kit-2026-10/logos/stripe-logo-square-512.png` |
| Brand color | `#F0A11C` |
| Accent color | `#121110` |
| Checkout background / button | `#F8F7F4` / `#F0A11C` |
| Font / shape | Inter (Manrope is not offered) / Rounded |

Ink text on amber, never white text on amber.

## Sandbox, not test mode

Use a **general sandbox**. Stripe recommends it for new integrations, and the test mode
sandbox shares settings with live mode, so changes there can silently alter live settings.
Set branding in live mode first: sandboxes copy settings from live at creation, then isolate.
Sandboxes do not send customer emails, so the receipt must be verified in live mode.

## Products and prices

| Product | Annual | Monthly |
| --- | --- | --- |
| ScamPrep Individual | $108 / year | $12 / month |
| ScamPrep Pairs | $180 / year | $20 / month |
| ScamPrep Family | $228 / year | $25 / month |

Name them exactly as above. "Pairs" matches the pricing page, and the product name appears
on the customer's receipt.

## The six Payment Links

For each price: Payment Links > New >

- **Subscription** with that price
- **No free trial.** Trials were removed October 5, 2026.
- **Require customers to accept your terms of service** (the affirmative per-link checkbox,
  not the passive account-level notice). The Terms carry arbitration with a 30-day opt-out,
  the 60-day refund promise, and the consent model, so a ticked box is real evidence.
- **Promotion codes: off.** Friendly test families pay for real and are refunded afterwards,
  so the test exercises the card, the receipt and the portal.
- **After the payment** > Don't show confirmation page > redirect to:

| Link | Redirect |
| --- | --- |
| Individual annual / monthly | `https://getscamprep.com/welcome?plan=individual&session_id={CHECKOUT_SESSION_ID}` |
| Pairs annual / monthly | `https://getscamprep.com/welcome?plan=pairs&session_id={CHECKOUT_SESSION_ID}` |
| Family annual / monthly | `https://getscamprep.com/welcome?plan=family&session_id={CHECKOUT_SESSION_ID}` |

Monthly and annual share a plan value, since billing period does not change what the form asks.

## Other settings

- **Checkout settings:** Legal policies on. The URLs live in **Public details**, not here, and
  both terms and privacy must be set or the toggle will not save. Leave "Display agreement to
  legal terms" unchecked; the per-link checkbox above is the stronger version.
- **Customer portal: ON** with cancel allowed. Backs the "cancel anytime" promise, and the
  Terms already point customers to it.
- **Email receipts: ON** for successful payments and refunds.
- **Notifications: ON** for successful payments, so a new sale is visible within minutes and
  the parent's invite clock starts.

## Paste the URLs into the site

Open `src/data/checkout.js`, paste each `https://buy.stripe.com/...` URL into its labeled slot,
then commit and push. Until they are pasted, the buttons fall back to `/early-access`, so a
half-configured state never produces a broken button. The live links were pasted and the main CTA
changed to "See plans" on **October 28, 2026**, when checkout went public.

## Operating notes

- **60-day guarantee:** manual refund from the dashboard. Cancel within 60 days of paying and
  everything paid is refunded, annual included. After 60 days, annual runs to the end of the
  billing year with no refund.
- **Parent never consents:** full refund on day 21, after reminders to both parent and buyer on
  days 7, 12 and 14.
- **Partial yes on Pairs or Family:** switch to the plan that fits and refund the difference.
- **Sales tax:** deferred at validation volume. Revisit once revenue is real.

## Before charging real cards

- [ ] Terms and privacy edits live (ToS sections 3 and 5, privacy policy, Promise page line,
      FAQ "kinds" line, homepage "always debriefed" line). Full list in `mvp-spec.md` section 15.
- [ ] Confirm the New York Certificate of Assumed Name for ScamPrep is filed, since the DBA is
      now asserted on card statements and in the Terms.
- [ ] Verify the receipt email actually arrives in live mode.
