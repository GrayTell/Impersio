import React, { useState, useEffect } from "react";
import { ExternalLink, ArrowRight } from "lucide-react";

interface RedirectNoticeProps {
  onDismiss?: () => void;
}

export default function RedirectNotice({ onDismiss }: RedirectNoticeProps) {
  const [seconds, setSeconds] = useState(7);
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
    if (seconds <= 0) {
      handleRedirect();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  return (
    <div
      id="redirect-notice-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white px-4 text-center select-none"
    >
      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Main Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3">
          Graytell formerly silencly and impersio
        </h1>

        {/* Subtitle / Notice */}
        <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed mb-4 max-w-md">
          Silencly and impersio.me has been bought by Graytell. Try{" "}
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-2 hover:text-zinc-300 transition-colors"
          >
            Graytellai.space-z.ai
          </a>
          .
        </p>

        {/* Countdown */}
        <p className="text-xs sm:text-sm text-zinc-400 mb-8 font-normal">
          {seconds > 0
            ? `Redirecting automatically in ${seconds} seconds...`
            : "Redirecting now..."}
        </p>

        {/* Action Button */}
        <a
          id="btn-go-graytell"
          href={targetUrl}
          onClick={(e) => {
            e.preventDefault();
            handleRedirect();
          }}
          className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-black font-semibold text-sm sm:text-base hover:bg-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          Go to Graytell Now
        </a>

        {/* Optional secondary dismiss control for portal inspection */}
        {onDismiss && (
          <button
            id="btn-dismiss-redirect"
            onClick={onDismiss}
            className="mt-12 text-xs text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-4 cursor-pointer"
          >
            Stay on archive portal
          </button>
        )}
      </div>
    </div>
  );
}
