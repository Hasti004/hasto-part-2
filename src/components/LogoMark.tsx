import { useState } from "react";

/**
 * The brand mark itself (no positioning). Falls back to a styled text wordmark
 * until a real /logo.png is added to /public.
 *
 * tone: "ink" renders dark (for light backgrounds), "paper" renders white
 * (for dark backgrounds — the PNG is shown as a white silhouette).
 */
export function LogoMark({
  tone = "ink",
  compact = false,
}: {
  tone?: "ink" | "paper";
  compact?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    const color = tone === "paper" ? "text-paper" : "text-ink";
    return (
      <div className={`flex flex-col items-center leading-none ${color}`}>
        <span
          className={`font-serif italic tracking-tight ${
            compact ? "text-3xl md:text-4xl" : "text-5xl md:text-6xl"
          }`}
        >
          hasto
        </span>
        <span
          className={`mt-1 font-serif italic opacity-80 ${
            compact ? "text-sm" : "text-lg"
          }`}
        >
          by hasti
        </span>
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="hasto by hasti"
      onError={() => setImgFailed(true)}
      className="h-auto w-full object-contain"
    />
  );
}
