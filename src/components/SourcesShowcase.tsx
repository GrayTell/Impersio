import React, { useState } from "react";
import { Search, ExternalLink, ShieldCheck, Landmark, ShieldAlert, Crosshair } from "lucide-react";
import { INTELLIGENCE_SOURCES, getFaviconUrl } from "../utils/sourceHelper";

interface SourcesShowcaseProps {
  onSelectSource?: (name: string, url: string) => void;
  interactiveMode?: boolean;
}

export default function SourcesShowcase({ onSelectSource, interactiveMode = false }: SourcesShowcaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "counter-terrorism" | "military" | "crime">("all");

  const filteredSources = INTELLIGENCE_SOURCES.filter((source) => {
    const matchesSearch =
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || source.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-amber-500 tracking-tight flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-500" />
            Verified Source Catalog
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Access direct, verified indices of international intelligence, military commands, and federal units.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search verified agencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-500 border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "counter-terrorism", "military", "crime"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider border transition-all ${
              activeCategory === cat
                ? "bg-amber-500 text-black border-amber-400 font-bold"
                : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-zinc-700"
            }`}
          >
            {cat === "all" ? "All Sources" : cat.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Sources list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredSources.length > 0 ? (
          filteredSources.map((source, index) => {
            const favicon = getFaviconUrl(source.url);
            return (
              <div
                key={index}
                className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded-lg p-3 flex items-start gap-3 transition-all group"
              >
                {/* Logo wrapper */}
                <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={favicon}
                    alt={source.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                    referrerPolicy="no-referrer"
                  />
                  {/* Fallback icon if img fails */}
                  <ShieldCheck className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                </div>

                {/* Meta details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-zinc-200 group-hover:text-amber-500 transition-colors truncate">
                    {source.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">{source.url}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase font-mono tracking-widest">
                      {source.category}
                    </span>
                    {interactiveMode && onSelectSource && (
                      <button
                        onClick={() => onSelectSource(source.name, source.url)}
                        className="text-[9px] text-amber-500 hover:underline ml-auto flex items-center gap-0.5 font-semibold"
                      >
                        Use Source
                      </button>
                    )}
                    {!interactiveMode && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-zinc-400 hover:text-amber-500 ml-auto flex items-center gap-0.5 transition-colors font-mono"
                      >
                        Visit <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-zinc-500 text-sm">
            No agencies match current search parameters.
          </div>
        )}
      </div>

      {/* Verified footprint */}
      <div className="mt-4 pt-4 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Federal Verification System Active
        </span>
        <span>Secure Secure-Tunnel Layer (SSL)</span>
      </div>
    </div>
  );
}
