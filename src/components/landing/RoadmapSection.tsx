import Image from "next/image";
import Link from "next/link";
import { ROADMAP_ITEMS } from "./data";
import EarlyAccessSignupForm from "./EarlyAccessSignupForm";
import mockupPreview from "../../../images/mockup.png";
interface RoadmapSectionProps {
  homepageMode?: boolean;
}

export default function RoadmapSection({ homepageMode = false }: RoadmapSectionProps) {
  const sectionClassName = homepageMode
    ? "snap-start snap-always min-h-[calc(100svh-4rem)] md:min-h-[calc(100vh-4rem)] py-12 sm:py-14 scroll-mt-20 bg-gradient-to-b from-slate-50 to-white flex items-center"
    : "py-12 sm:py-14 scroll-mt-20 bg-gradient-to-b from-slate-50 to-white";
  return (
    <section id="roadmap" className={sectionClassName}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-center">
            <div>
              <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#188a4b] bg-[#188a4b]/10 px-3 py-1 rounded-full">
                Product roadmap
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-4">
                Upcoming Features &amp; Future Plan
              </h2>
              <p className="text-slate-600 mt-3 leading-relaxed">
                We&apos;re prioritizing a cleaner, more guided experience: better option comparison, a dedicated pension
                centre, and save/export support for generated outcomes in one focused place.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Tag text="Compare Options" />
                <Tag text="Pension Centre" />
                <Tag text="Save & Export Outcomes" />
              </div>
              <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-3">
                <EarlyAccessSignupForm
                  interest="general"
                  buttonLabel="Join Early Access"
                  inputPlaceholder="Email for launch updates"
                  className="w-full sm:w-auto"
                  buttonClassName="bg-[#188a4b] hover:bg-[#14733f] text-white"
                />
                <Link
                  href="/"
                  className="inline-flex items-center justify-center text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2.5"
                >
                  Back to home
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:p-3 shadow-sm">
              <Image
                src={mockupPreview}
                alt="Roadmap preview mockup for upcoming dashboard improvements"
                className="w-full h-auto rounded-xl"
                priority
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {ROADMAP_ITEMS.map((item) => (
            <article
              key={item.title}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-[#188a4b]/10 text-[#188a4b]">
                {item.timeline}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-3">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
      {text}
    </span>
  );
}
