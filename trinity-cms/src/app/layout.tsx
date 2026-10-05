import type { ReactNode } from "react";
import Script from "next/script";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="no-js">
      <body>
        {/* Flips `no-js` to `js` so the reveal animations can start hidden without stranding
            anyone whose JavaScript never runs (see `html.no-js [data-reveal]` in site.css).
            It has to run before paint, hence `beforeInteractive` — a bare <script> element here
            is what React warns about, since it would never execute on a client navigation. */}
        <Script id="js-flag" strategy="beforeInteractive">
          {`document.documentElement.classList.replace('no-js','js')`}
        </Script>
        {children}
      </body>
    </html>
  );
}
