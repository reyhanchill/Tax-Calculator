import Link from "next/link";
import { Logo } from "@/components/Logo";

interface LandingHeaderProps {
  hasSession: boolean;
}

export default function LandingHeader({ hasSession }: LandingHeaderProps) {
  return (
    <nav className="border-b border-emerald-100/80 sticky top-0 z-50 bg-white/85 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-3">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white/80 px-1.5 py-1">
            <Link
              href="/#platform"
              className="text-sm font-medium text-slate-600 hover:text-[#188a4b] transition px-3 py-1.5 rounded-full hover:bg-emerald-50"
            >
              Platform
            </Link>
            <Link
              href="/#features"
              className="text-sm font-medium text-slate-600 hover:text-[#188a4b] transition px-3 py-1.5 rounded-full hover:bg-emerald-50"
            >
              Features
            </Link>
            <Link
              href="/roadmap"
              className="text-sm font-medium text-slate-600 hover:text-[#188a4b] transition px-3 py-1.5 rounded-full hover:bg-emerald-50"
            >
              Roadmap
            </Link>
            <Link
              href="/about-us"
              className="text-sm font-medium text-slate-600 hover:text-[#188a4b] transition px-3 py-1.5 rounded-full hover:bg-emerald-50"
            >
              About Us
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {hasSession ? (
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-semibold bg-[#188a4b] hover:bg-[#14733f] text-white px-3.5 sm:px-5 py-2 rounded-full transition shadow-md shadow-[#188a4b]/20 whitespace-nowrap"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition px-3 sm:px-4 py-2 rounded-full border border-transparent hover:border-emerald-100 hover:bg-white whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-xs sm:text-sm font-semibold bg-[#188a4b] hover:bg-[#14733f] text-white px-3.5 sm:px-5 py-2 rounded-full transition shadow-md shadow-[#188a4b]/20 whitespace-nowrap"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="md:hidden pb-2">
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto flex w-max items-center gap-1 rounded-full border border-emerald-100 bg-white/80 px-1 py-1">
            <Link
              href="/#platform"
              className="text-xs font-medium text-slate-600 hover:text-[#188a4b] transition px-2.5 py-1.5 rounded-full hover:bg-emerald-50 whitespace-nowrap"
            >
              Platform
            </Link>
            <Link
              href="/#features"
              className="text-xs font-medium text-slate-600 hover:text-[#188a4b] transition px-2.5 py-1.5 rounded-full hover:bg-emerald-50 whitespace-nowrap"
            >
              Features
            </Link>
            <Link
              href="/roadmap"
              className="text-xs font-medium text-slate-600 hover:text-[#188a4b] transition px-2.5 py-1.5 rounded-full hover:bg-emerald-50 whitespace-nowrap"
            >
              Roadmap
            </Link>
            <Link
              href="/about-us"
              className="text-xs font-medium text-slate-600 hover:text-[#188a4b] transition px-2.5 py-1.5 rounded-full hover:bg-emerald-50 whitespace-nowrap"
            >
              About Us
            </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
