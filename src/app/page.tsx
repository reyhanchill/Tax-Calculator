import { getSession } from "@/lib/auth/actions";
import {
  AboutUsSection,
  CtaSection,
  FeaturesSection,
  HeroSection,
  LandingFooter,
  LandingHeader,
  PlatformModulesSection,
  RoadmapAISection,
  RoadmapSection,
} from "@/components/landing";

export default async function Home() {
  const session = await getSession();
  const hasSession = Boolean(session);

  return (
    <div className="min-h-screen overflow-y-auto overflow-x-hidden scroll-smooth scroll-pt-16 bg-[#f7fbf9] md:h-screen md:snap-y md:snap-mandatory">
      <LandingHeader hasSession={hasSession} />
      <HeroSection hasSession={hasSession} />
      <PlatformModulesSection />
      <FeaturesSection />
      <RoadmapSection homepageMode />
      <RoadmapAISection homepageMode />
      <AboutUsSection />
      <CtaSection hasSession={hasSession} />
      <LandingFooter />
    </div>
  );
}
