/*
 * Site configuration — edit these values before going live.
 * Anything left empty falls back gracefully (e.g. payment buttons route to the contact form).
 */
window.SITE_CONFIG = {
  // Calendly / Cal.com / HubSpot meetings link. Empty → scrolls to the contact form.
  bookingUrl: "",

  // Stripe Payment Links (create them in Stripe Dashboard → Payment Links; enable Apple Pay / Google Pay there).
  stripe: {
    starter: "",
    standard: "",
    maximum: ""
  },

  // Crypto receiving addresses. Empty → "address sent on request" and the form is offered instead.
  crypto: {
    usdt: "", // USDT on TRON (TRC20), starts with "T"
    btc: "",  // Bitcoin, starts with "bc1" / "1" / "3"
    eth: ""   // Ethereum / ERC20, starts with "0x"
  },

  // Ecosystem links shown in the "Powered by" blocks. Empty → rendered as plain text.
  brands: {
    triton: "",
    stive: "https://stive.ai",
    icoda: "https://icoda.io"
  },

  // Fallback contact used if the form cannot be submitted.
  email: ""
};
