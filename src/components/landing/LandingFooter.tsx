import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LandingFooter() {
  return (
    <footer className="snap-start border-t border-emerald-100 bg-white/90 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Logo size="xs" />
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-[#188a4b] transition">Privacy Policy</Link>
            <a
              href="https://www.gov.uk/government/organisations/hm-revenue-customs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#188a4b] transition"
            >
              HMRC Data Source
            </a>
          </div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} TaxFlow · Estimates only, not financial advice</p>
        </div>
      </div>
    </footer>
  );
}
