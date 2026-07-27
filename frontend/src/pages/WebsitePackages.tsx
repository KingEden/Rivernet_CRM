import { useState } from "react";
import { 
  SparklesIcon, 
  GlobeIcon, 
  BoltIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  ShieldExclamationIcon,
  ShareIcon
} from "../components/Icons";

interface AddOnOption {
  id: string;
  name: string;
  category: "Brand & Creative" | "Marketing & Growth" | "Advanced Features" | "Care & Security";
  estPrice: string;
  desc: string;
}

const ADD_ONS: AddOnOption[] = [
  { id: "branding", name: "Logo Design & Branding Kit", category: "Brand & Creative", estPrice: "$499", desc: "Vector logo, color palette, typography guidelines, & assets." },
  { id: "copywriting", name: "Professional Copywriting (5 Pages)", category: "Brand & Creative", estPrice: "$350", desc: "Conversion-optimized SEO copy for 5 core pages." },
  { id: "photography", name: "On-Location Photography Shoot", category: "Brand & Creative", estPrice: "$750", desc: "High-resolution corporate team & workplace photos." },
  { id: "video", name: "Corporate Video Production", category: "Brand & Creative", estPrice: "$1,250", desc: "60-sec brand overview video + social media cuts." },

  { id: "seo_campaign", name: "Monthly SEO Campaign (3 Months)", category: "Marketing & Growth", estPrice: "$600/mo", desc: "On-page, backlink outreach, & monthly keyword ranking reports." },
  { id: "ppc_ads", name: "Google Ads & Meta Ads Management", category: "Marketing & Growth", estPrice: "$500/mo", desc: "Ad campaign setup, A/B copy testing, & ROI tracking." },
  { id: "gbp_opt", name: "Google Business Profile Optimization", category: "Marketing & Growth", estPrice: "$299", desc: "Local 3-Pack optimization, geotagged posts, & review strategy." },
  { id: "email_auto", name: "Email Marketing Automation", category: "Marketing & Growth", estPrice: "$399", desc: "Welcome sequence, lead magnet nurture, & newsletter template." },

  { id: "ai_chatbot", name: "AI Chatbot & Lead Capture", category: "Advanced Features", estPrice: "$499", desc: "Custom trained AI widget for 24/7 client Q&A & lead booking." },
  { id: "ecommerce", name: "E-commerce Store Build", category: "Advanced Features", estPrice: "$999", desc: "Stripe/PayPal integration, product catalog, & checkout." },
  { id: "portal", name: "Membership / Client Portal", category: "Advanced Features", estPrice: "$850", desc: "Secure authentication, gated content, & user dashboards." },
  { id: "booking", name: "Online Booking & Scheduling System", category: "Advanced Features", estPrice: "$250", desc: "Calendly/Acuity sync with automated SMS & email reminders." },

  { id: "maintenance", name: "Managed Monthly Website Maintenance", category: "Care & Security", estPrice: "$149/mo", desc: "Plugin updates, speed optimizations, & 2 hrs monthly tweaks." },
  { id: "care_plan", name: "Website Proactive Care Plan", category: "Care & Security", estPrice: "$99/mo", desc: "Daily cloud backups, 24/7 uptime monitoring, & security firewall." },
  { id: "speed_opt", name: "Premium Speed & Core Web Vitals", category: "Care & Security", estPrice: "$299", desc: "Sub-second load speed tuning & image WebP compression." },
];

