"use client";
import { useState } from "react";
import type { SettingsMap } from "@/lib/settings";
import { ChatbotSettingsForm } from "./SettingsForms";
import KnowledgeEditor, { type KItem } from "./KnowledgeEditor";
import BulkUploadKnowledge from "./BulkUploadKnowledge";
import UnansweredList, { type UnansweredRow } from "./UnansweredList";

type Tab = "settings" | "kb" | "bulk" | "unanswered";

export default function ChatbotTabs({ cfg, items, unanswered }: { cfg: SettingsMap["chatbot"]; items: KItem[]; unanswered: UnansweredRow[] }) {
  const [tab, setTab] = useState<Tab>("settings");
  const [prefill, setPrefill] = useState<string | undefined>(undefined);

  const tabs: [Tab, string, number?][] = [
    ["settings", "Settings"],
    ["kb", "Knowledge Base", items.length],
    ["bulk", "Bulk Upload"],
    ["unanswered", "Unanswered", unanswered.length],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <nav className="card h-fit p-2">
        {tabs.map(([k, l, count]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] font-medium ${tab === k ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-canvas"}`}>
            {l}
            {typeof count === "number" && count > 0 ? <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-bold text-ink-3">{count}</span> : null}
          </button>
        ))}
      </nav>
      <div>
        {tab === "settings" ? <ChatbotSettingsForm initial={cfg} /> : null}
        {tab === "kb" ? <KnowledgeEditor items={items} prefillQuestion={prefill} /> : null}
        {tab === "bulk" ? <BulkUploadKnowledge /> : null}
        {tab === "unanswered" ? <UnansweredList rows={unanswered} onCreateFaq={(q) => { setPrefill(q); setTab("kb"); }} /> : null}
      </div>
    </div>
  );
}
