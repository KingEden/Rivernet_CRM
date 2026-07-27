import { useEffect, useState } from "react";
import { api } from "../api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { 
  UsersIcon, 
  FlameIcon, 
  SparklesIcon, 
  CurrencyDollarIcon,
  GlobeIcon,
  PaintBrushIcon,
  BoltIcon,
  ShieldExclamationIcon,
  ShareIcon
} from "../components/Icons";

interface DashboardStats {
  total_leads: number;
  hot_leads: number;
  average_score: number;
  pipeline_value: number;
  score_ranges: { name: string; count: number }[];
  categories: { name: string; value: number }[];
  crm_stats: Record<string, number>;
  crm_chart: { stage: string; leads: number }[];
  audit_stats: {
    no_website: number;
    poor_design: number;
    slow_speed: number;
    no_ssl: number;
    no_socials: number;
  };
}

const BRAND_COLORS = ["#1C7DE9", "#22CDED", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to connect to backend server. Make sure FastAPI server is running on http://localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-700 dark:text-red-400">
          <h3 className="font-bold text-lg">Connection Error</h3>
          <p className="mt-1 text-xs">{error}</p>
          <button 
            onClick={fetchStats}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-500 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Live Sales Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Rivernet <span className="bg-gradient-to-r from-brand-500 via-cyan-400 to-brand-600 bg-clip-text text-transparent">Prospector Dashboard</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time local business scan analytics, SEO audit telemetry, and agency deal pipeline.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Leads */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 shadow-sm hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads Found</p>
              <h4 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {stats?.total_leads}
              </h4>
            </div>
            <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-500 dark:bg-brand-500/20">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Hot Leads */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 shadow-sm border-l-4 border-l-rose-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Hot Leads (Score 90+)</p>
              <h4 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {stats?.hot_leads}
              </h4>
            </div>
            <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-500 dark:bg-rose-500/20 glow-brand">
              <FlameIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Avg Lead Score */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 shadow-sm hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Lead Score</p>
              <h4 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {stats?.average_score} <span className="text-xs font-medium text-slate-400">/ 100</span>
              </h4>
            </div>
            <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-500 dark:bg-cyan-500/20">
              <SparklesIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Sales Pipeline Value */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 shadow-sm border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Estimated Pipeline</p>
              <h4 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                ${stats?.pipeline_value.toLocaleString()}
              </h4>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500 dark:bg-emerald-500/20">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Score Distribution */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white text-base">AI Lead Score Distribution</h3>
            <p className="text-xs text-slate-400">Number of discovered businesses segmented by deal opportunity tiers.</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.score_ranges}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1C7DE9" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#22CDED" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(28, 125, 233, 0.06)' }} 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead categories (Pie Chart) */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white text-base">Discovered Categories</h3>
            <p className="text-xs text-slate-400">Breakdown of local industry types in database.</p>
          </div>

          <div className="relative flex h-72 items-center justify-center">
            {stats && stats.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No categories found yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CRM Pipeline Funnel */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white text-base">Outreach Pipeline Velocity</h3>
            <p className="text-xs text-slate-400">Aggregate lead status progression through CRM outreach stages.</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.crm_chart}>
                <defs>
                  <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C7DE9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22CDED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="stage" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="leads" stroke="#1C7DE9" strokeWidth={3} fillOpacity={1} fill="url(#colorFunnel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Website Vulnerability Scan Stats */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white text-base">Technical Defect Telemetry</h3>
            <p className="text-xs text-slate-400">Common technical vulnerabilities identified during crawler audits.</p>
          </div>
          
          <div className="space-y-3 pt-1">
            {/* Missing Website */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-rose-500/10 p-2 text-rose-500">
                  <GlobeIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Missing Website</span>
              </div>
              <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">
                {stats?.audit_stats.no_website}
              </span>
            </div>

            {/* Poor Design */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
                  <PaintBrushIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Poor Design Score</span>
              </div>
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                {stats?.audit_stats.poor_design}
              </span>
            </div>

            {/* Slow Load Speed */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-yellow-500/10 p-2 text-yellow-500">
                  <BoltIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Slow Loading Speed</span>
              </div>
              <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                {stats?.audit_stats.slow_speed}
              </span>
            </div>

            {/* Missing SSL */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-orange-500/10 p-2 text-orange-500">
                  <ShieldExclamationIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Insecure (No SSL)</span>
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
                {stats?.audit_stats.no_ssl}
              </span>
            </div>

            {/* Missing Socials */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-500">
                  <ShareIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Social Pages</span>
              </div>
              <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                {stats?.audit_stats.no_socials}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
