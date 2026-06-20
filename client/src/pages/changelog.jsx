import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Wrench, Bug, Clock, Inbox } from "lucide-react";

// ─── Add real changelog entries here when updates happen ───────────────────
const changelog = [
  // Example shape — uncomment and fill when a real update is released:
  // {
  //   version: "v1.0.0",
  //   date: "June 2026",
  //   label: "latest",          // "latest" | "stable" | null
  //   summary: "Initial release",
  //   changes: [
  //     { type: "feature",     text: "..." },
  //     { type: "improvement", text: "..." },
  //     { type: "fix",         text: "..." },
  //   ],
  // },
];
// ────────────────────────────────────────────────────────────────────────────

const typeConfig = {
  feature:     { icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50",  label: "New"      },
  improvement: { icon: Wrench,   color: "text-blue-600",    bg: "bg-blue-50",     label: "Improved" },
  fix:         { icon: Bug,      color: "text-rose-600",    bg: "bg-rose-50",     label: "Fixed"    },
};

const labelStyle = {
  latest: "bg-stone-900 text-white",
  stable: "bg-stone-100 text-stone-600",
};

export default function Changelog() {
  const [selected, setSelected] = useState(changelog[0] ?? null);

  return (
    <div className="flex h-full">

      {/* ── LEFT PANEL: version list ─────────────────────────────────── */}
      <div className="w-56 shrink-0 border-r border-stone-100 flex flex-col">
        <div className="px-4 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-stone-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-stone-500">
              Changelog
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {changelog.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[11px] text-stone-400 font-medium">No releases yet</p>
            </div>
          ) : (
            <div className="py-2">
              {changelog.map((release, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelected(release)}
                  className={`w-full text-left px-4 py-3 border-b border-stone-50 transition-colors ${
                    selected?.version === release.version
                      ? "bg-stone-900 text-white"
                      : "hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] font-black">{release.version}</span>
                    {release.label && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          selected?.version === release.version
                            ? "bg-white/20 text-white"
                            : labelStyle[release.label]
                        }`}
                      >
                        {release.label}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[10px] font-medium truncate ${
                      selected?.version === release.version
                        ? "text-stone-300"
                        : "text-stone-400"
                    }`}
                  >
                    {release.summary}
                  </p>
                  <p
                    className={`text-[9px] mt-0.5 font-bold uppercase tracking-wide ${
                      selected?.version === release.version
                        ? "text-stone-400"
                        : "text-stone-300"
                    }`}
                  >
                    {release.date}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── RIGHT PANEL: selected version detail ─────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {changelog.length === 0 || !selected ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center">
              <Inbox className="h-6 w-6 text-stone-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-400">No updates yet</p>
              <p className="text-[11px] text-stone-300 mt-1 font-medium">
                Changelog entries will appear here as the system is updated.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-6 lg:p-8">
              {/* Version header */}
              <div className="mb-6 pb-5 border-b border-stone-100">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-stone-900">{selected.version}</h2>
                  {selected.label && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${labelStyle[selected.label]}`}>
                      {selected.label}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-stone-400 font-bold uppercase tracking-wider">
                  Released {selected.date}
                </p>
                {selected.summary && (
                  <p className="mt-2 text-sm text-stone-600 font-medium">{selected.summary}</p>
                )}
              </div>

              {/* Changes grouped by type */}
              {["feature", "improvement", "fix"].map((type) => {
                const items = selected.changes.filter((c) => c.type === type);
                if (!items.length) return null;
                const cfg = typeConfig[type];
                const Icon = cfg.icon;
                return (
                  <div key={type} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`h-6 w-6 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-stone-500">
                        {cfg.label}
                      </span>
                    </div>
                    <div className="space-y-2 pl-2">
                      {items.map((change, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="mt-[5px] h-1.5 w-1.5 rounded-full bg-stone-300 shrink-0" />
                          <p className="text-[12px] text-stone-700 font-medium leading-relaxed">
                            {change.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

    </div>
  );
}
