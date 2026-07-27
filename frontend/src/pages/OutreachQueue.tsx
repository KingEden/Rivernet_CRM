import { useEffect, useState } from "react";
import { api } from "../api";
import LeadDetailDrawer from "../components/LeadDetailDrawer";

interface Lead {
  id: number;
  name: string;
  category: string;
  rating: number;
  lead_score: number;
  lead_status: string;
  crm_status: string;
  suggested_monthly_budget?: number;
}

const STAGES = [
  { id: "NEW", name: "New Leads", color: "border-t-slate-400 bg-slate-100/50 dark:bg-slate-900/30", badgeColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { id: "OUTREACHED", name: "Outreached", color: "border-t-orange-500 bg-orange-500/5", badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400" },
  { id: "PROPOSAL_SENT", name: "Proposal Sent", color: "border-t-purple-500 bg-purple-500/5", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400" },
  { id: "MEETING_SCHEDULED", name: "Meetings Set", color: "border-t-blue-500 bg-blue-500/5", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400" },
  { id: "WON", name: "Won (Active)", color: "border-t-green-500 bg-green-500/5", badgeColor: "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400" }
];

export default function OutreachQueue() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drag and Drop active status indicator
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Admin / main account checks
  const userObj = localStorage.getItem("rivernet_user");
  const userEmail = userObj ? JSON.parse(userObj).email : "";
  const isAdmin = userEmail === "agency@rivernet.io" || userEmail.endsWith("@rivernet.io");

  // Admin password confirmation state
  const [deleteConfirmLeadId, setDeleteConfirmLeadId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const openDeleteModal = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmLeadId(id);
    setDeletePassword("");
    setDeleteError("");
    setDeleteSubmitting(false);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteConfirmLeadId) return;
    setDeleteError("");
    setDeleteSubmitting(true);
    try {
      await api.deleteLead(deleteConfirmLeadId, deletePassword);
      setLeads(prevLeads => prevLeads.filter(l => l.id !== deleteConfirmLeadId));
      if (selectedLeadId === deleteConfirmLeadId) {
        setIsDrawerOpen(false);
      }
      setDeleteConfirmLeadId(null);
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.message || "Verification failed. Incorrect admin password.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

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

  useEffect(() => {
    fetchLeads();
  }, []);

  // Update lead CRM stage (directly or via drag-and-drop)
  const updateLeadStage = async (id: number, targetStage: string) => {
    try {
      await api.updateLead(id, { crm_status: targetStage });
      setLeads(prevLeads => 
        prevLeads.map(l => l.id === id ? { ...l, crm_status: targetStage } : l)
      );
    } catch (err) {
      console.error("Failed to update pipeline stage", err);
      alert("Error updating pipeline stage");
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData("text/plain", String(leadId));
    // Set a ghost drag image transparency effect if needed
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (dragOverColumn !== stageId) {
      setDragOverColumn(stageId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadIdStr = e.dataTransfer.getData("text/plain");
    const leadId = Number(leadIdStr) || draggedLeadId;
    
    if (leadId) {
      updateLeadStage(leadId, stageId);
    }
    setDraggedLeadId(null);
  };

  // Filter leads based on the pipeline search query
  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered leads by stage
  const getLeadsByStage = (stageId: string) => {
    return filteredLeads.filter(l => l.crm_status === stageId);
  };

  // Calculate sum of budgets for a stage
  const getStageTotalBudget = (stageId: string) => {
    const stageLeads = getLeadsByStage(stageId);
    return stageLeads.reduce((sum, l) => sum + (l.suggested_monthly_budget || 0), 0);
  };

  const getLostLeads = () => {
    return filteredLeads.filter(l => l.crm_status === "LOST");
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Outreach CRM Pipeline</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Drag and drop leads, audit monthly budgets, and optimize sales conversions.</p>
        </div>

        {/* Real-time CRM Lead Filter */}
        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals by name or category..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm focus:border-brand-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {/* Kanban Columns */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5 items-start">
            {STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id);
              const totalBudget = getStageTotalBudget(stage.id);
              const isOver = dragOverColumn === stage.id;

              return (
                <div 
                  key={stage.id} 
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`rounded-2xl border p-4 border-t-4 transition-all duration-205 flex flex-col min-h-[550px] ${stage.color} ${
                    isOver 
                      ? "border-brand-500 border-dashed scale-[1.01] bg-brand-500/5 dark:bg-brand-500/10 shadow-lg" 
                      : "border-slate-200/50 dark:border-slate-800/80"
                  }`}
                >
                  {/* Column Header */}
                  <div className="mb-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{stage.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${stage.badgeColor}`}>
                        {stageLeads.length}
                      </span>
                    </div>
                    {/* Deal Value Sum */}
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      <span>Total Value:</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">${totalBudget.toLocaleString()}/mo</span>
                    </div>
                  </div>

                  {/* Cards container */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[580px] pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-200/30 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-950/10">
                        Drag leads here
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div 
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setIsDrawerOpen(true);
                          }}
                          className={`glass-panel glass-panel-hover rounded-xl p-3.5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm cursor-grab active:cursor-grabbing space-y-2 relative transition-all ${
                            draggedLeadId === lead.id ? "opacity-45 scale-95 border-brand-500" : ""
                          }`}
                        >
                          {/* Card Header details */}
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-slate-850 dark:text-white text-xs leading-snug line-clamp-2">
                              {lead.name}
                            </span>
                            <span className={`shrink-0 inline-flex items-center rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                              lead.lead_status === 'Hot Lead' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              lead.lead_status === 'Warm Lead' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              lead.lead_status === 'Medium Lead' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {lead.lead_score}
                            </span>
                          </div>

                          {/* Industry / Category tag */}
                          <div className="text-[10px] text-slate-400">{lead.category}</div>
                          
                          {/* Monthly Retainer budget */}
                          {lead.suggested_monthly_budget && (
                            <div className="text-xs font-bold text-green-600 dark:text-green-400 flex justify-between items-center bg-green-500/5 px-2 py-0.5 rounded-lg border border-green-500/10">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Monthly Retainer</span>
                              <span>${lead.suggested_monthly_budget.toLocaleString()}/mo</span>
                            </div>
                          )}

                          {/* Quick Stage Mover Selector */}
                          <div className="border-t border-slate-100 dark:border-slate-850 pt-2 mt-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-end justify-between gap-2">
                              <div className="flex-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quick Stage Jump</label>
                                <select
                                  value={lead.crm_status}
                                  onChange={(e) => updateLeadStage(lead.id, e.target.value)}
                                  className="w-full text-[10px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg p-1 font-semibold text-slate-650 dark:text-slate-350 focus:outline-none"
                                >
                                  <option value="NEW">New</option>
                                  <option value="OUTREACHED">Outreached</option>
                                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                                  <option value="MEETING_SCHEDULED">Meeting Set</option>
                                  <option value="WON">Won (Active)</option>
                                  <option value="LOST">Lost ✗</option>
                                </select>
                              </div>
                              
                              {/* Option to delete from WON (Closed Won) stage if admin */}
                              {lead.crm_status === "WON" && isAdmin && (
                                <button
                                  onClick={(e) => openDeleteModal(lead.id, e)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0"
                                  title="Delete Lead from Pipeline"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lost Deals Section */}
          {getLostLeads().length > 0 && (
            <div className="glass-panel rounded-2xl p-5 border border-red-500/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Closed / Lost Pipeline Leads ({getLostLeads().length})</h3>
                <span className="text-[11px] text-red-500 font-semibold uppercase">Excludes from Active Pipeline value</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {getLostLeads().map((lead) => (
                  <div 
                    key={lead.id}
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      setIsDrawerOpen(true);
                    }}
                    className="border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 transition-colors p-3 rounded-xl cursor-pointer flex items-center space-x-4"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{lead.name}</span>
                      <span className="block text-[10px] text-red-500 font-semibold">{lead.category}</span>
                    </div>
                    <div className="flex items-center space-x-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { 
                          updateLeadStage(lead.id, "NEW"); 
                        }}
                        className="text-[10px] font-bold text-brand-500 hover:underline"
                      >
                        Reopen Lead
                      </button>
                      
                      {isAdmin && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700 text-[10px]">|</span>
                          <button
                            onClick={(e) => openDeleteModal(lead.id, e)}
                            className="text-[10px] font-bold text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details drawer */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={fetchLeads}
      />

      {/* Admin Password Verification Modal */}
      {deleteConfirmLeadId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 space-y-4">
            <div className="flex items-center space-x-3 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Secure Admin Action Required</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You are about to permanently delete a lead from the Closed Pipeline database. To proceed, please verify your administrator password.
            </p>

            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 block w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-sm focus:border-red-500 focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              {deleteError && (
                <div className="rounded-lg bg-red-500/10 p-2.5 border border-red-500/20 text-xs text-red-650 dark:text-red-400">
                  {deleteError}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmLeadId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {deleteSubmitting ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
