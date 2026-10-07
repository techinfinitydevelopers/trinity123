import Link from "next/link";
import { getLabels } from "@/lib/labels";
import { Marked } from "@/components/site/ui";

export default async function NotFound() {
  const L = (await getLabels()).errors;
  return (
    <section className="page-hero page-hero--short">
      <div className="page-hero__bg" /><div className="page-hero__grid" />
      <div className="container page-hero__inner">
        <div>
          <p className="badge badge--gold"><i className="fas fa-compass" /> {L.notFoundBadge}</p>
          <h1 className="h1"><Marked text={L.notFoundTitle} /></h1>
          <p className="page-hero__sub">{L.notFoundText}</p>
          <div className="btn-row" style={{ marginTop: 28 }}><Link className="btn btn--gold" href="/">{L.goHome} <i className="fas fa-arrow-right" /></Link></div>
        </div>
      </div>
    </section>
  );
}
