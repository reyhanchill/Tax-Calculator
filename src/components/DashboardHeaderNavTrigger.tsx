"use client";

interface DashboardHeaderNavTriggerProps {
  displayName: string;
}

export default function DashboardHeaderNavTrigger({ displayName }: DashboardHeaderNavTriggerProps) {
  const label = displayName.trim() || "Account";
  const initial = (label[0] || "A").toUpperCase();
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("individual-header-nav-toggle"))}
      className="inline-flex h-10 sm:h-11 items-center gap-2 sm:gap-2.5 max-w-[11rem] sm:max-w-[15rem] px-2.5 sm:px-4 rounded-none bg-white text-slate-700 text-sm sm:text-base font-semibold hover:bg-slate-100 transition"
      aria-label="Toggle navigation menu"
      aria-controls="individual-header-nav"
    >
      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs sm:text-sm font-bold text-slate-700 shrink-0">
        {initial}
      </span>
      <span className="block truncate">{label}</span>
    </button>
  );
}