export default function WebsitePackages() {
  const [selectedTab, setSelectedTab] = useState<"packages" | "matrix" | "calculator" | "addons">("packages");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(["branding", "seo_campaign"]);
  const [basePackage, setBasePackage] = useState<"starter" | "professional" | "premium">("professional");
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Tier Prices State
  const [tier1Setup, setTier1Setup] = useState(1800);
  const [tier1Retainer, setTier1Retainer] = useState(400);

  const [tier2Setup, setTier2Setup] = useState(3200);
  const [tier2Retainer, setTier2Retainer] = useState(800);

  const [tier3Setup, setTier3Setup] = useState(6500);
  const [tier3Retainer, setTier3Retainer] = useState(1500);

  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const toggleAddOn = (id: string) => {
    if (selectedAddOns.includes(id)) {
      setSelectedAddOns(selectedAddOns.filter((item) => item !== id));
    } else {
      setSelectedAddOns([...selectedAddOns, id]);
    }
  };

  const handleCopyProposalSummary = () => {
    const pkgTitle = 
      basePackage === "starter" ? "Starter Website Package" :
      basePackage === "professional" ? "Professional Website Package ⭐" : "Premium Website Package";

    const addOnList = ADD_ONS
      .filter(a => selectedAddOns.includes(a.id))
      .map(a => `- ${a.name} (${a.estPrice}): ${a.desc}`)
      .join("\n");

    const text = `📋 AGENCY PROPOSAL SUMMARY\n` +
      `Base Tier: ${pkgTitle}\n\n` +
      `Selected Custom Add-Ons:\n${addOnList || "- None selected"}\n\n` +
      `Generate detailed contract via Rivernet Prospector CRM.`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      
      {/* Top Header Card */}
      <div className="glass-panel rounded-3xl p-8 shadow-md border-t-4 border-t-brand-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-brand-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-dot"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">Agency Product Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Website & Growth <span className="bg-gradient-to-r from-brand-500 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">Service Packages</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Standardized, scalable agency service packages covering custom web development, brand identity, lead-generation tools, SEO, AI automation, and ongoing maintenance care plans.
          </p>

          {/* Navigation Sub-Tabs */}
          <div className="pt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedTab("packages")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTab === "packages"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              🚀 Package Tier Breakdown
            </button>
            <button
              onClick={() => setSelectedTab("matrix")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTab === "matrix"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              📊 Feature Comparison Matrix
            </button>
            <button
              onClick={() => setSelectedTab("calculator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTab === "calculator"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              🧮 Interactive Quote & Proposal Builder
            </button>
            <button
              onClick={() => setSelectedTab("addons")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTab === "addons"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              🧩 A La Carte Add-Ons Catalog
            </button>

            <button
              onClick={() => setShowEmbedModal(true)}
              className="ml-auto px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-brand-500 hover:from-cyan-400 hover:to-brand-400 text-white shadow-md transition-all flex items-center space-x-1.5"
            >
              <ShareIcon className="h-4 w-4" />
              <span>Embed on Website →</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: THREE PACKAGES CARDS */}
      {selectedTab === "packages" && (
        <div className="space-y-8">
          
          {/* Customize Prices Toolbar */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Agency Package Pricing Strategy</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black">Active Tiers</span>
            </div>

            <button
              onClick={() => setIsEditingPrices(!isEditingPrices)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30 hover:bg-brand-500/20 transition-colors self-start sm:self-auto"
            >
              {isEditingPrices ? "✓ Close Price Customizer" : "✏️ Customize Tier Prices"}
            </button>
          </div>

          {/* Price Customizer Inputs */}
          {isEditingPrices && (
            <div className="glass-panel rounded-2xl p-5 border border-brand-500/30 bg-brand-500/5 space-y-4 animate-fade-in">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Adjust Default Tier Pricing ($ Setup & $/mo Retainer)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tier 1 Starter */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">Tier 1 • Starter Website</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Setup ($)</label>
                      <input
                        type="number"
                        value={tier1Setup}
                        onChange={(e) => setTier1Setup(Number(e.target.value))}
                        className="mt-0.5 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Retainer ($/mo)</label>
                      <input
                        type="number"
                        value={tier1Retainer}
                        onChange={(e) => setTier1Retainer(Number(e.target.value))}
                        className="mt-0.5 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Tier 2 Professional */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-400/40 space-y-2">
                  <span className="text-xs font-black text-amber-500">Tier 2 • Professional ⭐</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Setup ($)</label>
                      <input
                        type="number"
                        value={tier2Setup}
                        onChange={(e) => setTier2Setup(Number(e.target.value))}
                        className="mt-0.5 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Retainer ($/mo)</label>
                      <input
                        type="number"
                        value={tier2Retainer}
                        onChange={(e) => setTier2Retainer(Number(e.target.value))}
                        className="mt-0.5 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Tier 3 Premium */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-500/40 space-y-2">
                  <span className="text-xs font-black text-indigo-400">Tier 3 • Premium Website</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Setup ($)</label>
                      <input
                        type="number"
                        value={tier3Setup}
                        onChange={(e) => setTier3Setup(Number(e.target.value))}
                        className="mt-0.5 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Retainer ($/mo)</label>
                      <input
                        type="number"
                        value={tier3Retainer}
                        onChange={(e) => setTier3Retainer(Number(e.target.value))}
                        className="mt-0.5 block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-indigo-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. STARTER */}
            <div className="glass-panel rounded-3xl p-7 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6 hover:border-brand-500/40 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Tier 1 • Foundation
                  </span>
                  <span className="text-xs font-bold text-slate-400">30-Day Support</span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Starter Website</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Perfect for startups, local businesses, freelancers, & professionals establishing a strong online presence.
                  </p>

                  {/* Price Tag Block */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-slate-900 dark:text-white">${tier1Setup.toLocaleString()}</span>
                      <span className="text-[11px] font-semibold text-slate-400 ml-1">Setup</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">+${tier1Retainer.toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-slate-400 ml-1">/mo retainer</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-brand-600 dark:text-cyan-400 tracking-wider">What's Included</p>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Up to 5 Custom Pages</strong> (Desktop, Tablet & Mobile)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Professional Copywriting</strong> for 2 Core Pages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Contact Form & Google Maps Integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Social Media Profile Integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Basic On-Page SEO & Analytics Setup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>SSL Certificate & Domain/Hosting Setup</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900/80 p-3 text-xs italic text-slate-600 dark:text-slate-400">
                  🎯 <strong>Outcome:</strong> Launch a modern website that builds trust and provides a strong digital foundation.
                </div>
                <button
                  onClick={() => { setBasePackage("starter"); setSelectedTab("calculator"); }}
                  className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Configure Proposal with Starter →
                </button>
              </div>
            </div>

            {/* 2. PROFESSIONAL ⭐ */}
            <div className="glass-panel rounded-3xl p-7 border-2 border-amber-400/80 dark:border-amber-400/60 shadow-xl shadow-amber-500/10 flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow">
                MOST POPULAR ⭐
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/10 text-amber-500">
                    Tier 2 • Lead Generation
                  </span>
                  <span className="text-xs font-bold text-amber-500">60-Day Support</span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Professional Website <span className="text-amber-400">⭐</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Perfect for growing businesses looking to generate leads, improve search rank, & automate bookings.
                  </p>

                  {/* Price Tag Block */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-amber-500">${tier2Setup.toLocaleString()}</span>
                      <span className="text-[11px] font-semibold text-amber-500/80 ml-1">Setup</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-amber-500">+${tier2Retainer.toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-amber-500/80 ml-1">/mo retainer</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-amber-500 tracking-wider">Everything in Starter, Plus:</p>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Up to 10 Custom Pages</strong> + User-Friendly CMS Blog</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Logo Design & Brand Identity Kit</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Professional Copywriting for Up to 10 Pages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Advanced Technical SEO & Google Business Profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Online Booking & Appointment Scheduling System</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Advanced Contact Forms & Analytics Dashboard</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="rounded-xl bg-amber-500/10 p-3 text-xs italic text-amber-800 dark:text-amber-300 border border-amber-400/20">
                  🎯 <strong>Outcome:</strong> Attract more customers, rank better on search engines, & convert visitors into qualified leads.
                </div>
                <button
                  onClick={() => { setBasePackage("professional"); setSelectedTab("calculator"); }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-bold text-slate-950 shadow-md transition-all"
                >
                  Configure Proposal with Professional ⭐ →
                </button>
              </div>
            </div>

            {/* 3. PREMIUM */}
            <div className="glass-panel rounded-3xl p-7 border border-indigo-500/30 dark:border-indigo-500/40 flex flex-col justify-between space-y-6 hover:border-indigo-500/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
                    Tier 3 • Full Ecosystem
                  </span>
                  <span className="text-xs font-bold text-indigo-400">90-Day Priority</span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Premium Website</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Perfect for enterprise brands, e-commerce stores, & organizations requiring a complete digital ecosystem.
                  </p>

                  {/* Price Tag Block */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-indigo-400">${tier3Setup.toLocaleString()}</span>
                      <span className="text-[11px] font-semibold text-indigo-400/80 ml-1">Setup</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-indigo-400">+${tier3Retainer.toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-indigo-400/80 ml-1">/mo retainer</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Everything in Professional, Plus:</p>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Unlimited Custom Pages</strong> & Unlimited Copywriting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Professional Photography & Corporate Video</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>AI Chatbot Integration & Full E-Commerce Store</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Membership Portal & Unlimited API Integrations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Full SEO, PPC Ads, Social & Email Marketing Suite</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>3 Months Website Maintenance & Care Plan Included</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="rounded-xl bg-indigo-500/10 p-3 text-xs italic text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                  🎯 <strong>Outcome:</strong> Scalable, automated platform that increases revenue, engagement, & long-term growth.
                </div>
                <button
                  onClick={() => { setBasePackage("premium"); setSelectedTab("calculator"); }}
                  className="w-full py-2.5 rounded-xl border border-indigo-500/40 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                >
                  Configure Proposal with Premium →
                </button>
              </div>
            </div>

          </div>

          {/* Upgrade Pathway Graphic */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BoltIcon className="h-4 w-4 text-brand-500" />
              Strategic Client Upgrade Pathway
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-brand-500 uppercase">Phase 1 • Starter</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Online Presence & Credibility</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Establish immediate validation, clean mobile UI, and contact avenues.</p>
              </div>

              <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900 p-4 border border-amber-400/30 space-y-1">
                <div className="text-[10px] font-bold text-amber-500 uppercase">Phase 2 • Professional ⭐</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Lead Generation & Search Authority</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Rank high on search engines, self-edit via CMS, and capture automated bookings.</p>
              </div>

              <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900 p-4 border border-indigo-500/30 space-y-1">
                <div className="text-[10px] font-bold text-indigo-400 uppercase">Phase 3 • Premium</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Automated Digital Revenue Ecosystem</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Full e-commerce, AI chatbot automation, PPC media campaigns, and client portals.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPARISON MATRIX */}
      {selectedTab === "matrix" && (
        <div className="glass-panel rounded-3xl p-6 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Comprehensive Feature Matrix</h3>
            <span className="text-xs text-slate-500">Compare inclusions across all 3 tiers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold bg-slate-100/50 dark:bg-slate-900/50">
                  <th className="p-3.5 rounded-l-xl">Feature</th>
                  <th className="p-3.5 text-center">Starter</th>
                  <th className="p-3.5 text-center text-amber-500 bg-amber-500/5">Professional ⭐</th>
                  <th className="p-3.5 text-center rounded-r-xl">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 font-bold text-brand-600 dark:text-cyan-400">
                  <td colSpan={4} className="p-2.5 px-3">Design & Content</td>
                </tr>
                <tr>
                  <td className="p-3">Custom Designed Pages</td>
                  <td className="p-3 text-center font-semibold">Up to 5</td>
                  <td className="p-3 text-center font-semibold text-amber-500 bg-amber-500/5">Up to 10</td>
                  <td className="p-3 text-center font-semibold text-emerald-500">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3">Copywriting</td>
                  <td className="p-3 text-center">2 Pages</td>
                  <td className="p-3 text-center text-amber-500 bg-amber-500/5">Up to 10 Pages</td>
                  <td className="p-3 text-center text-emerald-500 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3">Logo Design & Brand Identity Kit</td>
                  <td className="p-3 text-center text-slate-400">—</td>
                  <td className="p-3 text-center text-emerald-500 font-bold bg-amber-500/5">✓ Included</td>
                  <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="p-3">Professional Photo & Video Shoot</td>
                  <td className="p-3 text-center text-slate-400">—</td>
                  <td className="p-3 text-center text-slate-400 bg-amber-500/5">Optional Add-on</td>
                  <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                </tr>

                <tr className="bg-slate-50/50 dark:bg-slate-900/30 font-bold text-brand-600 dark:text-cyan-400">
                  <td colSpan={4} className="p-2.5 px-3">CMS, Booking & Features</td>
                </tr>
                <tr>
                  <td className="p-3">CMS & Blog Setup</td>
                  <td className="p-3 text-center text-slate-400">—</td>
                  <td className="p-3 text-center text-emerald-500 font-bold bg-amber-500/5">✓ Included</td>
                  <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="p-3">Online Booking System</td>
                  <td className="p-3 text-center text-slate-400">Optional Add-on</td>
                  <td className="p-3 text-center text-emerald-500 font-bold bg-amber-500/5">✓ Included</td>
                  <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="p-3">AI Chatbot & E-Commerce</td>
                  <td className="p-3 text-center text-slate-400">—</td>
                  <td className="p-3 text-center text-slate-400 bg-amber-500/5">Optional Add-on</td>
                  <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="p-3">Membership & Client Portal</td>
                  <td className="p-3 text-center text-slate-400">—</td>
                  <td className="p-3 text-center text-slate-400 bg-amber-500/5">—</td>
                  <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                </tr>

                <tr className="bg-slate-50/50 dark:bg-slate-900/30 font-bold text-brand-600 dark:text-cyan-400">
                  <td colSpan={4} className="p-2.5 px-3">SEO, Marketing & Support</td>
                </tr>
                <tr>
                  <td className="p-3">SEO Tier</td>
                  <td className="p-3 text-center">Basic On-Page</td>
                  <td className="p-3 text-center text-amber-500 bg-amber-500/5 font-semibold">Advanced + Google Profile</td>
                  <td className="p-3 text-center text-emerald-500 font-semibold">Full SEO Campaign</td>
                </tr>
                <tr>
                  <td className="p-3">PPC Ads & Email Marketing</td>
                  <td className="p-3 text-center text-slate-400">—</td>
                  <td className="p-3 text-center text-slate-400 bg-amber-500/5">Optional Add-on</td>
                  <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="p-3">Website Maintenance & Care Plan</td>
                  <td className="p-3 text-center text-slate-400">Optional Add-on</td>
                  <td className="p-3 text-center text-slate-400 bg-amber-500/5">Optional Add-on</td>
                  <td className="p-3 text-center text-emerald-500 font-bold">3 Months Included</td>
                </tr>
                <tr>
                  <td className="p-3">Free Post-Launch Support</td>
                  <td className="p-3 text-center">30 Days</td>
                  <td className="p-3 text-center font-bold text-amber-500 bg-amber-500/5">60 Days</td>
                  <td className="p-3 text-center font-bold text-indigo-400">90 Days Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: PROPOSAL / QUOTE CALCULATOR */}
      {selectedTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Interactive Proposal Builder</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select a base tier and toggle custom add-ons to build an instant client quote.</p>
            </div>

            {/* Step 1: Base Tier Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Select Base Website Package</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setBasePackage("starter")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    basePackage === "starter"
                      ? "border-brand-500 bg-brand-500/10 text-slate-900 dark:text-white font-bold"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="text-xs font-bold">Starter</div>
                  <div className="text-[10px] text-slate-500">5 Pages • Basic SEO</div>
                </button>

                <button
                  onClick={() => setBasePackage("professional")}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    basePackage === "professional"
                      ? "border-amber-400 bg-amber-500/10 text-slate-900 dark:text-white font-bold"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="text-xs font-bold text-amber-500">Professional ⭐</div>
                  <div className="text-[10px] text-slate-500">10 Pages • Brand Kit</div>
                </button>

                <button
                  onClick={() => setBasePackage("premium")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    basePackage === "premium"
                      ? "border-indigo-500 bg-indigo-500/10 text-slate-900 dark:text-white font-bold"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="text-xs font-bold text-indigo-400">Premium</div>
                  <div className="text-[10px] text-slate-500">Unlimited • AI & Ads</div>
                </button>
              </div>
            </div>

            {/* Step 2: Add-Ons Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Toggle Custom Add-Ons</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ADD_ONS.map((addon) => {
                  const isChecked = selectedAddOns.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{addon.name}</span>
                          <span className="text-[11px] text-brand-600 dark:text-cyan-400 font-extrabold">{addon.estPrice}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{addon.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Proposal Summary Sidebar */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Proposal Summary</h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Base Tier</span>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {basePackage === "starter" && "Starter Website"}
                    {basePackage === "professional" && "Professional Website ⭐"}
                    {basePackage === "premium" && "Premium Website"}
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Included Add-Ons ({selectedAddOns.length})</span>
                  {selectedAddOns.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No add-ons selected</div>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {ADD_ONS.filter(a => selectedAddOns.includes(a.id)).map(a => (
                        <li key={a.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="truncate max-w-[170px]">• {a.name}</span>
                          <span className="font-bold text-brand-600 dark:text-cyan-400">{a.estPrice}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCopyProposalSummary}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-brand-500/20"
              >
                <ShareIcon className="h-4 w-4" />
                <span>{copiedQuote ? "Copied Proposal Text!" : "Copy Proposal Summary"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: A LA CARTE ADD-ONS CATALOG */}
      {selectedTab === "addons" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category 1 */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 border-l-4 border-l-brand-500">
              <div className="flex items-center space-x-2">
                <PaintBrushIcon className="h-5 w-5 text-brand-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Brand & Creative Add-Ons</h3>
              </div>
              <div className="space-y-3">
                {ADD_ONS.filter(a => a.category === "Brand & Creative").map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <span className="font-extrabold text-brand-600 dark:text-cyan-400 ml-3">{item.estPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 2 */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 border-l-4 border-l-amber-500">
              <div className="flex items-center space-x-2">
                <GlobeIcon className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Marketing & Growth Add-Ons</h3>
              </div>
              <div className="space-y-3">
                {ADD_ONS.filter(a => a.category === "Marketing & Growth").map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <span className="font-extrabold text-amber-500 ml-3">{item.estPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 3 */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 border-l-4 border-l-indigo-500">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Advanced Features & AI</h3>
              </div>
              <div className="space-y-3">
                {ADD_ONS.filter(a => a.category === "Advanced Features").map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <span className="font-extrabold text-indigo-400 ml-3">{item.estPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 4 */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 border-l-4 border-l-emerald-500">
              <div className="flex items-center space-x-2">
                <ShieldExclamationIcon className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Hosting, Security & Care Plans</h3>
              </div>
              <div className="space-y-3">
                {ADD_ONS.filter(a => a.category === "Care & Security").map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <span className="font-extrabold text-emerald-500 ml-3">{item.estPrice}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Final Rivernet Solutions Website Conversion Banner */}
      <div className="glass-panel rounded-3xl p-8 border-2 border-brand-500/40 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl mt-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
            <span>🌐 Ready to Upgrade Your Digital Platform?</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Partner with Rivernet Solutions
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Transform your local business presence, rank #1 on Google, and convert online visitors into high-value paying clients.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href="https://rivernetsolutions.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 via-cyan-500 to-indigo-500 hover:from-brand-400 hover:to-cyan-400 text-xs font-extrabold text-white shadow-xl hover:shadow-cyan-500/25 transition-all flex items-center space-x-2"
          >
            <span>Visit Rivernet Solutions →</span>
          </a>
          <a
            href="https://rivernetsolutions.com/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
          >
            <span>Book Consultation</span>
          </a>
        </div>
      </div>

      {/* Website Integration & iFrame Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 border border-brand-500/40 bg-slate-900 text-white space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowEmbedModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 text-brand-400 text-xs font-bold uppercase tracking-wider">
                <GlobeIcon className="h-4 w-4" />
                <span>Website Integration Helper</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Embed Packages Calculator on rivernetsolutions.com</h3>
              <p className="text-xs text-slate-400">
                You can easily add this interactive pricing & package tool to any page on your website (e.g. <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">rivernetsolutions.com/pricing</code> or <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">rivernetsolutions.com/packages</code>).
              </p>
            </div>

            {/* Option 1: Direct Link */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">1. Standalone Public Page URL:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/packages`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-400 font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/packages`);
                    setCopiedEmbed(true);
                    setTimeout(() => setCopiedEmbed(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shrink-0 transition-colors"
                >
                  {copiedEmbed ? "Copied! ✓" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Option 2: iFrame Snippet */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">2. HTML / WordPress / Webflow iFrame Code:</label>
              <textarea
                readOnly
                rows={4}
                value={`<!-- Rivernet Solutions Interactive Pricing Embed -->\n<iframe src="${window.location.origin}/packages" width="100%" height="950px" style="border:none; border-radius:24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);" title="Rivernet Website Packages"></iframe>\n<p style="text-align:center; font-size:12px; margin-top:12px;"><a href="https://rivernetsolutions.com/" target="_blank">Powered by Rivernet Solutions</a></p>`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    const snippet = `<iframe src="${window.location.origin}/packages" width="100%" height="950px" style="border:none; border-radius:24px;"></iframe>`;
                    navigator.clipboard.writeText(snippet);
                    setCopiedEmbed(true);
                    setTimeout(() => setCopiedEmbed(false), 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                >
                  {copiedEmbed ? "Copied HTML Code! ✓" : "Copy HTML Snippet"}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Final redirect button links to: <strong className="text-cyan-400">https://rivernetsolutions.com/</strong></span>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
