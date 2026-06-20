import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Ban, Database, AlertTriangle, Scale, Mail, Lock } from "lucide-react";

const sections = [
  {
    id: "no-resale",
    icon: Ban,
    title: "No Resale or Redistribution",
    short: "Cannot be sold or transferred",
    content:
      "This software, BicepsApp, is proprietary and licensed exclusively for internal use by Wreck & Build Ladies & Gents Fitness Gym, Nazimabad No. 5, Karachi. You may not sell, sublicense, rent, lease, transfer, or otherwise commercially exploit this software or any portion of it to any third party under any circumstances.",
  },
  {
    id: "no-copy",
    icon: Lock,
    title: "Restricted Modification & Copying",
    short: "No reverse engineering or cloning",
    content:
      "You may not copy, modify, reverse-engineer, decompile, disassemble, or create derivative works based on this software without the explicit written permission of the original developer (Konete326). Unauthorized reproduction of any part of this codebase is strictly prohibited.",
  },
  {
    id: "no-data-liability",
    icon: Database,
    title: "No Liability for Data Loss",
    short: "Developer not responsible for data",
    content:
      "The developer(s) and creator(s) of BicepsApp are not responsible for any loss, corruption, or unauthorized access to data stored within the system. This includes but is not limited to: accidental deletion, database failure, server downtime, network interruptions, or third-party service outages (MongoDB Atlas, Cloudinary, Twilio). It is the sole responsibility of the operator to maintain regular data backups.",
  },
  {
    id: "no-warranty",
    icon: AlertTriangle,
    title: "No Warranty",
    short: "Software provided as-is",
    content:
      'This software is provided "as is", without warranty of any kind — express or implied. The developers make no representations or warranties regarding the accuracy, reliability, completeness, or suitability of the software for any particular purpose. Use of this software is entirely at your own risk.',
  },
  {
    id: "liability-limit",
    icon: Scale,
    title: "Limitation of Liability",
    short: "No claims for financial damages",
    content:
      "In no event shall the developers, contributors, or any affiliated parties be held liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from the use or inability to use this software — even if advised of the possibility of such damages. This includes financial loss, data loss, or operational disruption.",
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact & Permission Requests",
    short: "For licensing inquiries",
    content:
      "For licensing inquiries, permission to deploy at additional locations, or authorized modifications, please contact the developer directly through the GitHub profile at github.com/Konete326. Unauthorized use beyond the scope of this license will be subject to applicable legal remedies.",
  },
];

export default function License() {
  const [selected, setSelected] = useState(sections[0]);

  const Icon = selected.icon;

  return (
    <div className="flex h-full">

      {/* ── LEFT PANEL: section list ──────────────────────────────────── */}
      <div className="w-56 shrink-0 border-r border-stone-100 flex flex-col">
        <div className="px-4 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-stone-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-stone-500">
              License
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-2">
            {sections.map((section, idx) => {
              const SIcon = section.icon;
              const isActive = selected.id === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelected(section)}
                  className={`w-full text-left px-4 py-3 border-b border-stone-50 transition-colors ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : "hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <SIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-stone-300" : "text-stone-400"}`} />
                    <span className={`text-[11px] font-black leading-tight ${isActive ? "text-white" : "text-stone-800"}`}>
                      {String(idx + 1).padStart(2, "0")}. {section.title.split(" ").slice(0, 3).join(" ")}
                    </span>
                  </div>

                </button>
              );
            })}
          </div>
        </ScrollArea>


      </div>

      {/* ── RIGHT PANEL: selected clause detail ──────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-6 lg:p-10 max-w-2xl">

            {/* Clause header */}
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-stone-100">
              <div className="h-12 w-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-stone-700" />
              </div>
              <div>
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">
                  Section {String(sections.findIndex(s => s.id === selected.id) + 1).padStart(2, "0")}
                </p>
                <h2 className="text-xl font-black text-stone-900 leading-tight">{selected.title}</h2>
                <p className="text-xs text-stone-400 font-medium mt-1">{selected.short}</p>
              </div>
            </div>

            {/* Clause body */}
            <div className="prose-none">
              <p className="text-[13px] text-stone-700 font-medium leading-7">{selected.content}</p>
            </div>

            {/* Effective note */}
            <div className="mt-10 px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-stone-400 shrink-0" />
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wide">
                Effective June 2026 · BicepsApp Proprietary License v1.0 · Konete326
              </p>
            </div>
          </div>
        </ScrollArea>


      </div>

    </div>
  );
}
