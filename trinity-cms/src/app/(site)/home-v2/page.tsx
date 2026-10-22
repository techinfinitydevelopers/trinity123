import type { Metadata } from "next";
import Link from "next/link";
import { VARIANTS } from "@/components/site/v2/V2Home";
import "@/styles/v2.css";

export const metadata: Metadata = { title: { absolute: "Home V2" }, robots: { index: false, follow: false } };

/* The chooser. Three builds of the same page from the same content, so the difference you are
   judging is the motion and nothing else. */
export default function HomeV2Index() {
  return (
    <section className="v2idx">
      <div className="shell">
        <p className="kicker">Concept</p>
        <h1 className="v2idx__h">Home page, version&nbsp;2</h1>
        <p className="v2idx__lead">
          The same content as the live home page, read from the same place in the dashboard,
          arranged as a long scrolling story. Three builds, identical markup — only the motion
          differs. Open each and scroll the whole way down.
        </p>
        <ul className="v2idx__list">
          {VARIANTS.map((v) => (
            <li key={v.id}>
              <Link href={`/home-v2/${v.id}`} className="v2idx__card">
                <strong>{v.name}</strong>
                <span>{v.blurb}</span>
                <em>Open <i className="fas fa-arrow-right" aria-hidden="true" /></em>
              </Link>
            </li>
          ))}
        </ul>
        <p className="v2idx__note">
          Not linked from the site and not indexed. The live home page is untouched.
        </p>
      </div>
    </section>
  );
}
