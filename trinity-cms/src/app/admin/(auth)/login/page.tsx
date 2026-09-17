import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSetting } from "@/lib/settings-server";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  const site = await getSetting("site");
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-navy text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(60% 50% at 20% 20%, rgba(87,81,225,.55), transparent 60%), radial-gradient(40% 40% at 90% 80%, rgba(255,194,36,.25), transparent 60%)" }} />
        <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="relative inline-flex w-fit items-center rounded-xl bg-white px-3 py-2 shadow-sm">
          <img src={site.logo} alt={site.siteName} className="h-9 w-auto" />
        </div>
        <div className="relative max-w-md">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[.18em] text-gold">Admin Console</p>
          <h1 className="text-4xl font-bold leading-tight">Everything on your website, <span className="text-gold">editable in one place.</span></h1>
          <p className="mt-4 text-white/65">Pages, blog, theme, leads and the student assistant — no developer needed.</p>
        </div>
        <p className="relative text-[12px] text-white/40">{site.copyright}</p>
      </aside>
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px] fade-up">
          <img src={site.logo} alt="" className="mb-8 h-10 w-auto lg:hidden" />
          <h2 className="text-2xl font-bold text-navy">Welcome back</h2>
          <p className="mt-1 text-[14px] text-ink-2">Sign in to manage {site.siteName}.</p>
          <div className="mt-8"><LoginForm /></div>
        </div>
      </main>
    </div>
  );
}
