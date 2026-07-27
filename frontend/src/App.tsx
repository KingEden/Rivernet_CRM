import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import LeadFinder from "./pages/LeadFinder";
import OutreachQueue from "./pages/OutreachQueue";
import Settings from "./pages/Settings";
import InfoDeck from "./pages/InfoDeck";
import WebsitePackages from "./pages/WebsitePackages";
import { api, getAuthToken, logout } from "./api";
import logoPng from "./assets/logo.png";
import { 
  UsersIcon, 
  CogIcon, 
  SparklesIcon, 
  LightBulbIcon,
  GlobeIcon,
  CurrencyDollarIcon
} from "./components/Icons";

export default function App() {
  // Standalone public share link routing
  const pathname = window.location.pathname;
  if (pathname.startsWith("/share/report/")) {
    const token = pathname.split("/").pop() || "";
    return <PublicReportShare token={token} />;
  }
  if (pathname.startsWith("/share/meeting/")) {
    const token = pathname.split("/").pop() || "";
    return <PublicMeetingBriefShare token={token} />;
  }
  if (pathname === "/packages" || pathname === "/pricing" || pathname === "/public/packages" || pathname === "/public/pricing") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <WebsitePackages />
        </div>
      </div>
    );
  }

  const [token, setToken] = useState<string | null>(getAuthToken());
  const [currentTab, setCurrentTab] = useState<"dashboard" | "finder" | "queue" | "packages" | "deck" | "settings">("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("rivernet_dark") === "true";
  });

  // Sync dark mode class
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("rivernet_dark", "true");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("rivernet_dark", "false");
    }
  }, [darkMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (isRegister) {
        await api.register(email, password);
      } else {
        await api.login(email, password);
      }
      setToken(getAuthToken());
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Authentication failed. Make sure the Python server is running.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setToken(null);
  };

  // If user is not authenticated, show premium glassmorphism Login/Register card
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200 grid-bg relative overflow-hidden font-sans">
        
        {/* Decorative background glow spheres */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"></div>

        <div className="w-full max-w-md glass-panel rounded-3xl shadow-xl p-8 border border-slate-200/40 dark:border-slate-850 relative z-10">
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src={logoPng} alt="Rivernet Logo" className="h-16 w-auto" />
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">Rivernet Prospector</h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center leading-normal">
              Target agencies lead-generation, technical auditing, and marketing analytics platform.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-550 uppercase">Agency Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="you@agency.com"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-550 uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {authError && (
              <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20 text-xs text-red-650 dark:text-red-400">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-500 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50"
            >
              {authLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span>{isRegister ? "Create Account" : "Access Workspace"}</span>
              )}
            </button>
          </form>

          {/* Toggle Register/Login link */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {isRegister ? "Already registered?" : "New to Rivernet?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-brand-500 font-bold hover:underline"
            >
              {isRegister ? "Log In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] flex transition-colors duration-200 font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 border-r border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-[#0a0e1a] flex flex-col shrink-0">
        
        {/* App Title */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/80 space-x-3">
          <img src={logoPng} alt="Rivernet Logo" className="h-8 w-auto shrink-0" />
          <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight truncate">Rivernet Prospector</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarNavButton
            active={currentTab === "dashboard"}
            onClick={() => setCurrentTab("dashboard")}
            label="Insights Dashboard"
            icon={<SparklesIcon className="h-5 w-5" />}
          />
          <SidebarNavButton
            active={currentTab === "finder"}
            onClick={() => setCurrentTab("finder")}
            label="Lead Discovery"
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <SidebarNavButton
            active={currentTab === "queue"}
            onClick={() => setCurrentTab("queue")}
            label="Outreach CRM"
            icon={<LightBulbIcon className="h-5 w-5" />}
          />
          <SidebarNavButton
            active={currentTab === "packages"}
            onClick={() => setCurrentTab("packages")}
            label="Service Packages"
            icon={<CurrencyDollarIcon className="h-5 w-5" />}
          />
          <SidebarNavButton
            active={currentTab === "deck"}
            onClick={() => setCurrentTab("deck")}
            label="AI & Platform Deck"
            icon={<GlobeIcon className="h-5 w-5" />}
          />
          <SidebarNavButton
            active={currentTab === "settings"}
            onClick={() => setCurrentTab("settings")}
            label="Settings & Setup"
            icon={<CogIcon className="h-5 w-5" />}
          />
        </nav>

        {/* Footer controls & Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
          {/* Light/Dark Toggle */}
          <div className="flex items-center justify-between bg-slate-100/70 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-2 uppercase tracking-wider text-[10px]">Theme</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center space-x-1.5 rounded-xl px-3 py-1 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-500/40 transition-colors"
            >
              <span>{darkMode ? "🌙 Dark" : "☀️ Light"}</span>
            </button>
          </div>

          {/* User Signout */}
          <div className="flex items-center justify-between text-xs px-2">
            <span className="text-slate-400 dark:text-slate-500 truncate max-w-[120px] text-[11px]">
              {JSON.parse(localStorage.getItem("rivernet_user") || "{}").email || "demo@rivernet.io"}
            </span>
            <button 
              onClick={handleLogout}
              className="font-bold text-rose-500 hover:text-rose-400 hover:underline text-[11px]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT WINDOW */}
      <main className="flex-1 overflow-y-auto h-screen grid-bg">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {currentTab === "dashboard" && <Dashboard />}
          {currentTab === "finder" && <LeadFinder />}
          {currentTab === "queue" && <OutreachQueue />}
          {currentTab === "packages" && <WebsitePackages />}
          {currentTab === "deck" && <InfoDeck />}
          {currentTab === "settings" && <Settings />}
        </div>
      </main>

    </div>
  );
}

// Subcomponent: SidebarNavButton
interface SidebarNavButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

function SidebarNavButton({ active, onClick, label, icon }: SidebarNavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-brand-500 to-cyan-500 text-white shadow-md shadow-brand-500/25"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-850/80 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Standalone Public Share View Components
function PublicReportShare({ token }: { token: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPublicLeadReport(token)
      .then(res => setData(res))
      .catch(err => setError(err.message || "Failed to load public report"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 font-sans">
        <div className="max-w-md w-full glass-panel rounded-2xl p-6 text-center space-y-4 border border-red-500/20 bg-slate-900">
          <h2 className="text-xl font-bold text-red-500">Share Link Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  const { report, lead_name, category, address, website_url } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-900 dark:text-white max-w-4xl mx-auto space-y-8 print:p-0 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center space-x-3">
          <img src={logoPng} alt="Rivernet Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Rivernet Prospector</h1>
            <span className="text-xs text-slate-400">Public Audit Report</span>
          </div>
        </div>

        <button 
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md hover:bg-brand-500 transition-colors print:hidden"
        >
          🖨️ Export PDF / Print
        </button>
      </div>

      {/* Prospect Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-500">{category}</span>
        <h2 className="text-3xl font-extrabold">{lead_name}</h2>
        <p className="text-xs text-slate-400">{address} {website_url ? `• ${website_url}` : ""}</p>
      </div>

      {/* Summary */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Executive Audit Summary</h3>
        <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-300">{report.executive_summary}</p>
      </div>

      {/* Dials */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">Website Quality</span>
          <span className="block mt-2 text-3xl font-extrabold text-brand-500">{report.website_quality_score}/100</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">SEO Optimization</span>
          <span className="block mt-2 text-3xl font-extrabold text-indigo-500">{report.seo_score}/100</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">GBP Profile Score</span>
          <span className="block mt-2 text-3xl font-extrabold text-cyan-500">{report.gbp_optimization_score}/100</span>
        </div>
      </div>

      {/* Benchmarking Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Local Competitor Benchmarking</h3>
        <p className="text-xs text-slate-500 italic">{report.disclaimer}</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2">Business Name</th>
                <th className="pb-2">Quality</th>
                <th className="pb-2">SEO</th>
                <th className="pb-2">Reviews</th>
                <th className="pb-2">Rating</th>
                <th className="pb-2">Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              <tr className="font-bold text-brand-600 dark:text-brand-400 bg-brand-500/5">
                <td className="py-3 px-1">{lead_name} (Prospect)</td>
                <td className="py-3">{report.website_quality_score}/100</td>
                <td className="py-3">{report.seo_score}/100</td>
                <td className="py-3">{data.reviews_count || 0}</td>
                <td className="py-3">{data.rating || 0} ★</td>
                <td className="py-3">{report.website_analysis.performance_score} Score</td>
              </tr>
              {report.competitors && report.competitors.map((comp: any, i: number) => (
                <tr key={i} className="text-slate-650 dark:text-slate-350">
                  <td className="py-3 px-1 font-semibold">{comp.name}</td>
                  <td className="py-3">{comp.website_quality}/100</td>
                  <td className="py-3">{comp.seo}/100</td>
                  <td className="py-3">{comp.reviews}</td>
                  <td className="py-3">{comp.rating} ★</td>
                  <td className="py-3">{comp.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
          {report.competitor_explanation}
        </p>
      </div>

      <div className="text-center text-xs text-slate-400 pt-6 border-t border-slate-200 dark:border-slate-800">
        Generated by Rivernet Prospector Sales Intelligence Engine. All data gathered from legitimate public directories in compliance with applicable terms of service.
      </div>
    </div>
  );
}

function PublicMeetingBriefShare({ token }: { token: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPublicMeetingBrief(token)
      .then(res => setData(res))
      .catch(err => setError(err.message || "Failed to load public meeting brief"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 font-sans">
        <div className="max-w-md w-full glass-panel rounded-2xl p-6 text-center space-y-4 border border-red-500/20 bg-slate-900">
          <h2 className="text-xl font-bold text-red-500">Brief Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  const { brief, lead_name } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-900 dark:text-white max-w-4xl mx-auto space-y-8 print:p-0 print:bg-white print:text-black">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center space-x-3">
          <img src={logoPng} alt="Rivernet Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Rivernet Prospector</h1>
            <span className="text-xs text-slate-400">Meeting Preparation Brief</span>
          </div>
        </div>

        <button 
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md hover:bg-brand-500 transition-colors print:hidden"
        >
          🖨️ Export PDF / Print
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-500">{brief.industry}</span>
        <h2 className="text-3xl font-extrabold">{lead_name}</h2>
        <p className="text-xs text-slate-400">{brief.business_overview}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2 text-xs">
          <span className="font-bold text-red-500 uppercase">Vulnerabilities</span>
          <ul className="list-disc list-inside space-y-1 text-slate-650 dark:text-slate-300">
            {brief.biggest_weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-2 text-xs">
          <span className="font-bold text-green-500 uppercase">Pitch Opportunities</span>
          <ul className="list-disc list-inside space-y-1 text-slate-650 dark:text-slate-300">
            {brief.strongest_opportunities.map((o: string, i: number) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
