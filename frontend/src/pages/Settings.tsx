import React, { useEffect, useState } from "react";
import { api } from "../api";
import { KeyIcon, CogIcon, CheckIcon } from "../components/Icons";

export default function Settings() {
  const [googleKey, setGoogleKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiBase, setOpenaiBase] = useState("https://api.openai.com/v1");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  
  // Weights State
  const [wNoWebsite, setWNoWebsite] = useState(40);
  const [wPoorWebsite, setWPoorWebsite] = useState(20);
  const [wPoorSEO, setWPoorSEO] = useState(10);
  const [wWeakSocial, setWWeakSocial] = useState(15);
  const [wLowReviews, setWLowReviews] = useState(10);
  const [wOutdatedBranding, setWOutdatedBranding] = useState(5);

  // Tier Pricing Defaults State
  const [t1Setup, setT1Setup] = useState(3500);
  const [t1Retainer, setT1Retainer] = useState(1500);
  const [t2Setup, setT2Setup] = useState(2200);
  const [t2Retainer, setT2Retainer] = useState(1200);
  const [t3Setup, setT3Setup] = useState(1200);
  const [t3Retainer, setT3Retainer] = useState(800);
  const [t4Setup, setT4Setup] = useState(500);
  const [t4Retainer, setT4Retainer] = useState(500);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // Reset Database state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassword) return;
    try {
      setResetLoading(true);
      setResetError("");
      await api.resetDatabase(resetPassword);
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setResetError(err.message || "Failed to reset database. Verify admin password.");
    } finally {
      setResetLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      setGoogleKey(res.google_maps_api_key || "");
      setOpenaiKey(res.openai_api_key || "");
      setOpenaiBase(res.openai_api_base || "https://api.openai.com/v1");
      setOpenaiModel(res.openai_model || "gpt-4o-mini");
      setWNoWebsite(res.weight_no_website);
      setWPoorWebsite(res.weight_poor_website);
      setWPoorSEO(res.weight_poor_seo);
      setWWeakSocial(res.weight_weak_social);
      setWLowReviews(res.weight_low_reviews);
      setWOutdatedBranding(res.weight_outdated_branding);
      setT1Setup(res.tier1_setup_price || 3500);
      setT1Retainer(res.tier1_monthly_retainer || 1500);
      setT2Setup(res.tier2_setup_price || 2200);
      setT2Retainer(res.tier2_monthly_retainer || 1200);
      setT3Setup(res.tier3_setup_price || 1200);
      setT3Retainer(res.tier3_monthly_retainer || 800);
      setT4Setup(res.tier4_setup_price || 500);
      setT4Retainer(res.tier4_monthly_retainer || 500);
    } catch (err) {
      console.error("Error loading settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.saveSettings({
        google_maps_api_key: googleKey,
        openai_api_key: openaiKey,
        openai_api_base: openaiBase,
        openai_model: openaiModel,
        weight_no_website: wNoWebsite,
        weight_poor_website: wPoorWebsite,
        weight_poor_seo: wPoorSEO,
        weight_weak_social: wWeakSocial,
        weight_low_reviews: wLowReviews,
        weight_outdated_branding: wOutdatedBranding,
        tier1_setup_price: t1Setup,
        tier1_monthly_retainer: t1Retainer,
        tier2_setup_price: t2Setup,
        tier2_monthly_retainer: t2Retainer,
        tier3_setup_price: t3Setup,
        tier3_monthly_retainer: t3Retainer,
        tier4_setup_price: t4Setup,
        tier4_monthly_retainer: t4Retainer
      });
      setSavedMessage("Settings saved successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const totalWeight = wNoWebsite + wPoorWebsite + wPoorSEO + wWeakSocial + wLowReviews + wOutdatedBranding;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">Settings & API Keys</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Configure database credentials, integration parameters, and custom AI lead scoring math.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* API Configurations */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-brand-650 dark:text-brand-400">
            <KeyIcon className="h-5 w-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Integrations & API keys</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Google Places API Key</label>
              <input
                type="password"
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder="AI-powered Mockup Scans activated when empty"
                className="mt-1.5 block w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">OpenAI/Deepseek API Key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="Template text generator activated when empty"
                className="mt-1.5 block w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">LLM Base Endpoint</label>
              <input
                type="text"
                value={openaiBase}
                onChange={(e) => setOpenaiBase(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="mt-1.5 block w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">LLM Model Name</label>
              <input
                type="text"
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                placeholder="gpt-4o-mini"
                className="mt-1.5 block w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Lead scoring weights setup */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-brand-650 dark:text-brand-400">
              <CogIcon className="h-5 w-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">AI Scoring Formula weights</h3>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${totalWeight === 100 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
              Total Weight: {totalWeight}% (Target: 100%)
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-normal">
            Configure how heavily the Rivernet AI engine penalizes each technical deficiency. A worse score means the business lacks digital systems, marking them as a hotter prospect (higher score) for your agency.
          </p>

          <div className="space-y-4 pt-2">
            
            {/* Weight 1: No Website */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-650 dark:text-slate-350">Has No Website listed</span>
                <span className="text-brand-500">{wNoWebsite}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={wNoWebsite}
                onChange={(e) => setWNoWebsite(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Weight 2: Poor Website design */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-650 dark:text-slate-350">Poor Design Score (&lt;70)</span>
                <span className="text-brand-500">{wPoorWebsite}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={wPoorWebsite}
                onChange={(e) => setWPoorWebsite(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Weight 3: Poor SEO metadata */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-650 dark:text-slate-350">Missing Search Engine SEO Meta tags</span>
                <span className="text-brand-500">{wPoorSEO}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={wPoorSEO}
                onChange={(e) => setWPoorSEO(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Weight 4: Weak Social accounts */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-650 dark:text-slate-350">Weak Social Media accounts (No Facebook/Instagram)</span>
                <span className="text-brand-500">{wWeakSocial}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={wWeakSocial}
                onChange={(e) => setWWeakSocial(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Weight 5: Low ratings/reviews */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-650 dark:text-slate-350">Low reviews volume or rating (&lt;25 reviews)</span>
                <span className="text-brand-500">{wLowReviews}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={wLowReviews}
                onChange={(e) => setWLowReviews(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Weight 6: Outdated Branding (old site age) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-650 dark:text-slate-350">Legacy/Outdated website code age (&gt;=5 years old)</span>
                <span className="text-brand-500">{wOutdatedBranding}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={wOutdatedBranding}
                onChange={(e) => setWOutdatedBranding(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Agency Tier Default Pricing Configurations */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-brand-650 dark:text-brand-400">
            <div className="flex items-center space-x-2">
              <CogIcon className="h-5 w-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Agency Tier Package Pricing Defaults</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Configure default setup fees and monthly retainers per tier</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tier 1 Pricing */}
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-rose-500">🔥 Tier 1 (Hot 90-100)</span>
                <span className="text-[10px] text-slate-400 font-bold">High Priority Overhaul</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Setup Fee ($)</label>
                  <input
                    type="number"
                    value={t1Setup}
                    onChange={(e) => setT1Setup(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-extrabold focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Retainer ($/mo)</label>
                  <input
                    type="number"
                    value={t1Retainer}
                    onChange={(e) => setT1Retainer(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tier 2 Pricing */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-500">🟠 Tier 2 (Warm 70-89)</span>
                <span className="text-[10px] text-slate-400 font-bold">Full Web Redesign</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Setup Fee ($)</label>
                  <input
                    type="number"
                    value={t2Setup}
                    onChange={(e) => setT2Setup(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-extrabold focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Retainer ($/mo)</label>
                  <input
                    type="number"
                    value={t2Retainer}
                    onChange={(e) => setT2Retainer(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tier 3 Pricing */}
            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-yellow-600 dark:text-yellow-400">🟡 Tier 3 (Medium 50-69)</span>
                <span className="text-[10px] text-slate-400 font-bold">SEO & Growth</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Setup Fee ($)</label>
                  <input
                    type="number"
                    value={t3Setup}
                    onChange={(e) => setT3Setup(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-extrabold focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Retainer ($/mo)</label>
                  <input
                    type="number"
                    value={t3Retainer}
                    onChange={(e) => setT3Retainer(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tier 4 Pricing */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500">⚪ Tier 4 (Standard &lt;50)</span>
                <span className="text-[10px] text-slate-400 font-bold">PPC & CRO Retainer</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Setup Fee ($)</label>
                  <input
                    type="number"
                    value={t4Setup}
                    onChange={(e) => setT4Setup(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-extrabold focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Retainer ($/mo)</label>
                  <input
                    type="number"
                    value={t4Retainer}
                    onChange={(e) => setT4Retainer(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          {savedMessage ? (
            <span className="text-sm font-semibold text-green-500 animate-pulse">{savedMessage}</span>
          ) : <div />}
          
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center space-x-2 rounded-xl bg-brand-600 hover:bg-brand-500 py-3 px-6 text-sm font-semibold text-white transition-colors duration-150 disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone: Database Reset */}
      <div className="glass-panel rounded-2xl p-6 border border-red-500/20 bg-red-500/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-red-500 flex items-center space-x-2">
              <span>⚠️ Danger Zone</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Reset the database to clear all discovered leads, active audit reports, meeting briefs, and historical logs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* Password Confirmation Modal for Database Reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full glass-panel rounded-2xl p-6 border border-red-500/30 bg-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-500">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-bold">Confirm Database Reset</h3>
                <p className="text-xs text-slate-400">This action will permanently erase all leads and reports.</p>
              </div>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {resetError}
              </div>
            )}

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold text-center">
                Database successfully reset! Reloading...
              </div>
            ) : (
              <form onSubmit={handleResetDatabase} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Administrator Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password (e.g. rivernet2026)"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetPassword("");
                      setResetError("");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? "Resetting..." : "Confirm & Erase All"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
