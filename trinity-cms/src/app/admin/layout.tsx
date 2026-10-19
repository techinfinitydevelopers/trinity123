import type { ReactNode } from "react";
import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Trinity Admin" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
      {/* The dashboard has icon fields that preview the class as you type it, and without this
          every one of them drew an empty square — there was no way to tell a working Font
          Awesome class from a typo except by opening the live site. Same 5.15.4 the site uses:
          the FA6 spellings render nothing here too, which is the point of the preview. */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      {children}
    </>
  );
}
