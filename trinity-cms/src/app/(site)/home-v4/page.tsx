import type { Metadata } from "next";
import FlightPage from "./FlightPage";
import "@/styles/home-v4.css";

/* A concept page, not one for search to send people to. */
export const metadata: Metadata = {
  title: { absolute: "Home V4 — world flight" },
  robots: { index: false, follow: false },
};

export default function HomeV4() {
  return (
    <>
      {/* The source page loaded Sora alongside Inter. The site serves Inter already but its
          heading face is Poppins, so without this every heading fell back to Inter wearing
          Sora's tight tracking, and the "Boarding…" overlay — whose only declared family is
          Sora, with no fallback list — landed on the browser's default serif.
          Linked rather than loaded through next/font deliberately: next/font renames the
          family to a hashed string, and the ported stylesheet names `Sora` literally in a
          dozen `font:` shorthands. A plain link keeps the generated CSS untouched. */}
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <FlightPage />
    </>
  );
}
