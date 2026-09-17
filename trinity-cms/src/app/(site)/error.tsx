"use client";
/* Keeps one bad section from taking down the whole public site. */
import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[site]", error); }, [error]);
  return (
    <section className="page-hero page-hero--short">
      <div className="page-hero__bg" /><div className="page-hero__grid" />
      <div className="container page-hero__inner">
        <div>
          <p className="badge badge--gold"><i className="fas fa-triangle-exclamation" /> Something went wrong</p>
          <h1 className="h1">We hit a <span className="gold">snag</span></h1>
          <p className="page-hero__sub">This page didn’t load properly. Please try again — or just call us, we’re happy to help right away.</p>
          <div className="btn-row" style={{ marginTop: 28 }}>
            <button className="btn btn--gold" type="button" onClick={reset}>Try again <i className="fas fa-rotate-right" /></button>
            <Link className="btn btn--ghost" href="/">Go home</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
