import Link from "next/link";

interface CtaSectionProps {
  hasSession?: boolean;
}

export default function CtaSection({ hasSession = false }: CtaSectionProps) {
  const createAccountHref = hasSession ? "/dashboard" : "/register";

  return (
    <section className="snap-start py-16 bg-[#f7fbf9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-[#0f7a40] to-[#188a4b] p-8 sm:p-10 shadow-xl shadow-emerald-200/60">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to see your tax breakdown?</h2>
          <p className="text-emerald-50/90 mt-3 text-base">
            Free, instant, and easy to understand. No accountancy jargon.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={createAccountHref}
              className="inline-flex items-center justify-center bg-white text-[#0f7a40] font-semibold px-8 py-3.5 rounded-full hover:bg-emerald-50 transition text-base shadow-sm"
            >
              Create Your Free Account
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center justify-center border border-white/40 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition text-base"
            >
              View Roadmap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
