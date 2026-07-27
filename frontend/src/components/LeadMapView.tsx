import { useState } from "react";
import { CheckCircleIcon, XCircleIcon, FlameIcon } from "./Icons";

interface LeadMapViewProps {
  leads: any[];
  onSelectLead: (id: number) => void;
}

export default function LeadMapView({ leads, onSelectLead }: LeadMapViewProps) {
  const [activeLead, setActiveLead] = useState<any | null>(leads[0] || null);

  // Group leads by geographic spread bounds
  const validLeads = leads.filter((l) => l.lat && l.lng);

  if (validLeads.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
        No map coordinates found for current leads. Run a local search above to plot live business pins.
      </div>
    );
  }

  // Calculate min/max for map scaling
  const lats = validLeads.map((l) => l.lat);
  const lngs = validLeads.map((l) => l.lng);
  const minLat = Math.min(...lats) - 0.01;
  const maxLat = Math.max(...lats) + 0.01;
  const minLng = Math.min(...lngs) - 0.01;
  const maxLng = Math.max(...lngs) + 0.01;

  // Convert lat/lng to percentage X, Y
  const getPosition = (lat: number, lng: number) => {
    const y = 100 - ((lat - minLat) / (maxLat - minLat || 1)) * 100;
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * 100;
    return {
      top: `${Math.max(8, Math.min(88, y))}%`,
      left: `${Math.max(8, Math.min(88, x))}%`,
    };
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-800 relative shadow-lg">
      
      {/* Map Header & Legend */}
      <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 pulse-dot"></span>
          <h3 className="font-bold text-sm">Interactive Geo-Territory Prospect Map</h3>
          <span className="text-xs text-slate-400">({validLeads.length} Pins Plotted)</span>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500 glow-brand"></span>
            <span className="text-slate-300">Hot Lead (90+)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Warm Lead (70-89)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-brand-500"></span>
            <span className="text-slate-300">Medium / Standard</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Surface */}
      <div className="relative h-[480px] w-full bg-[#0a0f1d] grid-bg overflow-hidden">
        
        {/* Subtle grid mesh overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

        {/* Map Pins */}
        {validLeads.map((lead) => {
          const pos = getPosition(lead.lat, lead.lng);
          const isSelected = activeLead?.id === lead.id;
          const isHot = lead.lead_score >= 90;
          const isWarm = lead.lead_score >= 70 && lead.lead_score < 90;

          return (
            <div
              key={lead.id}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => setActiveLead(lead)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
            >
              {/* Pin marker pulse ring */}
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isSelected ? "scale-125 z-30" : "hover:scale-110"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg transition-transform ${
                    isHot
                      ? "bg-rose-500 shadow-rose-500/40 glow-brand"
                      : isWarm
                      ? "bg-amber-500 shadow-amber-500/30"
                      : "bg-brand-500 shadow-brand-500/30"
                  } ${isSelected ? "ring-4 ring-white dark:ring-slate-900" : ""}`}
                >
                  {isHot ? <FlameIcon className="h-4 w-4" /> : lead.lead_score || "•"}
                </div>

                {/* Hover Quick Label */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl border border-slate-800 pointer-events-none">
                  {lead.name}
                </div>
              </div>
            </div>
          );
        })}

        {/* Active Selected Pin Info Card (Overlay) */}
        {activeLead && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 glass-panel rounded-2xl p-5 shadow-2xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-xl text-white z-40 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Map Pin</span>
                <h4 className="font-extrabold text-base text-white mt-0.5">{activeLead.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{activeLead.address}</p>
              </div>

              <span
                className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${
                  activeLead.lead_score >= 90
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 glow-brand"
                    : "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                }`}
              >
                {activeLead.lead_score >= 90 && <span>🔥</span>}
                <span>Score: {activeLead.lead_score}</span>
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                <span className="font-semibold text-slate-200 truncate block mt-0.5">{activeLead.category || "Local Business"}</span>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Website Status</span>
                <span className="font-semibold text-slate-200 mt-0.5 flex items-center space-x-1">
                  {activeLead.website_url ? (
                    <>
                      <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 truncate">Online</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-3.5 w-3.5 text-rose-400" />
                      <span className="text-rose-400">Missing</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <button
                onClick={() => onSelectLead(activeLead.id)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 font-bold text-xs text-white shadow-md transition-all"
              >
                Inspect AI Audit & Outreach Drafts →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
