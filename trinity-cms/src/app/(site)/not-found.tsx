import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero page-hero--short">
      <div className="page-hero__bg" /><div className="page-hero__grid" />
      <div className="container page-hero__inner">
        <div>
          <p className="badge badge--gold"><i className="fas fa-compass" /> 404</p>
          <h1 className="h1">Page <span className="gold">not found</span></h1>
          <p className="page-hero__sub">The page you’re looking for doesn’t exist or was moved.</p>
          <div className="btn-row" style={{ marginTop: 28 }}><Link className="btn btn--gold" href="/">Go home <i className="fas fa-arrow-right" /></Link></div>
        </div>
      </div>
    </section>
  );
}
