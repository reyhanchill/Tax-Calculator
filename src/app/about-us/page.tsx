import Link from "next/link";
import { LandingHeader } from "@/components/landing";
import { getSession } from "@/lib/auth/actions";

const ABOUT_PRINCIPLES = [
  {
    title: "Clarity first",
    description: "Complex UK tax logic translated into simple, readable steps for everyday users.",
  },
  {
    title: "HMRC-aligned calculations",
    description: "Rates, thresholds, and treatment rules are built to reflect current UK tax-year structures.",
  },
  {
    title: "Decision support, not guesswork",
    description: "Scenario comparison and planning tools are designed to show trade-offs clearly before action.",
  },
];

export default async function AboutUsPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#f7fbf9]">
      <LandingHeader hasSession={Boolean(session)} />
      <main className="py-12 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <section className="rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-sm">
            <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#188a4b] bg-[#188a4b]/10 px-3 py-1 rounded-full">
              About TaxFlow
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-4">
              Built to make UK tax planning clearer and calmer
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
              TaxFlow helps individuals, self-employed users, and business owners understand their tax position
              quickly—with transparent calculations, practical planning tools, and user-friendly design.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center text-sm font-semibold bg-[#188a4b] hover:bg-[#14733f] text-white px-5 py-2.5 rounded-full transition shadow-sm"
              >
                Create account
              </Link>
              <Link
                href="/roadmap"
                className="inline-flex items-center justify-center text-sm font-medium border border-emerald-200 bg-white hover:bg-emerald-50 text-slate-700 px-5 py-2.5 rounded-full transition"
              >
                View roadmap
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ABOUT_PRINCIPLES.map((principle) => (
              <article key={principle.title} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">{principle.title}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{principle.description}</p>
              </article>
            ))}
          </section>

          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-emerald-900">Tax Year Coverage</h2>
            <p className="text-sm text-emerald-800 mt-2 leading-relaxed">
              We cover <strong>8 tax years</strong> from 2018/19 to 2025/26. HMRC generally allows filing or claims
              for up to <strong>4 previous years</strong>. Older years are included for planning and reference.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
