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

// TEST BRANCH ONLY (checkout-test): live links pasted for one end-to-end test purchase
// on the Cloudflare preview. Never merge this branch; links go public on November 9.
export const checkoutLinks = {
  individual: {
    annual: 'https://buy.stripe.com/4gM8wOcbIcgU3xec7LgUM02',   // ScamPrep Individual — $108/year (shown as $9/mo)
    monthly: 'https://buy.stripe.com/28E4gy4Jg94Ic3Kb3HgUM01',  // ScamPrep Individual — $12/month
  },
  couples: {
    annual: 'https://buy.stripe.com/9B65kCa3A3Ko3xec7LgUM04',   // ScamPrep Couples & pairs — $180/year (shown as $15/mo)
    monthly: 'https://buy.stripe.com/8x29AS6RodkY4BifjXgUM03',  // ScamPrep Couples & pairs — $20/month
  },
  family: {
    annual: 'https://buy.stripe.com/aFa14mfnU5Sw7Nu0p3gUM06',   // ScamPrep Family — $228/year (shown as $19/mo)
    monthly: 'https://buy.stripe.com/8x214mejQ0yc2tab3HgUM05',  // ScamPrep Family — $25/month
  },
};
