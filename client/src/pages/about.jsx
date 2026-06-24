import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 p-6">
      <div className="bg-stone-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 w-24 h-24 rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-2xl flex items-center justify-center backdrop-blur-sm">
            <img src="/logo.png" alt="BicepsApp Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold mb-4 font-outfit uppercase">Wreck & Build Gym</h1>
          <p className="text-stone-400 max-w-2xl mx-auto text-lg">
            BicepsApp digitizes workflows for Nazimabad's premier fitness destination, ensuring seamless membership tracks, payments, and progress.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800 rounded-full -mr-32 -mt-32 opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-stone-200 shadow-sm">
          <CardHeader>
            <Users className="w-8 h-8 text-stone-800 mb-2" />
            <CardTitle className="text-xl">Trainers</CardTitle>
          </CardHeader>
          <CardContent className="text-stone-600 text-sm leading-relaxed">
            Professional coaches guiding members through personalized daily workout splits and nutrition targets.
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm">
          <CardHeader>
            <Target className="w-8 h-8 text-stone-800 mb-2" />
            <CardTitle className="text-xl">Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-stone-600 text-sm leading-relaxed">
            Transition physical paperwork and register files to real-time status matrix databases to avoid errors.
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm">
          <CardHeader>
            <ShieldCheck className="w-8 h-8 text-stone-800 mb-2" />
            <CardTitle className="text-xl">Values</CardTitle>
          </CardHeader>
          <CardContent className="text-stone-600 text-sm leading-relaxed">
            Precision, reliability, and modern aesthetic. Ensuring gym audits and payment logs are secure.
          </CardContent>
        </Card>
      </div>

      <Card className="border-stone-200 overflow-hidden shadow-sm">
        <div className="bg-stone-50 p-8 border-b border-stone-200">
          <h2 className="text-2xl font-bold text-stone-800">Our Digital Evolution</h2>
        </div>
        <CardContent className="p-8 space-y-4 text-stone-700 text-sm leading-relaxed">
          <p>
            Wreck & Build Ladies & Gents Fitness Gym is shifting its manual administration—membership grid books, physical receipts, body metrics tracker sheets, and advance payment ledgers—into a unified cloud network.
          </p>
          <p>
            By consolidating member dues and progress trajectories under BicepsApp, we keep fitness paths transparent and structured.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
