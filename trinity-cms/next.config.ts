import type { NextConfig } from "next";

/* Baseline security headers. The site embeds a Google Maps iframe and loads Font Awesome
   from cdnjs and fonts from Google, so the CSP has to allow those origins explicitly. */
const csp = [
  "default-src 'self'",
  // Next injects inline bootstrap scripts; 'unsafe-inline' is required for the App Router.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
  "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
  "img-src 'self' data: blob: https:",
  /* `blob:` is for three.js: GLTFLoader turns a model's embedded textures into blob URLs and
     fetches them back, so without it the aircraft on /home-v4 loads untextured. */
  "connect-src 'self' blob:",
  /* `'self'` is what lets the dashboard frame the live preview of a page. Without it the
     preview pane just renders blank — `frame-ancestors` allows the framing, but `frame-src`
     governs what the admin page itself may load in a frame. */
  "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube-nocookie.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      /* The Trinity World assets are a fixed drop-in: the globe textures, the aircraft and
         the campus photos never change under the same file name. Next serves everything in
         public/ with `max-age=0`, so on the home page every repeat visit re-validated close
         to half a megabyte before the globe could draw. A month is long enough to matter and
         short enough that swapping a campus photo still reaches people without a rename. */
      {
        source: "/tw/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      // The dashboard must never be framed, and must never be cached by a shared proxy.
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
