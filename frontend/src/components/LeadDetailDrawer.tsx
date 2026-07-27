import { useEffect, useState } from "react";
import { api } from "../api";
import { 
  XCircleIcon, 
  GlobeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  LinkIcon, 
  CheckCircleIcon, 
  LightBulbIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon
} from "./Icons";

interface LeadDetailDrawerProps {
  leadId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const TIER_PRESETS: Record<string, { name: string; score: number; status: string; setup: number; retainer: number; package: string; services: string[] }> = {
  tier1: {
    name: "Tier 1",
    score: 95,
    status: "Hot Lead",
    setup: 3500,
    retainer: 1500,
    package: "Tier 1 - Foundational Web Design & Complete Overhaul",
    services: [
      "Custom responsive website design",
      "SSL Security & Speed Optimization",
      "Google Business Profile linking",
      "Local SEO metadata & schema setup",
      "Contact form & lead email integration"
    ]
  },
  tier2: {
    name: "Tier 2",
    score: 82,
    status: "Warm Lead",
    setup: 2200,
    retainer: 1200,
    package: "Tier 2 - Full Web Redesign & Digital Growth",
    services: [
      "Full UI/UX modern redesign",
      "Mobile-first speed acceleration",
      "Meta Pixel & Google Ads tracking",
      "Lead capture funnel setup"
    ]
  },
  tier3: {
    name: "Tier 3",
    score: 60,
    status: "Medium Lead",
    setup: 1200,
    retainer: 800,
    package: "Tier 3 - SEO & Social Growth Package",
    services: [
      "Local SEO Metadata Optimization",
      "Review Velocity Boost Strategy",
      "Social Media Channel Activation"
    ]
  },
  tier4: {
    name: "Tier 4",
    score: 42,
    status: "Low Priority",
    setup: 500,
    retainer: 500,
    package: "Tier 4 - Advanced PPC & CRO Retainer",
    services: [
      "Conversion Rate Optimization (CRO)",
      "Pay-Per-Click (PPC) Ad Management"
    ]
  }
};

export default function LeadDetailDrawer({
  leadId,
  isOpen,
  onClose,
  onUpdate
}: LeadDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "ai" | "report" | "meeting" | "similar" | "outreach" | "crm">("audit");
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  // Edit notes helper
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Edit Tier Pricing Helper
  const [isEditingTier, setIsEditingTier] = useState(false);
  const [selectedPresetTier, setSelectedPresetTier] = useState<string>("tier1");
  const [editTierSetup, setEditTierSetup] = useState(3500);
  const [editTierRetainer, setEditTierRetainer] = useState(1500);
  const [editTierPackage, setEditTierPackage] = useState("Tier 1 - Foundational Web Design & Overhaul");
  const [editServices, setEditServices] = useState<string[]>([]);
  const [savingTierPricing, setSavingTierPricing] = useState(false);
  // Outreach sub-tabs
  const [outreachTab, setOutreachTab] = useState<"email" | "call" | "linkedin" | "sequence">("email");
  
  // CRM States
  const [crmStatus, setCrmStatus] = useState("NEW");
  const [crmNotes, setCrmNotes] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [savingCRM, setSavingCRM] = useState(false);

  // New AI Modules State
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [similarLeads, setSimilarLeads] = useState<any[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  
  const [regeneratingReport, setRegeneratingReport] = useState(false);
  const [regeneratingMeeting, setRegeneratingMeeting] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const fetchReport = async () => {
    if (!leadId) return;
    try {
      setReportLoading(true);
      const res = await api.getLeadReport(leadId);
      setReportData(res);
    } catch (err) {
      console.error("Error loading prospect report", err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleRegenerateReport = async () => {
    if (!leadId) return;
    try {
      setRegeneratingReport(true);
      const res = await api.regenerateLeadReport(leadId);
      setReportData(res);
    } catch (err) {
      console.error("Error regenerating prospect report", err);
    } finally {
      setRegeneratingReport(false);
    }
  };

  const fetchMeetingBrief = async () => {
    if (!leadId) return;
    try {
      setMeetingLoading(true);
      const res = await api.getMeetingBrief(leadId);
      setMeetingData(res);
    } catch (err) {
      console.error("Error loading meeting brief", err);
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleRegenerateMeeting = async () => {
    if (!leadId) return;
    try {
      setRegeneratingMeeting(true);
      const res = await api.regenerateMeetingBrief(leadId);
      setMeetingData(res);
    } catch (err) {
      console.error("Error regenerating meeting brief", err);
    } finally {
      setRegeneratingMeeting(false);
    }
  };

  const fetchSimilar = async () => {
    if (!leadId) return;
    try {
      setSimilarLoading(true);
      const res = await api.getSimilarLeads(leadId);
      setSimilarLeads(res);
    } catch (err) {
      console.error("Error loading similar leads", err);
    } finally {
      setSimilarLoading(false);
    }
  };

  useEffect(() => {
    if (leadId && isOpen) {
      if (activeTab === "report" && !reportData) fetchReport();
      if (activeTab === "meeting" && !meetingData) fetchMeetingBrief();
      if (activeTab === "similar") fetchSimilar();
    }
  }, [activeTab, leadId, isOpen]);

  useEffect(() => {
    if (leadId && isOpen) {
      fetchLeadDetails();
    }
  }, [leadId, isOpen]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getLead(leadId!);
      setLead(data);
      setCrmStatus(data.crm_status);
      setCrmNotes(data.crm_notes || "");
      if (data.reminder_date) {
        setReminderDate(data.reminder_date.substring(0, 16)); // format to datetime-local
      } else {
        setReminderDate("");
      }
      setEditTierSetup(data.setup_price || (data.lead_score >= 90 ? 3500 : data.lead_score >= 70 ? 2200 : data.lead_score >= 50 ? 1200 : 500));
      setEditTierRetainer(data.suggested_monthly_budget || (data.lead_score >= 90 ? 1500 : data.lead_score >= 70 ? 1200 : data.lead_score >= 50 ? 800 : 500));
      setEditTierPackage(data.recommended_website_package || (data.lead_score >= 90 ? "Tier 1 - Foundational Web Design & Overhaul" : data.lead_score >= 70 ? "Tier 2 - Full Web Redesign & Growth" : data.lead_score >= 50 ? "Tier 3 - SEO & Social Growth" : "Tier 4 - Advanced PPC & CRO Retainer"));
      setEditServices(Array.isArray(data.estimated_services) ? data.estimated_services : []);
      setSelectedPresetTier(data.lead_score >= 90 ? "tier1" : data.lead_score >= 70 ? "tier2" : data.lead_score >= 50 ? "tier3" : "tier4");
    } catch (err) {
      console.error("Error loading lead details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTierPreset = (tierKey: string) => {
    const preset = TIER_PRESETS[tierKey];
    if (!preset) return;
    setSelectedPresetTier(tierKey);
    setEditTierSetup(preset.setup);
    setEditTierRetainer(preset.retainer);
    setEditTierPackage(preset.package);
    setEditServices([...preset.services]);
  };

  const handleSaveTierPricing = async () => {
    try {
      setSavingTierPricing(true);
      const preset = TIER_PRESETS[selectedPresetTier];
      await api.updateLead(lead.id, {
        setup_price: editTierSetup,
        suggested_monthly_budget: editTierRetainer,
        recommended_website_package: editTierPackage,
        estimated_services: editServices,
        lead_score: preset ? preset.score : lead.lead_score,
        lead_status: preset ? preset.status : lead.lead_status
      });
      setIsEditingTier(false);
      onUpdate();
      fetchLeadDetails();
    } catch (err) {
      console.error("Error saving tier pricing", err);
      alert("Failed to update tier pricing & services");
    } finally {
      setSavingTierPricing(false);
    }
  };

  const handleSaveCRM = async () => {
    try {
      setSavingCRM(true);
      await api.updateLead(lead.id, {
        crm_status: crmStatus,
        crm_notes: crmNotes,
        reminder_date: reminderDate ? new Date(reminderDate).toISOString() : ""
      });
      setIsEditingNotes(false);
      onUpdate();
      fetchLeadDetails();
    } catch (err) {
      console.error("Error saving CRM status", err);
      alert("Failed to update CRM details");
    } finally {
      setSavingCRM(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl transform bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300 border-l border-slate-200/60 dark:border-slate-800/80">
          
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
          ) : !lead ? (
            <div className="flex h-full items-center justify-center p-6 text-slate-500">
              Select a valid business lead to display analysis.
            </div>
          ) : (
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      lead.lead_status === 'Hot Lead' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      lead.lead_status === 'Warm Lead' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      lead.lead_status === 'Medium Lead' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {lead.lead_status === 'Hot Lead' ? '🔥 Hot Lead' : 
                       lead.lead_status === 'Warm Lead' ? '🟠 Warm Lead' : 
                       lead.lead_status === 'Medium Lead' ? '🟡 Medium Lead' : '⚪ Low Priority'} ({lead.lead_score})
                    </span>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                      {lead.name}
                    </h2>
                    <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mt-0.5">{lead.category}</p>
                  </div>
                  
                  <button onClick={onClose} className="rounded-md text-slate-400 hover:text-slate-500">
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Subinfo Grid */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <MapPinIcon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{lead.address || "No address listed"}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <PhoneIcon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{lead.phone || "No phone number"}</span>
                  </div>
                  {lead.website_url && (
                    <div className="flex items-center space-x-1.5 col-span-2">
                      <LinkIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline truncate">
                        {lead.website_url}
                      </a>
                    </div>
                  )}
                  {lead.maps_url && (
                    <div className="flex items-center space-x-1.5 col-span-2">
                      <GlobeIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      <a href={lead.maps_url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline truncate">
                        View on Google Maps (Rating: {lead.rating} ★, Reviews: {lead.reviews_count})
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-6">
                <nav className="flex space-x-6 overflow-x-auto scrollbar-none pb-0.5" aria-label="Tabs">
                  {[
                    { id: "audit", name: "Technical Audit" },
                    { id: "ai", name: "AI Insights" },
                    { id: "report", name: "Prospect Report" },
                    { id: "meeting", name: "Meeting Prep" },
                    { id: "similar", name: "Similar Leads" },
                    { id: "outreach", name: "Outreach" },
                    { id: "crm", name: "CRM Pipeline" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`border-b-2 py-4 text-sm font-semibold whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-brand-500 text-brand-600 dark:text-brand-400"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. TECHNICAL AUDIT TAB */}
                {activeTab === "audit" && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Website Audit section */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Website Presence</h3>
                      
                      {!lead.has_website ? (
                        <div className="mt-2 rounded-xl bg-red-500/10 p-4 border border-red-200/20 text-red-700 dark:text-red-400 text-sm">
                          <strong>Vulnerability Found:</strong> This business has no website listed. Creating a responsive, local-SEO optimized landing page is highly recommended.
                        </div>
                      ) : (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <AuditBadge name="Mobile Friendly" pass={lead.mobile_friendly} />
                          <AuditBadge name="SSL Security (HTTPS)" pass={lead.has_ssl} />
                          <AuditBadge name="SEO Meta Tags" pass={lead.has_seo_metadata} />
                          <AuditBadge name="Contact / Inquiry Form" pass={lead.has_contact_form} />
                          <AuditBadge name="Analytics Script" pass={lead.has_analytics} />
                          <AuditBadge name="Blog Presence" pass={lead.has_blog} />
                          
                          <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-slate-900/40">
                            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500">Load Speed Score</span>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className={`text-lg font-bold ${lead.load_speed_score > 80 ? 'text-green-500' : lead.load_speed_score > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                {lead.load_speed_score}/100
                              </span>
                              <span className="text-xs text-slate-400">({lead.load_speed_score > 80 ? 'Fast' : 'Slow'})</span>
                            </div>
                          </div>
                          
                          <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-slate-900/40">
                            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500">Estimated Website Age</span>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className="text-lg font-bold text-slate-800 dark:text-white">
                                {lead.website_age_years} {lead.website_age_years === 1 ? 'Year' : 'Years'}
                              </span>
                              {lead.website_age_years >= 5 && <span className="text-xs text-red-400 font-semibold">(Outdated)</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Socials & Marketing check */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Marketing & Analytics Audit</h3>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <AuditBadge name="Facebook Page" pass={lead.has_facebook} />
                        <AuditBadge name="Instagram Page" pass={lead.has_instagram} />
                        <AuditBadge name="Social Activity" pass={lead.social_active} />
                        <AuditBadge name="Google Listing Optimized" pass={lead.google_optimized} />
                        <AuditBadge name="Meta Ads Pixel" pass={lead.has_meta_pixel} />
                        <AuditBadge name="Google Ads Tag" pass={lead.has_google_ads_pixel} />
                        <AuditBadge name="Email Newsletter signup" pass={lead.has_newsletter} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AI INSIGHTS TAB */}
                {activeTab === "ai" && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Website Audit Overview */}
                    <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800 p-5 bg-brand-50/10 dark:bg-slate-900/30">
                      <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400">
                        <LightBulbIcon className="h-5 w-5" />
                        <h4 className="font-bold text-sm">Website Deficiency Summary</h4>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {lead.website_analysis_summary || "No website issues recorded."}
                      </p>
                    </div>

                    {/* Marketing Opportunity */}
                    <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800 p-5 bg-brand-50/10 dark:bg-slate-900/30">
                      <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400">
                        <LightBulbIcon className="h-5 w-5" />
                        <h4 className="font-bold text-sm">Marketing Opportunities</h4>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {lead.marketing_opp_summary || "No marketing opportunities recorded."}
                      </p>
                    </div>

                    {/* Rationale and Pitch */}
                    <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900/80">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Prospect Sales Rationale</h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {lead.prospect_rationale}
                      </p>
                    </div>

                    {/* Services & Tier Package Pricing */}
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 bg-slate-50/70 dark:bg-slate-900/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-black border ${
                            lead.lead_score >= 90 ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
                            lead.lead_score >= 70 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                            lead.lead_score >= 50 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          }`}>
                            <span>{lead.lead_score >= 90 ? '🔥 Tier 1' : lead.lead_score >= 70 ? '🟠 Tier 2' : lead.lead_score >= 50 ? '🟡 Tier 3' : '⚪ Tier 4'}</span>
                          </span>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Tier Package & Pricing</h4>
                        </div>

                        <button
                          onClick={() => setIsEditingTier(!isEditingTier)}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30 hover:bg-brand-500/20 transition-colors"
                        >
                          {isEditingTier ? "Cancel" : "✏️ Change Tier & Pricing"}
                        </button>
                      </div>

                      {/* Editing Mode */}
                      {isEditingTier ? (
                        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                          {/* Quick Tier Preset Selection */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase">Select Tier Preset (Fills Default Prices & Services):</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {Object.entries(TIER_PRESETS).map(([key, preset]) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => handleApplyTierPreset(key)}
                                  className={`p-2.5 rounded-xl text-left border transition-all ${
                                    selectedPresetTier === key
                                      ? "bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm"
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                                  }`}
                                >
                                  <div className="text-xs font-black">{preset.name}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">${preset.setup} + ${preset.retainer}/mo</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Price Input Fields */}
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Upfront Setup Fee ($)</label>
                              <input
                                type="number"
                                value={editTierSetup}
                                onChange={(e) => setEditTierSetup(Number(e.target.value))}
                                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Retainer ($/mo)</label>
                              <input
                                type="number"
                                value={editTierRetainer}
                                onChange={(e) => setEditTierRetainer(Number(e.target.value))}
                                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:border-brand-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Package Name</label>
                            <input
                              type="text"
                              value={editTierPackage}
                              onChange={(e) => setEditTierPackage(e.target.value)}
                              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold focus:border-brand-500 focus:outline-none"
                            />
                          </div>

                          {/* Included Services Checkboxes */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Included Pitch Services:</label>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {[
                                "Custom responsive website design",
                                "SSL Security & Speed Optimization",
                                "Google Business Profile linking",
                                "Local SEO metadata & schema setup",
                                "Contact form & lead email integration",
                                "Full UI/UX modern redesign",
                                "Mobile-first speed acceleration",
                                "Meta Pixel & Google Ads tracking",
                                "Lead capture funnel setup",
                                "Local SEO Metadata Optimization",
                                "Review Velocity Boost Strategy",
                                "Social Media Channel Activation",
                                "Conversion Rate Optimization (CRO)",
                                "Pay-Per-Click (PPC) Ad Management"
                              ].map((svc) => {
                                const isChecked = editServices.includes(svc);
                                return (
                                  <label key={svc} className="flex items-center space-x-2 text-xs cursor-pointer p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setEditServices([...editServices, svc]);
                                        } else {
                                          setEditServices(editServices.filter((s) => s !== svc));
                                        }
                                      }}
                                      className="rounded accent-brand-500"
                                    />
                                    <span className={isChecked ? "font-bold text-slate-800 dark:text-slate-200" : "text-slate-400"}>{svc}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={handleSaveTierPricing}
                              disabled={savingTierPricing}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50"
                            >
                              {savingTierPricing ? "Saving..." : "Save Custom Tier & Pricing"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Read-only Mode */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Package Name</span>
                              <span className="block mt-0.5 font-extrabold text-slate-850 dark:text-white text-xs">{lead.recommended_website_package || "Tier 1 - Foundational Web Overhaul"}</span>
                            </div>

                            <div className="border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Upfront Setup Price</span>
                              <span className="block mt-0.5 font-extrabold text-slate-850 dark:text-white text-xs">
                                ${lead.setup_price ? lead.setup_price.toLocaleString() : (lead.lead_score >= 90 ? "3,500" : lead.lead_score >= 70 ? "2,200" : lead.lead_score >= 50 ? "1,200" : "500")}
                              </span>
                            </div>
                            
                            <div className="border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Retainer</span>
                              <span className="block mt-0.5 font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                                ${lead.suggested_monthly_budget?.toLocaleString() || "1,500"} / mo
                              </span>
                            </div>
                          </div>

                          {/* Target services checklist */}
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">Selected Tier Services Pitch</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {lead.estimated_services && Array.isArray(lead.estimated_services) && lead.estimated_services.length > 0 ? (
                                lead.estimated_services.map((svc: string, index: number) => (
                                  <div key={index} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 py-2 px-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span className="font-medium">{svc}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-slate-500">No services selected yet. Click edit above to add services.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. PROSPECT REPORT TAB */}
                {activeTab === "report" && (
                  <div className="space-y-6 animate-fade-in">
                    {reportLoading ? (
                      <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                      </div>
                    ) : reportData ? (
                      <>
                        {/* Header controls bar */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                          <div className="text-xs space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white">Report Version {reportData.version}</span>
                            <span className="block text-slate-400">Generated: {new Date(reportData.generated_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleRegenerateReport}
                              disabled={regeneratingReport}
                              className="px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                            >
                              {regeneratingReport ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                              ) : (
                                <span>⚡ Regenerate</span>
                              )}
                            </button>

                            <button
                              onClick={() => window.print()}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-750 transition-colors"
                            >
                              🖨️ Export PDF / Print
                            </button>
                          </div>
                        </div>

                        {/* Public Share URL Box */}
                        <div className="p-3 bg-brand-500/5 rounded-xl border border-brand-500/10 flex items-center justify-between text-xs gap-2">
                          <div className="truncate">
                            <span className="font-bold text-brand-600 dark:text-brand-400 block mb-0.5">Secure Public Share Link (14-day expiry)</span>
                            <span className="font-mono text-slate-500 truncate block">
                              {window.location.origin}/share/report/{reportData.share_token}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              Views: <strong>{reportData.views}</strong> | Last opened: {reportData.last_viewed_at ? new Date(reportData.last_viewed_at).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/share/report/${reportData.share_token}`);
                              setShareLinkCopied(true);
                              setTimeout(() => setShareLinkCopied(false), 2000);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shrink-0"
                          >
                            {shareLinkCopied ? "Copied!" : "Copy Share Link"}
                          </button>
                        </div>

                        {/* Executive Summary */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Executive Audit Summary</h4>
                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            {reportData.report.executive_summary}
                          </p>
                        </div>

                        {/* Score Dials Grid */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="glass-panel p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Website Quality</span>
                            <span className="block mt-1 text-2xl font-extrabold text-brand-500">
                              {reportData.report.website_quality_score}/100
                            </span>
                          </div>
                          <div className="glass-panel p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">SEO Optimization</span>
                            <span className="block mt-1 text-2xl font-extrabold text-indigo-500">
                              {reportData.report.seo_score}/100
                            </span>
                          </div>
                          <div className="glass-panel p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">GBP Profile Score</span>
                            <span className="block mt-1 text-2xl font-extrabold text-cyan-500">
                              {reportData.report.gbp_optimization_score}/100
                            </span>
                          </div>
                        </div>

                        {/* Competitor Comparison Grid */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Local Competitor Benchmarking</h4>
                          
                          <p className="text-[11px] text-slate-500 italic">
                            {reportData.report.disclaimer}
                          </p>

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
                                  <td className="py-2.5 px-1">{lead.name} (Prospect)</td>
                                  <td className="py-2.5">{reportData.report.website_quality_score}/100</td>
                                  <td className="py-2.5">{reportData.report.seo_score}/100</td>
                                  <td className="py-2.5">{lead.reviews_count || 0}</td>
                                  <td className="py-2.5">{lead.rating} ★</td>
                                  <td className="py-2.5">{lead.load_speed_score}</td>
                                </tr>
                                {reportData.report.competitors && reportData.report.competitors.map((comp: any, i: number) => (
                                  <tr key={i} className="text-slate-650 dark:text-slate-350">
                                    <td className="py-2.5 px-1 font-semibold">{comp.name}</td>
                                    <td className="py-2.5">{comp.website_quality}/100</td>
                                    <td className="py-2.5">{comp.seo}/100</td>
                                    <td className="py-2.5">{comp.reviews}</td>
                                    <td className="py-2.5">{comp.rating} ★</td>
                                    <td className="py-2.5">{comp.speed}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {reportData.report.competitor_explanation}
                          </p>
                        </div>

                        {/* SEO Audit Checklist */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">SEO Audit Technical Check</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800">
                              <span className="text-slate-400 font-bold block text-[10px] uppercase">Meta Title Tag</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">{reportData.report.seo_audit.meta_title}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800">
                              <span className="text-slate-400 font-bold block text-[10px] uppercase">Meta Description Tag</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">{reportData.report.seo_audit.meta_description}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800">
                              <span className="text-slate-400 font-bold block text-[10px] uppercase">Sitemap.xml</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">{reportData.report.seo_audit.sitemap_detection}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800">
                              <span className="text-slate-400 font-bold block text-[10px] uppercase">Robots.txt</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">{reportData.report.seo_audit.robots_txt_detection}</span>
                            </div>
                          </div>
                        </div>

                        {/* Historical Audit Version Dropdown */}
                        {reportData.history && reportData.history.length > 0 && (
                          <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Audit Version History ({reportData.history.length} archived runs)</span>
                            <div className="space-y-1">
                              {reportData.history.map((h: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/30">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">Version {h.version}</span>
                                  <span className="text-slate-400">{new Date(h.generated_at).toLocaleDateString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}

                {/* 4. AI MEETING PREP TAB */}
                {activeTab === "meeting" && (
                  <div className="space-y-6 animate-fade-in">
                    {meetingLoading ? (
                      <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                      </div>
                    ) : meetingData ? (
                      <>
                        {/* Action Header */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">Brief Version {meetingData.version}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleRegenerateMeeting}
                              disabled={regeneratingMeeting}
                              className="px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold transition-colors disabled:opacity-50"
                            >
                              {regeneratingMeeting ? "Regenerating..." : "⚡ Regenerate Brief"}
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 transition-colors"
                            >
                              🖨️ Print Brief
                            </button>
                          </div>
                        </div>

                        {/* Business Brief Overview */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Prospect Executive Brief</h4>
                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            {meetingData.brief.business_overview}
                          </p>
                        </div>

                        {/* Weaknesses vs Opportunities Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                            <span className="font-bold text-red-500 text-xs uppercase tracking-wider block">Key Vulnerabilities</span>
                            <ul className="space-y-1 text-xs text-slate-650 dark:text-slate-300 list-disc list-inside">
                              {meetingData.brief.biggest_weaknesses.map((w: string, i: number) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-2">
                            <span className="font-bold text-green-500 text-xs uppercase tracking-wider block">Pitch Opportunities</span>
                            <ul className="space-y-1 text-xs text-slate-650 dark:text-slate-300 list-disc list-inside">
                              {meetingData.brief.strongest_opportunities.map((o: string, i: number) => (
                                <li key={i}>{o}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Discovery Questions */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Suggested Discovery Questions</h4>
                          <div className="space-y-2 text-xs">
                            {meetingData.brief.suggested_discovery_questions.map((q: string, i: number) => (
                              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800 flex items-start space-x-2">
                                <span className="font-bold text-brand-500">Q{i+1}.</span>
                                <span className="text-slate-700 dark:text-slate-300">{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Objections and Rebuttals Cards */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Objections & Rebuttals Playbook</h4>
                          <div className="space-y-3 text-xs">
                            {meetingData.brief.possible_objections.map((item: any, i: number) => (
                              <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                                <span className="font-bold text-amber-600 dark:text-amber-400 block">Objection: "{item.objection}"</span>
                                <span className="text-slate-650 dark:text-slate-300 block">
                                  <strong>Response:</strong> {item.response}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {/* 5. SIMILAR LEADS TAB */}
                {activeTab === "similar" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Database Client Similarity Engine</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Matches calculated using weighted factors (50% Industry, 20% City Location, 15% Rating/Reviews, 15% Website Quality Score).
                      </p>
                    </div>

                    {similarLoading ? (
                      <div className="flex h-48 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                      </div>
                    ) : similarLeads.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 space-y-2">
                        <p className="font-semibold text-slate-600 dark:text-slate-300">No other database leads found in this category.</p>
                        <p>Perform additional searches in Lead Discovery to populate local business records for comparative similarity matching.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {similarLeads.map((sim: any) => (
                          <div 
                            key={sim.id}
                            className="glass-panel p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-4 transition-all hover:border-brand-500/40"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{sim.name}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                                  {sim.similarity_percentage}% Match
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {sim.explanation}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setLead(null);
                                api.getLead(sim.id).then(data => {
                                  setLead(data);
                                  setCrmStatus(data.crm_status);
                                  setCrmNotes(data.crm_notes || "");
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-brand-500 hover:text-white transition-colors shrink-0"
                            >
                              Inspect Lead
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. OUTREACH MATERIALS TAB */}
                {activeTab === "outreach" && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Sub navigation bar */}
                    <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs font-semibold">
                      {[
                        { id: "email", name: "Cold Email" },
                        { id: "call", name: "Cold Call Script" },
                        { id: "linkedin", name: "LinkedIn" },
                        { id: "sequence", name: "Follow-up Emails" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setOutreachTab(item.id as any)}
                          className={`flex-1 py-2 text-center border-r border-slate-200 dark:border-slate-800 last:border-none ${
                            outreachTab === item.id 
                              ? "bg-brand-500 text-white" 
                              : "bg-slate-50 dark:bg-slate-800/50 text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-850 dark:text-slate-300"
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>

                    {/* 3a. Cold Email */}
                    {outreachTab === "email" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">AI-Generated Personal Email Pitch</span>
                          <button
                            onClick={() => copyToClipboard(lead.cold_email_draft || "", "email")}
                            className="text-xs font-semibold text-brand-500 hover:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg"
                          >
                            {copied === "email" ? "Copied! ✓" : "Copy to Clipboard"}
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={lead.cold_email_draft || ""}
                          rows={12}
                          className="w-full rounded-2xl border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 text-sm text-slate-650 dark:text-slate-350 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* 3b. Cold Call */}
                    {outreachTab === "call" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Telemarketing / Call Script Outline</span>
                          <button
                            onClick={() => copyToClipboard(lead.cold_call_talking_points || "", "call")}
                            className="text-xs font-semibold text-brand-500 hover:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg"
                          >
                            {copied === "call" ? "Copied! ✓" : "Copy to Clipboard"}
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={lead.cold_call_talking_points || ""}
                          rows={10}
                          className="w-full rounded-2xl border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 text-sm text-slate-650 dark:text-slate-350 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* 3c. LinkedIn Connection */}
                    {outreachTab === "linkedin" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">LinkedIn Invite Note (Max 300 Chars)</span>
                          <button
                            onClick={() => copyToClipboard(lead.linkedin_message || "", "linkedin")}
                            className="text-xs font-semibold text-brand-500 hover:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg"
                          >
                            {copied === "linkedin" ? "Copied! ✓" : "Copy to Clipboard"}
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={lead.linkedin_message || ""}
                          rows={4}
                          className="w-full rounded-2xl border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 text-sm text-slate-650 dark:text-slate-350 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* 3d. Follow up Sequence */}
                    {outreachTab === "sequence" && (
                      <div className="space-y-4">
                        {lead.follow_up_sequence && Array.isArray(lead.follow_up_sequence) ? (
                          lead.follow_up_sequence.map((email: any, index: number) => (
                            <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs uppercase text-brand-500">Email {index + 1} (Day {email.day})</span>
                                <button
                                  onClick={() => copyToClipboard(email.body, `seq-${index}`)}
                                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-500 bg-slate-200 dark:bg-slate-850 px-2 py-0.5 rounded"
                                >
                                  {copied === `seq-${index}` ? "Copied! ✓" : "Copy Body"}
                                </button>
                              </div>
                              <div className="text-xs text-slate-700 dark:text-slate-300">
                                <strong>Subject:</strong> {email.subject}
                              </div>
                              <pre className="text-xs whitespace-pre-wrap font-sans text-slate-550 dark:text-slate-400 bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-850 p-3 rounded-lg">
                                {email.body}
                              </pre>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500">No email sequences generated.</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. CRM PIPELINE TAB */}
                {activeTab === "crm" && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* CRM status selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Sales Pipeline Status</label>
                      <select
                        value={crmStatus}
                        onChange={(e) => setCrmStatus(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-850 p-3 text-sm text-slate-700 dark:text-slate-300 focus:border-brand-500 focus:outline-none"
                      >
                        <option value="NEW">New (Discovered)</option>
                        <option value="OUTREACHED">Outreached (Contacted)</option>
                        <option value="PROPOSAL_SENT">Proposal Sent</option>
                        <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
                        <option value="WON">Closed Won (Active Client)</option>
                        <option value="LOST">Closed Lost</option>
                      </select>
                    </div>

                    {/* Follow-up Reminder calendar */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Follow-up Reminder Date</label>
                      <div className="mt-2 flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5 text-slate-450 shrink-0" />
                        <input
                          type="datetime-local"
                          value={reminderDate}
                          onChange={(e) => setReminderDate(e.target.value)}
                          className="block w-full rounded-xl border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-850 p-3 text-sm text-slate-700 dark:text-slate-300 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* CRM Notes Log */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Internal Notes & History</label>
                        {!isEditingNotes && crmNotes && (
                          <button
                            onClick={() => setIsEditingNotes(true)}
                            className="text-xs text-brand-500 hover:underline flex items-center space-x-1"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                            <span>Edit Notes</span>
                          </button>
                        )}
                      </div>
                      
                      {isEditingNotes || !crmNotes ? (
                        <textarea
                          placeholder="Type internal notes regarding phone conversations, follow-up answers, or pricing bids here..."
                          value={crmNotes}
                          onChange={(e) => setCrmNotes(e.target.value)}
                          rows={6}
                          className="mt-2 w-full rounded-xl border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-850 p-3 text-sm text-slate-700 dark:text-slate-300 focus:border-brand-500 focus:outline-none"
                        />
                      ) : (
                        <div className="mt-2 p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                          {crmNotes}
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSaveCRM}
                      disabled={savingCRM}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-brand-600 hover:bg-brand-500 py-3 text-sm font-semibold text-white transition-colors duration-150 disabled:opacity-50"
                    >
                      {savingCRM ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          <span>Save CRM Record</span>
                        </>
                      )}
                    </button>

                  </div>
                )}

              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

// Subcomponent: AuditBadge
function AuditBadge({ name, pass }: { name: string; pass: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/50 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-slate-900/40">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{name}</span>
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
        pass 
          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      }`}>
        {pass ? "✓ PASS" : "✗ FAIL"}
      </span>
    </div>
  );
}
