"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[admin]", error); }, [error]);
  const expired = error.message === "UNAUTHORIZED";
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand text-xl">!</div>
        <h1 className="text-[20px] font-bold text-navy">{expired ? "Your session expired" : "Something went wrong"}</h1>
        <p className="mt-2 text-[14px] text-ink-2">
          {expired
            ? "Please sign in again. Any unsaved work in another tab is still there — sign in, go back to that tab and press Save."
            : "This screen failed to load. Try again; if it keeps happening, reload the page."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {expired
            ? <Link className="btn-primary" href="/admin/login">Sign in</Link>
            : <button className="btn-primary" type="button" onClick={reset}>Try again</button>}
          <Link className="btn-ghost" href="/admin">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
