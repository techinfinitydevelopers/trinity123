import type { Metadata } from "next";
import TrinityWorldHost from "@/components/tw/TrinityWorldHost";
import "@/styles/tw-site.css";

/* Preview route for the supplied Trinity World drop-in, so it can be looked at before it is
   wired to the dashboard toggle. Not linked and not indexed. */
export const metadata: Metadata = {
  title: { absolute: "Trinity World — preview" },
  robots: { index: false, follow: false },
};

export default function TrinityWorldPreview() {
  return (
    <>
      {/* The drop-in's CSS names Sora; the site's heading face is Poppins, so it has to be
          loaded here or every heading falls back — the same reason /home-v4 loads it. */}
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <TrinityWorldHost />
    </>
  );
}
