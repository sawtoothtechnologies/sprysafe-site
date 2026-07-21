// Stripe Payment Link URLs for each plan and billing period.
//
// HOW TO USE (full walkthrough in SPRY-STRIPE-SETUP.md at the repo root):
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
    annual: '',   // Spry Individual — $108/year (shown as $9/mo)
    monthly: '',  // Spry Individual — $12/month
  },
  couples: {
    annual: '',   // Spry Couples & pairs — $180/year (shown as $15/mo)
    monthly: '',  // Spry Couples & pairs — $20/month
  },
  family: {
    annual: '',   // Spry Family — $228/year (shown as $19/mo)
    monthly: '',  // Spry Family — $25/month
  },
};
