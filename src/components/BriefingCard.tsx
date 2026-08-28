import React, { useState } from "react";
import { ChevronDown, ChevronUp, Globe, ShieldAlert, ShieldCheck, Crosshair, ExternalLink, Calendar, Mail, Trash2 } from "lucide-react";
import { Paper } from "../types";
import { getFaviconUrl } from "../utils/sourceHelper";

interface BriefingCardProps {
  key?: string;
  paper: Paper;
  isAdmin: boolean;
  onDelete?: (id: string) => Promise<void>;
}

export default function BriefingCard({ paper, isAdmin, onDelete }: BriefingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Category mapping styles
  const categoryStyles = {
    "counter-terrorism": {
      tag: "bg-red-950/40 border-red-900 text-red-500",
      accent: "border-l-4 border-l-red-600",
      icon: ShieldAlert,
    },
    military: {
      tag: "bg-amber-950/40 border-amber-900 text-amber-500",
      accent: "border-l-4 border-l-amber-600",
      icon: Crosshair,
    },
    crime: {
      tag: "bg-blue-950/40 border-blue-900 text-blue-500",
      accent: "border-l-4 border-l-blue-600",
      icon: ShieldCheck,
    },
  };

  const currentStyle = categoryStyles[paper.category] || categoryStyles["counter-terrorism"];
  const IconComponent = currentStyle.icon;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    if (!confirm("Are you absolutely sure you want to permanently delete this published briefing from the public records? This action cannot be undone.")) return;
    try {
      await onDelete(paper.id);
    } catch (err) {
      alert("Failed to delete briefing: " + err);
    }
  };

  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-zinc-700 shadow-xl ${
        currentStyle.accent
      }`}
    >
      {/* Header Info */}
      <div className="p-5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${currentStyle.tag}`}>
              {paper.category}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(paper.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 bg-zinc-950 border border-zinc-850 hover:border-red-900 text-zinc-500 hover:text-red-400 rounded transition-all"
                title="Admin Purge Briefing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-zinc-500 hover:text-zinc-300 transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-md font-bold text-zinc-100 tracking-tight leading-snug group-hover:text-amber-500 transition-colors">
          {paper.title}
        </h3>

        {/* Summary Snippet */}
        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 font-sans font-normal leading-relaxed">
          {paper.summary}
        </p>

        {/* Author / Origin Footnote */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zinc-850/30 text-[10px] text-zinc-500 font-mono">
          <IconComponent className="w-3.5 h-3.5 text-zinc-500" />
          <span>ORIGIN RECORD:</span>
          <span className="text-zinc-400">{paper.authorEmail === "sapkotaanubhav91@gmail.com" ? "FEDERAL DIRECTIVE" : paper.authorEmail}</span>
        </div>
      </div>

      {/* Expanded Content View */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 border-t border-zinc-850 bg-zinc-950/40 space-y-4">
          {/* Main Body */}
          <div className="prose prose-invert prose-sm max-w-none text-zinc-300 font-sans leading-relaxed text-xs space-y-3 whitespace-pre-wrap">
            {paper.content}
          </div>

          {/* Sources Footnote Box */}
          {paper.sources && paper.sources.length > 0 && (
            <div className="border-t border-zinc-800 pt-4 mt-4">
              <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                Verified Intelligence Sources ({paper.sources.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {paper.sources.map((src, i) => {
                  const favicon = getFaviconUrl(src.url);
                  return (
                    <div
                      key={i}
                      className="bg-zinc-950 border border-zinc-850 p-2.5 rounded flex items-center gap-2.5 hover:border-zinc-700 transition-all group"
                    >
                      {/* Logo Preview */}
                      <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={favicon}
                          alt="Source Logo"
                          className="w-4.5 h-4.5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                          referrerPolicy="no-referrer"
                        />
                        <Globe className="w-4 h-4 text-zinc-700 group-hover:text-amber-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-zinc-300 block truncate group-hover:text-amber-500 transition-colors">
                          {src.name}
                        </span>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] text-zinc-500 font-mono hover:text-amber-500 hover:underline flex items-center gap-0.5 truncate"
                        >
                          {src.url} <ExternalLink className="w-2 h-2" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
