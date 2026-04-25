import EarlyAccessSignupForm from "./EarlyAccessSignupForm";

const AI_ROADMAP_ITEMS = [
  {
    title: "AI Tax Co-Pilot",
    timeline: "In discovery",
    description:
      "Ask tax questions in plain English and get structured guidance tied to your active calculation context.",
  },
  {
    title: "AI Scenario Assistant",
    timeline: "Planned",
    description:
      "Auto-generate compare-option scenarios with clear assumptions so users can test outcomes faster.",
  },
  {
    title: "AI Deadline & Risk Signals",
    timeline: "Planned",
    description:
      "Smart reminders and proactive alerts for threshold changes, filing deadlines, and high-impact tax risks.",
  },
];

interface RoadmapAISectionProps {
  homepageMode?: boolean;
}

export default function RoadmapAISection({ homepageMode = false }: RoadmapAISectionProps) {
  const sectionClassName = homepageMode
    ? "snap-start snap-always min-h-[calc(100svh-4rem)] md:min-h-[calc(100vh-4rem)] py-12 sm:py-14 bg-[#f7fbf9] flex items-center"
    : "pb-16";
  return (
    <section className={sectionClassName}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#188a4b] bg-[#188a4b]/10 px-3 py-1 rounded-full">
                AI integration
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-4">
                How we&apos;re incorporating AI
              </h2>
              <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
                AI will be layered into TaxFlow to help with planning speed and clarity—without replacing transparent
                tax breakdowns or user control.
              </p>
            </div>
            <EarlyAccessSignupForm
              interest="ai"
              buttonLabel="Join AI Early Access"
              inputPlaceholder="Email for AI launch updates"
              className="w-full md:w-auto"
              buttonClassName="bg-[#188a4b] hover:bg-[#14733f] text-white rounded-full shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {AI_ROADMAP_ITEMS.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-emerald-100/80 bg-[#f7fbf9] p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-[#188a4b]/10 text-[#188a4b]">
                  {item.timeline}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-3">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-6">
            All AI output will be reviewable, editable, and presented with clear assumptions before any decision is made.
          </p>
        </div>
      </div>
    </section>
  );
}
