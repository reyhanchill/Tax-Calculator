import Image from "next/image";
import Link from "next/link";
import heroBackground from "../../../images/hero.png";
interface HeroSectionProps {
  hasSession?: boolean;
}

export default function HeroSection({ hasSession = false }: HeroSectionProps) {
  const createAccountHref = hasSession ? "/dashboard" : "/register";
  const signInHref = hasSession ? "/dashboard" : "/login";
  return (
    <section id="home" className="relative snap-start snap-always min-h-[calc(100svh-4rem)] md:min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      <Image src={heroBackground} alt="" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-white/55" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Tax planning clarity for
          <br className="hidden sm:block" /> individuals and businesses
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          A focused UK tax strategy workspace with clean reporting, scenario comparison,
          and pension planning—designed for fast decisions without visual clutter.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={createAccountHref}
            className="bg-[#188a4b] hover:bg-[#14733f] text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-[#188a4b]/25 text-base"
          >
            Create account
          </Link>
          <Link
            href={signInHref}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-8 py-3.5 rounded-xl transition text-base"
          >
            Sign In
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-400">No credit card required · GDPR compliant · Data encrypted</p>
      </div>
    </section>
  );
}
