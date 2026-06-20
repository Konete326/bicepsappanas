import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench, Bug, Rocket, Shield, Clock } from "lucide-react";

const changelog = [
  {
    version: "v1.3.0",
    date: "June 2026",
    label: "latest",
    type: "feature",
    changes: [
      { type: "feature", text: "Added Changelog page to track all system updates." },
      { type: "feature", text: "Added License page with proprietary usage restrictions." },
      { type: "feature", text: "Changelog icon added to header beside notification bell." },
    ],
  },
  {
    version: "v1.2.0",
    date: "June 2026",
    label: "stable",
    type: "feature",
    changes: [
      { type: "feature", text: "Automated WhatsApp billing alerts via Twilio integration." },
      { type: "feature", text: "Server-side scheduled jobs now run daily to check member renewal dates." },
      { type: "feature", text: "Dues outstanding calculation formula implemented in payment engine." },
      { type: "improvement", text: "12-month payment grid now fully dynamic and admin-controlled." },
    ],
  },
  {
    version: "v1.1.0",
    date: "June 2026",
    label: null,
    type: "improvement",
    changes: [
      { type: "feature", text: "Body measurement tracking with full history logs per member." },
      { type: "feature", text: "BMI auto-computation with category classification (Underweight / Normal / Overweight / Obesity)." },
      { type: "feature", text: "Workout routine and meal plan assignment per member." },
      { type: "improvement", text: "Measurement data logging standardized to 3rd of every month." },
      { type: "improvement", text: "Progress visualization charts rendered from historical measurement data." },
    ],
  },
  {
    version: "v1.0.0",
    date: "June 2026",
    label: null,
    type: "feature",
    changes: [
      { type: "feature", text: "Initial release of BicepsApp — Gym Management System." },
      { type: "feature", text: "Member registration with Roll No, full profile, plan link, and status tracking." },
      { type: "feature", text: "Digital receipt engine replacing manual receipt booklets." },
      { type: "feature", text: "Sequential Serial No generation with physical booklet continuity." },
      { type: "feature", text: "Trainer profiles, salary ledger, and advance payment tracking." },
      { type: "feature", text: "Net salary formula: Base + (Sessions × Rate) − Advance Balance." },
      { type: "feature", text: "JWT-secured single-admin authentication system." },
      { type: "feature", text: "MongoDB Atlas cloud database with Mongoose ODM." },
      { type: "feature", text: "Cloudinary integration for media and member photo uploads." },
      { type: "feature", text: "Notification bell with real-time system alerts." },
    ],
  },
];

const typeConfig = {
  feature: { icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50", label: "New" },
  improvement: { icon: Wrench, color: "text-blue-600", bg: "bg-blue-50", label: "Improved" },
  fix: { icon: Bug, color: "text-rose-600", bg: "bg-rose-50", label: "Fixed" },
};

const versionBadge = {
  latest: "bg-black text-white",
  stable: "bg-stone-100 text-stone-700",
};

export default function Changelog() {
  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900 leading-tight">Changelog</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            A complete record of every update, improvement, and fix made to BicepsApp.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-stone-200" />

          <div className="space-y-8 pl-12">
            {changelog.map((release, idx) => (
              <div key={idx} className="relative">
                {/* dot */}
                <div className="absolute -left-[33px] top-1 h-5 w-5 rounded-full bg-white border-2 border-black flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-black" />
                </div>

                {/* Version header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-black text-stone-900">{release.version}</span>
                  {release.label && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${versionBadge[release.label]}`}>
                      {release.label}
                    </span>
                  )}
                  <span className="text-[11px] text-stone-400 font-medium ml-auto">{release.date}</span>
                </div>

                {/* Changes list */}
                <div className="space-y-2">
                  {release.changes.map((change, cIdx) => {
                    const cfg = typeConfig[change.type];
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={cIdx}
                        className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 bg-white hover:border-stone-200 transition-colors"
                      >
                        <div className={`h-6 w-6 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                        </div>
                        <p className="text-[12px] text-stone-700 font-medium leading-relaxed">{change.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Origin marker */}
            <div className="relative pl-0 -ml-12 flex items-center gap-3 pt-2">
              <div className="h-5 w-5 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                <Rocket className="h-3 w-3 text-stone-500" />
              </div>
              <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Project Started</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
