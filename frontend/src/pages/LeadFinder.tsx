import { useEffect, useState } from "react";
import { api } from "../api";
import LeadDetailDrawer from "../components/LeadDetailDrawer";
import LeadMapView from "../components/LeadMapView";
import { 
  SearchIcon, 
  CloudArrowDownIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from "../components/Icons";

const INDUSTRY_OPTIONS = [
  "Dental clinics",
  "Medical clinics",
  "Physiotherapy centers",
  "Chiropractors",
  "Law firms",
  "Accountants",
  "Real estate agencies",
  "Construction companies",
  "Home builders",
  "Roofing companies",
  "HVAC services",
  "Electricians",
  "Plumbers",
  "Cleaning companies",
  "Pest control services",
  "Landscaping companies",
  "Auto repair garages",
  "Car detailing businesses",
  "Towing companies"
];

export default function LeadFinder() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  // Search Form State
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("San Francisco");
  const [industry, setIndustry] = useState("Dental clinics");
  const [category, setCategory] = useState("");
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [crmFilter, setCrmFilter] = useState("all");
  const [starredOnly, setStarredOnly] = useState(false);
  
  // Selection State for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStage, setBulkStage] = useState("OUTREACHED");

  const [metroExpansion, setMetroExpansion] = useState(true);
  
  // Details Drawer
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search Step Milestones animation
  const searchMilestones = [
    "Contacting Google Places API to discover local business profiles...",
    "Crawling websites to detect SSL security, load latency, and forms...",
    "Scanning headers for analytics trackers and ad retargeting pixels...",
    "Running AI lead-scoring engine and pricing estimations...",
    "Drafting personalized outreach emails and call scripts..."
  ];

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    let interval: any;
    if (searching) {
      setSearchStep(0);
      interval = setInterval(() => {
        setSearchStep((prev) => (prev < searchMilestones.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setSearchStep(0);
    }
    return () => clearInterval(interval);
  }, [searching]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await api.listLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !industry) {
      alert("Please specify a city and industry to search.");
      return;
    }
    try {
      setSearching(true);
      const results = await api.searchLeads({
        country,
        city,
        industry,
        category,
        metro_expansion: metroExpansion
      });
      setLeads(results);
      setSelectedIds([]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to search leads. Ensure the backend is active.");
    } finally {
      setSearching(false);
    }
  };

  const handleToggleFavorite = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.toggleFavorite(id);
      setLeads(leads.map(l => l.id === id ? { ...l, is_favorite: updated.is_favorite } : l));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this lead?")) return;
    try {
      await api.deleteLead(id);
      setLeads(leads.filter(l => l.id !== id));
      setSelectedIds(selectedIds.filter(i => i !== id));
      if (selectedLeadId === id) {
        setIsDrawerOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete lead");
    }
  };

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredLeads.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkUpdateCRM = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.bulkUpdateCRM(selectedIds, bulkStage);
      setLeads(leads.map(l => selectedIds.includes(l.id) ? { ...l, crm_status: bulkStage } : l));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert("Failed to perform bulk CRM update");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected leads?`)) return;
    try {
      await api.bulkDeleteLeads(selectedIds);
      setLeads(leads.filter(l => !selectedIds.includes(l.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected leads");
    }
  };

  const handleExport = (format: string) => {
    const exportUrl = api.getExportUrl(format, {
      crm_status: crmFilter !== "all" ? crmFilter : undefined,
      lead_status: scoreFilter !== "all" ? scoreFilter : undefined
    });
    const link = document.createElement("a");
    link.href = exportUrl;
    link.setAttribute("download", `rivernet_leads.${format === "excel" ? "xlsx" : format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter computation
  const filteredLeads = leads.filter(l => {
    if (starredOnly && !l.is_favorite) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = l.name?.toLowerCase().includes(q);
      const matchAddr = l.address?.toLowerCase().includes(q);
      const matchCat = l.category?.toLowerCase().includes(q);
      if (!matchName && !matchAddr && !matchCat) return false;
    }
    
    if (websiteFilter !== "all") {
      const hasWeb = l.has_website;
      if (websiteFilter === "yes" && !hasWeb) return false;
      if (websiteFilter === "no" && hasWeb) return false;
    }
    
    if (scoreFilter !== "all") {
      const score = l.lead_score || 0;
      const status = (l.lead_status || "").toLowerCase();
      if ((scoreFilter === "tier1" || scoreFilter === "hot") && score < 90 && !status.includes("hot")) return false;
      if ((scoreFilter === "tier2" || scoreFilter === "warm") && (score < 70 || score >= 90) && !status.includes("warm")) return false;
      if ((scoreFilter === "tier3" || scoreFilter === "medium") && (score < 50 || score >= 70) && !status.includes("medium")) return false;
      if ((scoreFilter === "tier4" || scoreFilter === "low") && score >= 50 && !status.includes("low")) return false;
    }
    
    if (ratingFilter > 0) {
      if (!l.rating || l.rating < ratingFilter) return false;
    }
    
    if (crmFilter !== "all") {
      if (l.crm_status !== crmFilter) return false;
    }
    
    return true;
  });

  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedIds.includes(l.id));

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Lead Discovery & Audit</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Discover and audit local business prospects to capture web design & SEO retainers.</p>
        </div>

        {/* Toolbar & View Tabs */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* View mode toggle tabs */}
          <div className="flex items-center bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-800 text-brand-500 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              📋 List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "bg-white dark:bg-slate-800 text-brand-500 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              📍 Geo Map
            </button>
          </div>

          <button
            onClick={fetchLeads}
            className="flex items-center space-x-1.5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors shadow-sm"
          >
            <span>📁 View All Leads</span>
          </button>
          
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase ml-1">Export:</span>
          
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            <CloudArrowDownIcon className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Discovery Search Panel */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border-t-2 border-t-brand-500 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
            <SearchIcon className="h-4 w-4 text-brand-500" />
            <span>Target Search & Technical Audit Scanner</span>
          </h3>
          
          <label className="flex items-center space-x-2 bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/30 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-brand-500/20 transition-colors">
            <input
              type="checkbox"
              checked={metroExpansion}
              onChange={(e) => setMetroExpansion(e.target.checked)}
              className="rounded accent-brand-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">🌐 Metro Region Sweep (Scan Suburbs for 3x Leads)</span>
          </label>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
          
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs font-medium focus:border-brand-500 focus:outline-none"
              placeholder="e.g. United States"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs font-medium focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Austin"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs font-semibold focus:border-brand-500 focus:outline-none text-slate-900 dark:text-white"
              required
            >
              {INDUSTRY_OPTIONS.map((ind) => (
                <option key={ind} value={ind} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category Tag (Optional)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs font-medium focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Dental Care"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 p-3 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition-all duration-150 disabled:opacity-50 h-[44px]"
          >
            {searching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <SearchIcon className="h-4 w-4" />
                <span>Run Search & Audit</span>
              </>
            )}
          </button>
        </form>

        {/* Milestone Scan overlay */}
        {searching && (
          <div className="mt-4 rounded-xl bg-brand-500/5 p-4 border border-brand-500/10 space-y-2 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
              <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">Rivernet AI Audit Bot Scanning</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {searchMilestones[searchStep]}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-500 to-cyan-400 h-1.5 transition-all duration-500" 
                style={{ width: `${((searchStep + 1) / searchMilestones.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">List Filters</h3>
            
            {/* Quick Tier Pills */}
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
              {[
                { id: "all", label: "All Tiers" },
                { id: "tier1", label: "🔥 Tier 1" },
                { id: "tier2", label: "🟠 Tier 2" },
                { id: "tier3", label: "🟡 Tier 3" },
                { id: "tier4", label: "⚪ Tier 4" }
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setScoreFilter(tier.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                    scoreFilter === tier.id
                      ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200 dark:border-slate-700"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Starred only toggle button */}
          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              starredOnly
                ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"
            }`}
          >
            <span className="text-amber-500">★</span>
            <span>{starredOnly ? "Showing Starred Leads" : "Filter Starred Only"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5 text-xs">
          {/* Text search */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Keyword Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name or address..."
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Website Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Website Status</label>
            <select
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Sites</option>
              <option value="yes">Website Online</option>
              <option value="no">No Website (Vulnerable)</option>
            </select>
          </div>

          {/* Score filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Opportunity Tier</label>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="tier1">🔥 Tier 1 (Hot Lead 90-100)</option>
              <option value="tier2">🟠 Tier 2 (Warm Lead 70-89)</option>
              <option value="tier3">🟡 Tier 3 (Medium Lead 50-69)</option>
              <option value="tier4">⚪ Tier 4 (Standard &lt;50)</option>
            </select>
          </div>

          {/* Rating filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Google Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold focus:border-brand-500 focus:outline-none"
            >
              <option value="0">All Ratings</option>
              <option value="4">4.0+ Stars</option>
              <option value="3">3.0+ Stars</option>
            </select>
          </div>

          {/* CRM status filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">CRM Stage</label>
            <select
              value={crmFilter}
              onChange={(e) => setCrmFilter(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Stages</option>
              <option value="NEW">New</option>
              <option value="OUTREACHED">Outreached</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="MEETING_SCHEDULED">Meeting Set</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 shadow-xl border border-brand-500/40 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold">Leads Selected for Bulk Operations</span>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={bulkStage}
              onChange={(e) => setBulkStage(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="NEW">Mark as NEW</option>
              <option value="OUTREACHED">Mark as OUTREACHED</option>
              <option value="PROPOSAL_SENT">Mark as PROPOSAL SENT</option>
              <option value="MEETING_SCHEDULED">Mark as MEETING SET</option>
              <option value="WON">Mark as WON</option>
              <option value="LOST">Mark as LOST</option>
            </select>

            <button
              onClick={handleBulkUpdateCRM}
              className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-bold text-white shadow-md transition-colors"
            >
              Apply CRM Stage
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition-colors"
            >
              Bulk Delete ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* VIEW: MAP VS LIST */}
      {viewMode === "map" ? (
        <LeadMapView
          leads={filteredLeads}
          onSelectLead={(id) => {
            setSelectedLeadId(id);
            setIsDrawerOpen(true);
          }}
        />
      ) : (
        /* Main Results Table */
        <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300">No leads found matching current criteria.</span>
              <span className="text-xs">Select an Industry above and click "Run Search & Audit" to generate fresh leads.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-slate-400 border-b border-slate-200/60 dark:border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 accent-brand-500"
                      />
                    </th>
                    <th className="px-3 py-3.5 w-8"></th>
                    <th className="px-5 py-3.5">Business Name & Address</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Website Audit</th>
                    <th className="px-4 py-3.5">Google Rating</th>
                    <th className="px-4 py-3.5 text-center">Opportunity Tier</th>
                    <th className="px-4 py-3.5 text-center">CRM Stage</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredLeads.map((l) => {
                    const isChecked = selectedIds.includes(l.id);

                    return (
                      <tr 
                        key={l.id} 
                        onClick={() => {
                          setSelectedLeadId(l.id);
                          setIsDrawerOpen(true);
                        }}
                        className={`transition-colors cursor-pointer group ${
                          isChecked 
                            ? "bg-brand-500/10 dark:bg-brand-500/15" 
                            : "hover:bg-brand-500/5 dark:hover:bg-brand-500/10"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4 text-center" onClick={(e) => handleSelectOne(l.id, e)}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-slate-300 dark:border-slate-700 accent-brand-500 cursor-pointer"
                          />
                        </td>

                        {/* Favorite star */}
                        <td className="px-2 py-4" onClick={(e) => handleToggleFavorite(l.id, e)}>
                          <button 
                            className={`text-base transition-transform hover:scale-125 ${
                              l.is_favorite ? "text-amber-500" : "text-slate-300 dark:text-slate-700 hover:text-amber-400"
                            }`}
                            title={l.is_favorite ? "Remove Star" : "Star Lead"}
                          >
                            ★
                          </button>
                        </td>

                        {/* Name & Address */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors text-sm flex items-center space-x-1.5">
                            <span>{l.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{l.address}</div>
                        </td>
                        
                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                            {l.category || "General"}
                          </span>
                        </td>
                        
                        {/* Website status */}
                        <td className="px-4 py-4">
                          {l.website_url ? (
                            <div className="flex items-center space-x-1.5">
                              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                              <a 
                                href={l.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 max-w-[120px] truncate hover:underline"
                              >
                                {l.website_url.replace("http://www.", "").replace("https://www.", "")}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1.5 text-rose-500">
                              <XCircleIcon className="h-4 w-4" />
                              <span className="text-xs font-bold">No Website</span>
                            </div>
                          )}
                        </td>

                        {/* Google ratings */}
                        <td className="px-4 py-4">
                          {l.rating ? (
                            <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 font-semibold">
                              <span>{l.rating}</span>
                              <span className="text-amber-500">★</span>
                              <span className="text-[11px] text-slate-400 font-normal">({l.reviews_count})</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">No Reviews</span>
                          )}
                        </td>

                        {/* Opportunity Tier Badge */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-black border ${
                              l.lead_score >= 90 ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 glow-brand' :
                              l.lead_score >= 70 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                              l.lead_score >= 50 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            }`}>
                              <span>
                                {l.lead_score >= 90 ? '🔥 Tier 1' : l.lead_score >= 70 ? '🟠 Tier 2' : l.lead_score >= 50 ? '🟡 Tier 3' : '⚪ Tier 4'}
                              </span>
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                              Score: {l.lead_score || 0} • ${l.suggested_monthly_budget ? l.suggested_monthly_budget.toLocaleString() : (l.lead_score >= 90 ? "1,500" : l.lead_score >= 70 ? "1,200" : "800")}/mo
                            </span>
                          </div>
                        </td>

                        {/* CRM status stage */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            l.crm_status === 'WON' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            l.crm_status === 'LOST' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                            l.crm_status === 'PROPOSAL_SENT' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            l.crm_status === 'MEETING_SCHEDULED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            l.crm_status === 'OUTREACHED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {l.crm_status || 'NEW'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={(e) => handleDeleteLead(l.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Remove Lead"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* HubSpot Opportunity Drawer */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={fetchLeads}
      />
    </div>
  );
}
