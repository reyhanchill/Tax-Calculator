import Link from "next/link";
import { PLATFORM_MODULES, type PlatformModule } from "./data";

function PlatformModuleCard({ module }: { module: PlatformModule }) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
      <div className={`h-1 w-12 rounded-full mb-5 ${module.accentBarClass}`} />
      <h3 className={`text-xl font-bold ${module.titleClass}`}>{module.title}</h3>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{module.description}</p>
      <ul className="mt-5 space-y-2.5 flex-1">
        {module.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold leading-none flex-shrink-0 mt-0.5 ${module.bulletClass}`}
            >
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={module.href}
        className={`mt-7 w-full inline-flex items-center justify-center text-center text-white font-semibold py-3 rounded-full transition text-sm shadow-sm ${module.buttonClass}`}
      >
        Get Started
      </Link>
    </div>
  );
}

export default function PlatformModulesSection() {
  return (
    <section id="platform" className="snap-start snap-always min-h-[calc(100svh-4rem)] md:min-h-[calc(100vh-4rem)] bg-[#f4fbf7] scroll-mt-16 flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-2 sm:-mt-4">
        <div className="rounded-3xl border border-emerald-100/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">Platform modules</h2>
          <p className="text-slate-600 text-center mt-2 mb-10">
            Built as one coherent workflow across individual, self-employed, and business needs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLATFORM_MODULES.map((module) => (
              <PlatformModuleCard key={module.title} module={module} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
