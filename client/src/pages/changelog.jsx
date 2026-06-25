import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Wrench, Bug } from "lucide-react";
import logoUrl from "@/assets/logo.png";

// ─── Add real changelog entries here when updates happen ───────────────────
const changelog = [
  {
    version: "v1.3.0",
    date: "June 2026",
    label: "latest",
    summary: "Dynamic Trainer Permissions and Dedicated System Access",
    changes: [
      { type: "feature",     text: "Dedicated System Access Management page for creating admin and trainer logins" },
      { type: "feature",     text: "2-step account creation wizard for assigning granular permissions to staff" },
      { type: "feature",     text: "Dynamic Sidebar that only shows modules the logged-in trainer has permission for" },
      { type: "feature",     text: "System Access accounts can now be directly edited (Password, Role, Permissions)" },
      { type: "improvement", text: "Protected the Main Admin account from accidental deletion or modification" },
      { type: "improvement", text: "Refactored the Trainer HR form to separate basic profile data from System Login access" },
    ],
  },
  {
    version: "v1.2.0",
    date: "June 2026",
    label: "stable",
    summary: "Reports rebuild, footer update & changelog branding",
    changes: [
      { type: "feature",     text: "Reports page completely rebuilt with real live data from database" },
      { type: "feature",     text: "New dedicated /api/reports backend endpoint with 7 aggregated queries" },
      { type: "feature",     text: "Reports now shows: Total Revenue, This Month, Today's Revenue stats" },
      { type: "feature",     text: "Member status breakdown (Active/Expired/Frozen) with progress bars" },
      { type: "feature",     text: "Payment method split — Cash, Cheque, UPI etc. with PKR totals" },
      { type: "feature",     text: "6-month revenue trend bar chart added to reports" },
      { type: "feature",     text: "Recent payments table with Serial No, Member, Method, Date & Amount" },
      { type: "improvement", text: "Footer updated — credit now shows 'elitedevagency'" },
      { type: "improvement", text: "Logo visible in Changelog header, empty state & version detail view" },
    ],
  },
  {
    version: "v1.1.0",
    date: "June 2026",
    label: "stable",
    summary: "Logo integration, branding polish & CORS fix",
    changes: [
      { type: "feature",     text: "Official BicepsApp logo now displayed in the sidebar next to the app name" },
      { type: "feature",     text: "Logo added to Sign In page header for a branded login experience" },
      { type: "feature",     text: "Logo added to Sign Up page header for consistent auth branding" },
      { type: "feature",     text: "Logo added to About page hero banner with frosted glass tile effect" },
      { type: "feature",     text: "Logo shown in Changelog panel header, empty state, and version detail view" },
      { type: "feature",     text: "App favicon updated to use the official BicepsApp logo" },
      { type: "improvement", text: "Logo file renamed from 'logo (2).png' to 'logo.png' to avoid URL encoding issues in production" },
      { type: "improvement", text: "All logo references across the codebase updated to use the clean filename" },
      { type: "fix",         text: "Fixed CORS policy error blocking API requests from localhost during development" },
      { type: "fix",         text: "Backend now properly handles OPTIONS preflight requests on Vercel serverless" },
      { type: "fix",         text: "Fixed broken fallback logo path in the Gym Profile page" },
    ],
  },
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
            <img src={logoUrl} alt="BicepsApp" className="h-5 w-5 object-contain" />
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
            <div className="h-20 w-20 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center shadow-sm">
              <img src={logoUrl} alt="BicepsApp" className="h-12 w-12 object-contain opacity-40" />
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
                <div className="flex items-center gap-3 mb-3">
                  <img src={logoUrl} alt="BicepsApp" className="h-8 w-8 object-contain" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">BicepsApp</span>
                </div>
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
