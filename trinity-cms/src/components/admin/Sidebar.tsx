"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "M4 13h6V4H4v9zm10 7h6v-9h-6v9zM4 20h6v-5H4v5zm10-16v5h6V4h-6z" },
  { href: "/admin/pages", label: "Pages", icon: "M7 3h7l5 5v13H7V3zm7 1.5V9h4.5" },
  { href: "/admin/destinations", label: "Destinations", icon: "M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12zm0-9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
  { href: "/admin/posts", label: "Blog", icon: "M5 4h14v16H5V4zm3 4h8M8 12h8M8 16h5" },
  { href: "/admin/media", label: "Media", icon: "M4 5h16v14H4V5zm3 10l3-4 3 3 2-2 3 3" },
  { href: "/admin/leads", label: "Leads", icon: "M4 6h16v12H4V6zm0 1l8 6 8-6", badge: true },
  { href: "/admin/theme", label: "Theme & UI", icon: "M12 3a9 9 0 100 18c1.2 0 2-.8 2-2 0-.6-.3-1-.6-1.4-.3-.4-.4-.7-.4-1.1 0-.9.8-1.5 1.7-1.5H16a5 5 0 005-5c0-4.4-4-7-9-7z" },
  { href: "/admin/chatbot", label: "Chatbot", icon: "M4 5h16v11H9l-5 4V5zm4 4h8M8 12h5" },
  { href: "/admin/chats", label: "Conversations", icon: "M8 10h8M8 14h5M21 12a9 9 0 11-3.5-7.1L21 4v8h-8" },
  { href: "/admin/settings", label: "Settings", icon: "M12 8a4 4 0 100 8 4 4 0 000-8zm8 4l-2 .6-.5 1.6 1 1.8-1.5 1.5-1.8-1-1.6.5L13 20h-2l-.6-2-1.6-.5-1.8 1-1.5-1.5 1-1.8L6 13.6 4 13v-2l2-.6.5-1.6-1-1.8L7 5.5l1.8 1L10.4 6 11 4h2l.6 2 1.6.5 1.8-1L18.5 7l-1 1.8.5 1.6L20 11v1z" },
];

export default function Sidebar({ user, logo, unread }: { user: SessionUser; logo: string; unread: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/admin" ? path === "/admin" : path.startsWith(h));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${active(n.href) ? "bg-white/10 text-white shadow-[inset_3px_0_0_0_#FFC224]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={active(n.href) ? "text-gold" : "text-white/50 group-hover:text-white"}><path d={n.icon} /></svg>
          <span className="flex-1">{n.label}</span>
          {n.badge && unread > 0 ? <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-navy">{unread}</span> : null}
        </Link>
      ))}
    </nav>
  );

  const foot = (
    <div className="border-t border-white/10 p-3">
      <a href="/" target="_blank" rel="noopener" className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-white/60 hover:bg-white/5 hover:text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5" /></svg>View website
      </a>
      <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-[13px] font-bold text-white">{user.name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-white">{user.name}</p><p className="truncate text-[11px] text-white/50">{user.role.toLowerCase()}</p></div>
        <form action={logoutAction}><button className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white" title="Sign out" aria-label="Sign out"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4M15 8l4 4-4 4M19 12H9" /></svg></button></form>
      </div>
    </div>
  );

  return (
    <>
      {/* mobile topbar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <img src={logo} alt="" className="h-7 w-auto" />
        <button className="btn-ghost btn-sm" onClick={() => setOpen(true)} aria-label="Open menu">Menu</button>
      </div>
      <div className="h-14 lg:hidden" />
      {open ? <button className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-navy transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-5 pb-4 pt-5">
          <img src={logo} alt="" className="h-9 w-auto brightness-0 invert" />
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">Admin</span>
        </div>
        {nav}
        {foot}
      </aside>
    </>
  );
}
