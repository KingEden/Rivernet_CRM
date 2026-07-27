import { 
  SparklesIcon, 
  GlobeIcon, 
  LightBulbIcon, 
  BoltIcon, 
  CheckCircleIcon
} from "../components/Icons";

export default function InfoDeck() {
  return (
    <div className="animate-fade-in space-y-8 pb-12">
      
      {/* Deck Header */}
      <div className="glass-panel rounded-3xl p-8 shadow-md border-t-4 border-t-brand-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-brand-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 pulse-dot"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">System Blueprint & AI Documentation</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Rivernet Prospector <span className="bg-gradient-to-r from-brand-500 via-cyan-400 to-brand-600 bg-clip-text text-transparent">Architecture Deck</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            Understand how our platform extracts local business profiles, runs asynchronous technical website audits, computes 0-100 opportunity scores, and generates GPT-4o AI prospecting outreach scripts with tailored pricing tier packages.
          </p>
        </div>
      </div>

      {/* Grid Section 1: Lead Extraction Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <GlobeIcon className="h-5 w-5 text-brand-500" />
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">1. How Leads Are Extracted</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1: OpenStreetMap & Google API */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-3 border-l-4 border-l-brand-500">
            <div className="h-9 w-9 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Dual API & Public Map Scrapers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Queries 100% real business places via OpenStreetMap Nominatim APIs and Google Places API across 19 core industries. Extracts verified business names, addresses, phone numbers, domain URLs, and coordinates.
            </p>
          </div>

          {/* Step 2: Metro Suburb Sweeper */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-3 border-l-4 border-l-cyan-500">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">🌐 Metro Region Expansion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              When <strong>Metro Region Sweep</strong> is enabled, the discovery engine expands beyond primary city limits to automatically scan neighboring satellite suburbs (e.g. <em>San Francisco</em> expands to <em>Oakland, Berkeley, Daly City, San Mateo</em>), yielding 3x to 5x more leads per run.
            </p>
          </div>

          {/* Step 3: Tech Crawler */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-3 border-l-4 border-l-purple-500">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">⚡ Asynchronous Web Crawler Audit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              For every discovered URL, our crawler inspects DOM headers to detect SSL security certificates, HTTP latency, mobile responsiveness, Meta ad pixels, Google Analytics, contact forms, and social media channels.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Section 2: AI Lead Scoring & Tier Pricing Matrix */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <BoltIcon className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">2. AI Lead-Scoring Algorithm & Tier Pricing Matrix</h2>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Higher scores represent businesses with <strong>higher marketing vulnerability</strong> and lower digital quality, making them prime candidates for agency outreach.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-500">Missing Website</span>
                <span className="text-xs font-black text-rose-500">+40 Pts</span>
              </div>
              <p className="text-[11px] text-slate-400">Business operates on Google Maps without any active web domain.</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500">Poor Design / Speed</span>
                <span className="text-xs font-black text-amber-500">+20 Pts</span>
              </div>
              <p className="text-[11px] text-slate-400">Website load speed latency &gt; 3.0s or outdated layout score.</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400">Weak SEO & Metadata</span>
                <span className="text-xs font-black text-purple-400">+10 Pts</span>
              </div>
              <p className="text-[11px] text-slate-400">Missing meta titles, headers, or local SEO optimization tags.</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400">No Social Pages</span>
                <span className="text-xs font-black text-blue-400">+15 Pts</span>
              </div>
              <p className="text-[11px] text-slate-400">No active Facebook, Instagram, or LinkedIn links detected.</p>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-yellow-500">Low Review Count</span>
                <span className="text-xs font-black text-yellow-500">+10 Pts</span>
              </div>
              <p className="text-[11px] text-slate-400">Fewer than 15 reviews on Google Maps listing.</p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">No Ad Pixels</span>
                <span className="text-xs font-black text-indigo-400">+5 Pts</span>
              </div>
              <p className="text-[11px] text-slate-400">Missing Facebook Meta Pixel or Google Ads tracking tag.</p>
            </div>
          </div>

          {/* Pricing Tier Packages Breakdown */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              💵 Agency Package Prices & Retainer Tiers by Lead Score
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Hot Lead Tier */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-rose-500 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                      🔥 Hot Lead Tier
                    </span>
                    <span className="text-xs font-extrabold text-slate-400">90–100 Pts</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Foundational Overhaul</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Businesses operating without any website or with critical SSL/domain security failures.
                  </p>
                </div>
                <div className="pt-3 border-t border-rose-500/20 space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase text-[10px]">Setup Price:</div>
                  <div className="text-base font-black text-rose-500">$2,500 – $5,000</div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+ $500 – $1,200 / mo retainer</div>
                  <div className="text-[10px] text-slate-400 font-medium">85%+ Conversion Chance</div>
                </div>
              </div>

              {/* Warm Lead Tier */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      🟠 Warm Lead Tier
                    </span>
                    <span className="text-xs font-extrabold text-slate-400">70–89 Pts</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Full Web Redesign</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Outdated layout (5+ yrs old), slow loading latency (&gt;3.0s), and missing contact capture forms.
                  </p>
                </div>
                <div className="pt-3 border-t border-amber-500/20 space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase text-[10px]">Setup Price:</div>
                  <div className="text-base font-black text-amber-500">$1,500 – $3,000</div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+ $400 – $800 / mo retainer</div>
                  <div className="text-[10px] text-slate-400 font-medium">70% Conversion Chance</div>
                </div>
              </div>

              {/* Medium Lead Tier */}
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                      🟡 Medium Tier
                    </span>
                    <span className="text-xs font-extrabold text-slate-400">50–69 Pts</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">SEO & Social Growth</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Functional web presence but missing meta titles, local SEO tags, and inactive social pages.
                  </p>
                </div>
                <div className="pt-3 border-t border-yellow-500/20 space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase text-[10px]">Setup Price:</div>
                  <div className="text-base font-black text-yellow-600 dark:text-yellow-400">$800 – $1,800</div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+ $300 – $600 / mo retainer</div>
                  <div className="text-[10px] text-slate-400 font-medium">50% Conversion Chance</div>
                </div>
              </div>

              {/* Low Priority Tier */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-500 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">
                      ⚪ Low Priority
                    </span>
                    <span className="text-xs font-extrabold text-slate-400">&lt; 50 Pts</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">PPC & Optimization</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Modern website and active social channels. Pitch conversion rate optimization or Meta/Google Ads.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase text-[10px]">Setup Price:</div>
                  <div className="text-base font-black text-slate-700 dark:text-slate-300">$500 Setup</div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+ $500 – $1,000 / mo retainer</div>
                  <div className="text-[10px] text-slate-400 font-medium">35% Conversion Chance</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid Section 3: GPT-4o AI Prospecting & Outreach */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-brand-500" />
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">3. GPT-4o AI Prospecting & Outreach Drafts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              <span>Personalized Cold Email & Call Script Engine</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Using the specific business name, location, rating, and audit findings, our AI generates hyper-personalized cold emails, cold call talking points, and LinkedIn messages referencing their exact strengths (e.g. <em>"4.8 stars in San Francisco"</em>) while highlighting their specific digital gaps.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <LightBulbIcon className="h-4 w-4 text-brand-500" />
              <span>Public Executive Proposals & Meeting Briefs</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generates shareable 1-click links (<code className="text-brand-500 font-mono text-[11px]">/share/report/:token</code>) that produce unbranded client audit presentations and phone meeting discovery guides designed to close website design retainers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
