import React, { useState } from "react";
import { CheckCircle2, XCircle, Trash2, Clock, Mail, ShieldAlert, Globe, Edit3 } from "lucide-react";
import { Paper, Source } from "../types";
import { getFaviconUrl } from "../utils/sourceHelper";

interface AdminInboxProps {
  pendingPapers: Paper[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  actionInProgress: string | null; // Stores id of paper currently processing
}

export default function AdminInbox({
  pendingPapers,
  onApprove,
  onReject,
  onDelete,
  actionInProgress
}: AdminInboxProps) {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Editable fields for Admin
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<"counter-terrorism" | "military" | "crime">("counter-terrorism");

  const startReview = (paper: Paper) => {
    setSelectedPaper(paper);
    setEditTitle(paper.title);
    setEditSummary(paper.summary);
    setEditContent(paper.content);
    setEditCategory(paper.category);
    setRejectionReason("");
    setShowRejectModal(false);
    setEditMode(false);
  };

  const handleApprove = async (id: string) => {
    try {
      await onApprove(id);
      setSelectedPaper(null);
    } catch (e) {
      alert("Failed to approve briefing: " + e);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedPaper) return;
    if (!rejectionReason.trim()) {
      alert("Please state a valid reason for declining this intelligence document.");
      return;
    }
    try {
      await onReject(selectedPaper.id, rejectionReason);
      setShowRejectModal(false);
      setSelectedPaper(null);
    } catch (e) {
      alert("Failed to decline briefing: " + e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you certain you wish to purge this intelligence record permanently from all secure servers? This action is irreversible.")) return;
    try {
      await onDelete(id);
      setSelectedPaper(null);
    } catch (e) {
      alert("Failed to purge document: " + e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Pending Briefings Index List */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-amber-500 animate-pulse" />
            Admin Pending Inbox ({pendingPapers.length})
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Submissions require meticulous source and factual audits before publication approval.
          </p>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {pendingPapers.length > 0 ? (
              pendingPapers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => startReview(paper)}
                  className={`border p-3 rounded-lg cursor-pointer transition-all ${
                    selectedPaper?.id === paper.id
                      ? "bg-amber-500/10 border-amber-500/50"
                      : "bg-zinc-950 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-500 font-mono font-bold uppercase tracking-wider">
                      {paper.category}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{paper.title}</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">Submitted by: {paper.authorEmail}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-zinc-600 text-xs font-mono">
                [ NO PENDING SUBMISSIONS IN QUEUE ]
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review & Edit Panel Workspace */}
      <div className="lg:col-span-7">
        {selectedPaper ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[9px] text-zinc-500 font-mono block">DOCUMENT SECURITY ID: {selectedPaper.id}</span>
                <span className="text-xs text-zinc-400">Author: <strong className="text-zinc-200">{selectedPaper.authorEmail}</strong></span>
              </div>
              <button
                onClick={() => handleDelete(selectedPaper.id)}
                className="p-1.5 bg-zinc-950 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-850 hover:border-red-900 rounded transition-all flex items-center gap-1 text-[10px] font-mono"
                title="Force Purge Document"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge
              </button>
            </div>

            {/* Title / Meta */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">
                Document Title
              </span>
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">{selectedPaper.title}</h2>
            </div>

            {/* Summary */}
            <div className="bg-zinc-950 border border-zinc-850 p-3 rounded font-mono text-xs text-zinc-400">
              <span className="text-[9px] text-amber-500/70 font-bold block mb-1 uppercase tracking-wider">
                System Brief Snippet
              </span>
              {selectedPaper.summary}
            </div>

            {/* Content body */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded text-sm text-zinc-300 font-mono max-h-[300px] overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {selectedPaper.content}
            </div>

            {/* Backed sources check */}
            <div className="border-t border-zinc-800 pt-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Audit Sources & Links ({selectedPaper.sources.length})
              </h4>
              <div className="space-y-2">
                {selectedPaper.sources.map((source, index) => {
                  const favicon = getFaviconUrl(source.url);
                  return (
                    <div key={index} className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-md flex items-center gap-3">
                      <img
                        src={favicon}
                        alt="favicon"
                        className="w-5 h-5 object-contain rounded shrink-0 bg-zinc-900"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-zinc-200 block truncate">{source.name}</span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-zinc-500 font-mono hover:text-amber-500 hover:underline flex items-center gap-0.5 mt-0.5 truncate"
                        >
                          {source.url} <Globe className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decline Input Box if requested */}
            {showRejectModal && (
              <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg space-y-3">
                <label className="text-xs text-red-400 font-mono font-bold uppercase block">
                  State Reason for Decline (Sent to Author)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason: Missing verified citations. Please add backed government sources..."
                  className="w-full bg-zinc-950 text-zinc-200 border border-red-900 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded font-mono font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!showRejectModal && (
              <div className="border-t border-zinc-800 pt-4 flex gap-2 justify-end">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionInProgress !== null}
                  className="px-4 py-2 bg-zinc-950 hover:bg-red-950 text-red-500 hover:text-red-400 border border-zinc-850 hover:border-red-900 font-bold uppercase tracking-wider rounded text-[11px] font-mono transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Decline Submission
                </button>
                <button
                  onClick={() => handleApprove(selectedPaper.id)}
                  disabled={actionInProgress !== null}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded text-[11px] font-mono transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Publish
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-850 border-dashed rounded-lg p-12 text-center text-zinc-600 font-mono text-sm">
            [ SELECT A PENDING BRIEFING FROM THE INBOX QUEUE TO BEGIN REVIEW AUDIT ]
          </div>
        )}
      </div>
    </div>
  );
}
