import { Shield, AlertTriangle, Ban, Database, Scale, Mail } from "lucide-react";

const sections = [
  {
    icon: Ban,
    title: "No Resale or Redistribution",
    content:
      "This software, BicepsApp, is proprietary and licensed exclusively for internal use by Wreck & Build Ladies & Gents Fitness Gym, Nazimabad No. 5, Karachi. You may not sell, sublicense, rent, lease, transfer, or otherwise commercially exploit this software or any portion of it to any third party under any circumstances.",
  },
  {
    icon: Shield,
    title: "Restricted Modification & Copying",
    content:
      "You may not copy, modify, reverse-engineer, decompile, disassemble, or create derivative works based on this software without the explicit written permission of the original developer (Konete326). Unauthorized reproduction of any part of this codebase is strictly prohibited.",
  },
  {
    icon: Database,
    title: "No Liability for Data Loss",
    content:
      "The developer(s) and creator(s) of BicepsApp are not responsible for any loss, corruption, or unauthorized access to data stored within the system. This includes but is not limited to: accidental deletion, database failure, server downtime, network interruptions, or third-party service outages (MongoDB Atlas, Cloudinary, Twilio). It is the sole responsibility of the operator to maintain regular data backups.",
  },
  {
    icon: AlertTriangle,
    title: "No Warranty",
    content:
      "This software is provided \"as is\", without warranty of any kind — express or implied. The developers make no representations or warranties regarding the accuracy, reliability, completeness, or suitability of the software for any particular purpose. Use of this software is entirely at your own risk.",
  },
  {
    icon: Scale,
    title: "Limitation of Liability",
    content:
      "In no event shall the developers, contributors, or any affiliated parties be held liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from the use or inability to use this software — even if advised of the possibility of such damages. This includes financial loss, data loss, or operational disruption.",
  },
  {
    icon: Mail,
    title: "Contact & Permission Requests",
    content:
      "For licensing inquiries, permission to deploy at additional locations, or authorized modifications, please contact the developer directly through the GitHub profile at github.com/Konete326. Unauthorized use beyond the scope of this license will be subject to applicable legal remedies.",
  },
];

export default function License() {
  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center shrink-0">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900 leading-tight">License & Legal</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Proprietary Software License — BicepsApp · Wreck & Build Fitness Gym
          </p>
        </div>
      </div>

      {/* Effective date banner */}
      <div className="mb-6 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-black shrink-0" />
        <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
          Effective Date: June 2026 &nbsp;·&nbsp; Version: 1.0 &nbsp;·&nbsp; Developer: Konete326
        </p>
      </div>

      {/* Preamble */}
      <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50">
        <p className="text-[12px] text-amber-900 font-medium leading-relaxed">
          <span className="font-black uppercase">Important:</span> By installing, accessing, or using BicepsApp,
          you agree to be fully bound by the terms of this license. If you do not agree with any of these terms,
          you must immediately discontinue all use of this software.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-stone-100 bg-white hover:border-stone-200 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-stone-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[13px] font-bold text-stone-900">{section.title}</h3>
                  </div>
                  <p className="text-[12px] text-stone-600 font-medium leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer notice */}
      <div className="mt-8 p-4 rounded-xl border border-stone-900 bg-stone-900 text-center">
        <p className="text-[11px] text-stone-300 font-medium leading-relaxed">
          This software is the intellectual property of <span className="text-white font-black">Konete326</span> and is
          protected under applicable software copyright laws. All rights reserved. Unauthorized use, duplication,
          or distribution of this software may result in severe civil and criminal penalties.
        </p>
        <p className="text-[10px] text-stone-500 mt-2 font-bold uppercase tracking-wider">
          © 2026 BicepsApp · Wreck & Build Fitness Gym · All Rights Reserved
        </p>
      </div>
    </div>
  );
}
