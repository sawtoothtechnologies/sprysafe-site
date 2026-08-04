// Stripe Payment Link URLs for each plan and billing period.
//
// HOW TO USE (full walkthrough in STRIPE-SETUP.md at the repo root):
// 1. Create the payment link in the Stripe dashboard.
// 2. Paste its URL (https://buy.stripe.com/...) into the matching slot below.
// 3. Commit + push. Cloudflare redeploys and the pricing buttons go live.
//
// Any slot left empty ('') falls back to the /early-access waitlist, so a
// half-configured state never produces a broken button.
//
// TESTING: while in Stripe test mode, paste the test-mode link URLs here,
// verify checkout with card 4242 4242 4242 4242, then swap in the live URLs.

export const checkoutLinks = {
  individual: {
    annual: '',   // ScamPrep Individual — $108/year (shown as $9/mo)
    monthly: '',  // ScamPrep Individual — $12/month
  },
  couples: {
    annual: '',   // ScamPrep Couples & pairs — $180/year (shown as $15/mo)
    monthly: '',  // ScamPrep Couples & pairs — $20/month
  },
  family: {
    annual: '',   // ScamPrep Family — $228/year (shown as $19/mo)
    monthly: '',  // ScamPrep Family — $25/month
  },
};
