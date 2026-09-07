import React, { useEffect, useState } from "react";
import { ExternalLink, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function App() {
  const targetUrl = "https://graytellai.space-z.ai";
  const [seconds, setSeconds] = useState(1);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  const executeRedirect = () => {
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = targetUrl;
      } else {
        window.location.href = targetUrl;
      }
    } catch {
      window.location.href = targetUrl;
    }
  };

  useEffect(() => {
    // Attempt fast automatic redirect immediately
    const immediateTimer = setTimeout(() => {
      executeRedirect();
      setRedirectAttempted(true);
    }, 400);

    // Fallback countdown interval
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          executeRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(immediateTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <main
      id="graytell-redirect-app"
      className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden selection:bg-white selection:text-black font-sans"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_65%)] pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full mx-auto flex flex-col items-center text-center">
        {/* Lab Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-medium mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Research Safety Lab</span>
        </div>

        {/* Brand Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
          GrayTell - AI Research Safety Lab
        </h1>

        {/* Mission Statement / Description */}
        <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed max-w-lg mb-6">
          Graytell is an AI research safety lab that builds AI accessible safefor everyone . Try at{" "}
          <a
            href={targetUrl}
            target="_top"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-4 decoration-zinc-500 hover:decoration-white transition-colors"
          >
            graytellai.space-z.ai
          </a>
          .
        </p>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 mb-8 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>
            {seconds > 0
              ? `Redirecting automatically to graytellai.space-z.ai...`
              : "Redirecting now..."}
          </span>
        </div>

        {/* Action Button */}
        <a
          id="btn-redirect-graytell"
          href={targetUrl}
          target="_top"
          rel="noopener noreferrer"
          onClick={(e) => {
            // Ensure direct navigation works smoothly
            try {
              if (window.top && window.top !== window) {
                window.top.location.href = targetUrl;
              }
            } catch {
              // fallback let standard link do top/blank
            }
          }}
          className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm sm:text-base hover:bg-zinc-200 active:scale-95 transition-all shadow-xl shadow-white/5 cursor-pointer"
        >
          <span>Go to Graytell Now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* Direct Link Info */}
        <p className="mt-8 text-xs text-zinc-600 font-mono">
          Destination:{" "}
          <a
            href={targetUrl}
            target="_top"
            className="text-zinc-500 hover:text-zinc-400 underline underline-offset-2"
          >
            https://graytellai.space-z.ai
          </a>
        </p>
      </div>
    </main>
  );
}
