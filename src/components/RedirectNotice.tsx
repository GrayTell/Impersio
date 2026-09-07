import React, { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface RedirectNoticeProps {
  onDismiss?: () => void;
}

export default function RedirectNotice({ onDismiss }: RedirectNoticeProps) {
  const [seconds, setSeconds] = useState(1);
  const targetUrl = "https://graytellai.space-z.ai";

  const handleRedirect = () => {
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
    const timer = setTimeout(() => {
      handleRedirect();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      id="redirect-notice-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white px-4 text-center select-none"
    >
      <div className="max-w-xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-medium mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Research Safety Lab</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3">
          GrayTell - AI Research Safety Lab
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed mb-4 max-w-md">
          Graytell is an AI research safety lab that builds AI accessible safefor everyone . Try at{" "}
          <a
            href={targetUrl}
            target="_top"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-2 hover:text-zinc-300 transition-colors"
          >
            graytellai.space-z.ai
          </a>
          .
        </p>

        <p className="text-xs sm:text-sm text-zinc-400 mb-8 font-mono">
          {seconds > 0
            ? `Redirecting automatically to graytellai.space-z.ai...`
            : "Redirecting now..."}
        </p>

        <a
          id="btn-go-graytell"
          href={targetUrl}
          target="_top"
          onClick={(e) => {
            e.preventDefault();
            handleRedirect();
          }}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black font-semibold text-sm sm:text-base hover:bg-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <span>Go to Graytell Now</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
