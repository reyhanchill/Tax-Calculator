import { LANDING_FEATURES } from "./data";

export default function FeaturesSection() {
  return (
    <section id="features" className="snap-start snap-always min-h-[calc(100svh-4rem)] md:min-h-[calc(100vh-4rem)] bg-[#eef8f3] scroll-mt-16 flex items-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-emerald-100/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">Everything you need</h2>
          <p className="text-slate-600 text-center mt-2 mb-10">
            Comprehensive UK tax calculations in a cleaner, calmer interface.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {LANDING_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-[#f8fcfa] rounded-xl border border-emerald-100/70 p-5 hover:shadow-md transition-shadow"
              >
                <div className="w-2 h-2 rounded-full bg-[#188a4b]" />
                <h3 className="text-sm font-bold text-slate-900 mt-3">{feature.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
