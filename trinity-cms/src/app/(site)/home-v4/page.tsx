import type { Metadata } from "next";
import FlightPage from "./FlightPage";
import "@/styles/home-v4.css";

/* Home V4 — the supplied "world flight" concept, running under the site's own header and
   footer. A concept page, not one for search to send people to. */
export const metadata: Metadata = {
  title: { absolute: "Home V4 — world flight" },
  robots: { index: false, follow: false },
};

export default function HomeV4() {
  return <FlightPage />;
}
