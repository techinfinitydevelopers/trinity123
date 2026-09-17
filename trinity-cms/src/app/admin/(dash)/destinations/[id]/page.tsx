import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import CountryForm from "@/components/admin/CountryForm";
import type { CountryInput } from "@/lib/actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return { title: "New destination" };
  const c = await db.country.findUnique({ where: { id }, select: { name: true } });
  return { title: c ? `Edit · ${c.name}` : "Destination" };
}

export default async function EditDestination({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initial: CountryInput = {
    code: "", slug: "", name: "", tag: "", img: "", hero: "", intro: "",
    stats: [{ v: "", l: "" }], why: [""], courses: [""], unis: [], visa: "", intakes: "",
    cost: [{ label: "", value: "" }], req: [{ label: "", value: "" }], sch: [{ name: "", text: "" }], steps: [{ title: "", text: "" }],
    work: "", workPoints: [""], faq: [{ q: "", a: "" }], seoTitle: "", seoDesc: "", isActive: true, order: 99,
  };
  if (id !== "new") {
    const c = await db.country.findUnique({ where: { id } });
    if (!c) notFound();
    initial = {
      id: c.id, code: c.code, slug: c.slug, name: c.name, tag: c.tag, img: c.img, hero: c.hero, intro: c.intro,
      stats: c.stats as unknown[], why: c.why as unknown[], courses: c.courses as unknown[], unis: c.unis as unknown[], visa: c.visa, intakes: c.intakes,
      cost: c.cost as unknown[], req: c.req as unknown[], sch: c.sch as unknown[], steps: c.steps as unknown[], work: c.work, workPoints: c.workPoints as unknown[], faq: c.faq as unknown[],
      seoTitle: c.seoTitle ?? "", seoDesc: c.seoDesc ?? "", isActive: c.isActive, order: c.order,
    };
  }
  return (
    <>
      <div className="mb-5 flex items-center gap-3 text-[13px]"><Link href="/admin/destinations" className="text-ink-3 hover:text-brand">‹ Destinations</Link><span className="text-ink-3">/</span><span className="font-semibold text-navy">{id === "new" ? "New destination" : initial.name}</span></div>
      <CountryForm initial={initial} />
    </>
  );
}
