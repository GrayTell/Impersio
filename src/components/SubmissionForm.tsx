import React, { useState } from "react";
import { Plus, Trash2, ShieldCheck, HelpCircle, FileText, Globe, RefreshCcw } from "lucide-react";
import { Paper, Source } from "../types";
import { getFaviconUrl } from "../utils/sourceHelper";
import SourcesShowcase from "./SourcesShowcase";

interface SubmissionFormProps {
  onSave: (paperData: Omit<Paper, "id" | "authorId" | "authorEmail" | "createdAt" | "updatedAt" | "status">) => Promise<void>;
  isSubmitting: boolean;
}

export default function SubmissionForm({ onSave, isSubmitting }: SubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"counter-terrorism" | "military" | "crime">("counter-terrorism");
  const [sources, setSources] = useState<Source[]>([{ name: "", url: "" }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const handleAddSource = () => {
    if (sources.length >= 10) {
      setError("Maximum of 10 sources are allowed per submission.");
      return;
    }
    setSources([...sources, { name: "", url: "" }]);
  };

  const handleRemoveSource = (index: number) => {
    const updated = sources.filter((_, i) => i !== index);
    setSources(updated.length === 0 ? [{ name: "", url: "" }] : updated);
  };

  const handleSourceChange = (index: number, field: keyof Source, value: string) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  };

  const handleCatalogSelect = (name: string, url: string) => {
    // Put in first empty source slot, or add new
    const firstEmptyIndex = sources.findIndex((s) => !s.name && !s.url);
    if (firstEmptyIndex !== -1) {
      handleSourceChange(firstEmptyIndex, "name", name);
      handleSourceChange(firstEmptyIndex, "url", url);
    } else {
      setSources([...sources, { name, url }]);
    }
    setError("");
  };

  const handleFormSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!title.trim() || title.length < 5) {
      setError("Please specify a descriptive Title (at least 5 characters).");
      return;
    }
    if (!summary.trim() || summary.length < 10) {
      setError("Please provide a short summary description (at least 10 characters).");
      return;
    }
    if (!content.trim() || content.length < 20) {
      setError("Please provide complete paper content body (at least 20 characters).");
      return;
    }

    // Clean sources
    const validSources = sources.filter((src) => src.name.trim() && src.url.trim());
    if (validSources.length === 0) {
      setError("Please associate at least one verified source link with your briefing.");
      return;
    }

    // Check URLs
    for (const src of validSources) {
      try {
        new URL(src.url);
      } catch (e) {
        setError(`Invalid URL format detected: "${src.url}". Make sure it includes http:// or https://`);
        return;
      }
    }

    try {
      await onSave({
        title,
        summary,
        content,
        category,
        sources: validSources,
      });

      // Clear form
      setTitle("");
      setSummary("");
      setContent("");
      setCategory("counter-terrorism");
      setSources([{ name: "", url: "" }]);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Failed to submit document to federal repository.");
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-200 rounded-lg p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Briefing Submitted Successfully</h4>
            <p className="text-xs text-emerald-300 mt-1">
              Your paper has been queued for verification. The site administrator (sapkotaanubhav91@gmail.com) has been notified. You can track progress in your personal archive tab.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-950 border border-red-900 text-red-200 rounded-lg p-4 text-xs font-mono">
          <span className="font-bold uppercase text-red-400 block mb-1">LOG WARNING:</span>
          {error}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl">
        <h3 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2 border-b border-zinc-800 pb-3 mb-5">
          <FileText className="w-5 h-5 text-amber-500" />
          Intelligence Paper & Crime Briefing Submission Workspace
        </h3>

        {/* Categories */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block mb-2">
            Classification Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["counter-terrorism", "military", "crime"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-2 px-3 border rounded text-xs uppercase tracking-widest font-mono font-bold transition-all ${
                  category === cat
                    ? "bg-zinc-950 border-amber-500 text-amber-500 shadow-inner"
                    : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {cat.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block mb-1.5">
            Document Subject / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Tactical Counter-Terrorism Operations in Sahel Hubs"
            className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded py-2 px-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {/* Short Summary */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block mb-1.5">
            Analytical Summary (Short Snippet)
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="A concise, high-impact summary of findings for immediate briefing summaries..."
            className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded py-2 px-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none"
          />
        </div>

        {/* Core Content Body */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block mb-1.5">
            Briefing Document Content Body (Supports Markdown styling)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="### Overview&#10;Input the core intelligence text here. Underline details, outline threat assessments, and document tactical interventions..."
            className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded py-2 px-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono"
          />
        </div>

        {/* Backed Sources Sector */}
        <div className="border-t border-zinc-800 pt-5 mb-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block">
                Backed Intelligence Sources
              </label>
              <p className="text-[11px] text-zinc-500">
                A secure publication requires verified links. Each source is automatically mapped with official credentials.
              </p>
            </div>
            <button
              onClick={() => setShowCatalog(!showCatalog)}
              className="px-2.5 py-1 text-[11px] bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-amber-500 rounded font-semibold transition-all flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              {showCatalog ? "Close Agency Catalog" : "Autofill From Catalog"}
            </button>
          </div>

          {/* Interactive Source Catalog inside submit form */}
          {showCatalog && (
            <div className="mb-4">
              <SourcesShowcase interactiveMode={true} onSelectSource={handleCatalogSelect} />
            </div>
          )}

          <div className="space-y-3">
            {sources.map((source, index) => {
              const previewFavicon = source.url ? getFaviconUrl(source.url) : null;
              return (
                <div key={index} className="flex items-start gap-3 bg-zinc-950 border border-zinc-850 p-3 rounded-lg relative">
                  {/* Preview Logo */}
                  <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    {previewFavicon && source.url ? (
                      <img
                        src={previewFavicon}
                        alt="Logo Preview"
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                    <input
                      type="text"
                      placeholder="Source Name (e.g., Reuters Intelligence)"
                      value={source.name}
                      onChange={(e) => handleSourceChange(index, "name", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded py-1.5 px-3 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Verified Source Link (e.g., https://...)"
                      value={source.url}
                      onChange={(e) => handleSourceChange(index, "url", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded py-1.5 px-3 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveSource(index)}
                    className="p-1.5 bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-900 text-zinc-500 hover:text-red-400 rounded transition-all shrink-0 mt-1"
                    title="Remove Source"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleAddSource}
            className="mt-3 text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 ml-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Additional Source Link
          </button>
        </div>

        {/* Submit action */}
        <div className="border-t border-zinc-800 pt-4 flex justify-end">
          <button
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded text-xs transition-all shadow-md hover:shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Submit Paper for Official Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
