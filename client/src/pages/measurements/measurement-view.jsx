import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Scale, Activity, HeartPulse, Ruler, TrendingUp, TrendingDown, Minus, User, CalendarDays } from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const METRIC_CONFIG = [
  { key: "weight", label: "Weight", unit: "kg", icon: Scale },
  { key: "bicep", label: "Bicep", unit: "in", icon: Activity },
  { key: "chest", label: "Chest", unit: "in", icon: HeartPulse },
  { key: "waist", label: "Waist", unit: "in", icon: Ruler },
  { key: "shoulder", label: "Shoulder", unit: "in", icon: Activity },
  { key: "calf", label: "Calf", unit: "in", icon: Ruler },
  { key: "leg", label: "Leg", unit: "in", icon: Activity },
];

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
}

function buildMonthlyBuckets(data) {
  const allDates = new Set();
  const historyKeys = METRIC_CONFIG.map((m) => `${m.key}History`);

  historyKeys.forEach((hKey) => {
    const arr = data[hKey] || [];
    arr.forEach((entry) => allDates.add(getMonthKey(entry.date)));
  });

  const sortedMonths = [...allDates].sort().reverse();

  return sortedMonths.map((monthKey) => {
    const [yearStr, monthStr] = monthKey.split("-");
    const year = parseInt(yearStr);
    const monthIdx = parseInt(monthStr);

    const metrics = {};
    METRIC_CONFIG.forEach((m) => {
      const arr = data[`${m.key}History`] || [];
      const entries = arr.filter((e) => getMonthKey(e.date) === monthKey);
      if (entries.length > 0) {
        metrics[m.key] = entries[entries.length - 1].value;
      }
    });

    return { monthKey, year, monthIdx, metrics, entryCount: Object.keys(metrics).length };
  });
}

function DeltaBadge({ current, previous }) {
  if (previous == null || current == null) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-stone-400">
        <Minus size={10} /> 0
      </span>
    );
  }
  const isUp = diff > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isUp ? "+" : ""}{diff.toFixed(1)}
    </span>
  );
}

function MonthCard({ bucket, prevBucket, isCurrentMonth }) {
  const hasAnyData = bucket.entryCount > 0;
  const Icon = CalendarDays;

  return (
    <Card className={`border shadow-sm flex flex-col ${isCurrentMonth ? "border-stone-400 ring-1 ring-stone-200" : "border-stone-200"}`}>
      <div className={`px-4 py-2.5 border-b flex items-center justify-between rounded-t-lg ${isCurrentMonth ? "bg-stone-800 text-white border-stone-800" : "bg-stone-50 border-stone-100"}`}>
        <div className="flex items-center gap-2">
          <Icon size={13} className={isCurrentMonth ? "text-stone-300" : "text-stone-400"} />
          <span className={`text-sm font-bold uppercase tracking-wide ${isCurrentMonth ? "text-white" : "text-stone-700"}`}>
            {FULL_MONTH_NAMES[bucket.monthIdx]} {bucket.year}
          </span>
        </div>
        {isCurrentMonth && (
          <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">Current</span>
        )}
      </div>
      <CardContent className="p-3 flex-1">
        {!hasAnyData ? (
          <div className="flex items-center justify-center h-full text-stone-400 text-xs italic py-6">No data recorded</div>
        ) : (
          <div className="space-y-1.5">
            {METRIC_CONFIG.map((m) => {
              const currentVal = bucket.metrics[m.key];
              const prevVal = prevBucket?.metrics?.[m.key];
              if (currentVal == null) return null;
              const MetricIcon = m.icon;
              return (
                <div key={m.key} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-stone-50 transition-colors group">
                  <div className="flex items-center gap-2 min-w-0">
                    <MetricIcon size={12} className="text-stone-400 group-hover:text-stone-600 transition-colors shrink-0" />
                    <span className="text-xs font-medium text-stone-600 group-hover:text-stone-800 transition-colors">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {prevVal != null && (
                      <span className="text-[10px] text-stone-400 line-through">{prevVal}{m.unit}</span>
                    )}
                    <span className="text-sm font-bold text-stone-900">{currentVal}<span className="text-[10px] font-normal text-stone-400 ml-0.5">{m.unit}</span></span>
                    <DeltaBadge current={currentVal} previous={prevVal} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MeasurementView() {
  const { id } = useParams();

  const { data: measurement, isLoading } = useQuery({
    queryKey: ["measurement-view", id],
    queryFn: async () => {
      const res = await API.get(`/measurements/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const { data: members } = useQuery({
    queryKey: ["members-for-view"],
    queryFn: async () => {
      const res = await API.get("/members");
      return res.data.data || [];
    },
  });

  const member = useMemo(() => {
    if (!measurement || !members) return null;
    if (typeof measurement.memberId === "object") return measurement.memberId;
    return members.find((m) => m._id === measurement.memberId) || null;
  }, [measurement, members]);

  const monthlyBuckets = useMemo(() => {
    if (!measurement) return [];
    return buildMonthlyBuckets(measurement);
  }, [measurement]);

  const currentMonthKey = getMonthKey(new Date().toISOString());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="animate-spin text-stone-400 h-6 w-6" />
      </div>
    );
  }

  if (!measurement) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link to="/measurements">
            <Button variant="outline" size="sm" className="text-stone-500">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-stone-900 font-outfit uppercase">No Data Found</h1>
            <p className="text-stone-500 text-sm">No measurement records exist for this member.</p>
          </div>
        </div>
      </div>
    );
  }

  const latestWeight = measurement.weightHistory?.[measurement.weightHistory.length - 1]?.value || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/measurements">
          <Button variant="outline" size="sm" className="text-stone-500 rounded-lg">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="h-6 w-px bg-stone-200" />
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
            <User size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-stone-900 font-outfit uppercase truncate">
              {member?.fullName || "Unknown Member"}
            </h2>
            <div className="flex items-center gap-2.5 text-[11px] text-stone-500">
              <span>Roll: <span className="font-semibold text-stone-700">{member?.rollNo || "-"}</span></span>
              <span>Age: <span className="font-semibold text-stone-700">{measurement.age || "-"}</span></span>
              <span>Height: <span className="font-semibold text-stone-700">{measurement.heightFeetInches || "-"} ft</span></span>
              <span>Weight: <span className="font-semibold text-stone-700">{latestWeight} kg</span></span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                measurement.bmiCategory === "Normal" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                measurement.bmiCategory === "Underweight" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                BMI: {measurement.bmiCategory}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {monthlyBuckets.map((bucket, idx) => {
          const prevBucket = idx < monthlyBuckets.length - 1 ? monthlyBuckets[idx + 1] : null;
          const isCurrentMonth = bucket.monthKey === currentMonthKey;
          return (
            <MonthCard
              key={bucket.monthKey}
              bucket={bucket}
              prevBucket={prevBucket}
              isCurrentMonth={isCurrentMonth}
            />
          );
        })}
      </div>

      {monthlyBuckets.length === 0 && (
        <div className="flex items-center justify-center py-16 text-stone-400 text-sm italic">
          No monthly records found.
        </div>
      )}
    </div>
  );
}
