import { LandingHeader, RoadmapAISection, RoadmapSection } from "@/components/landing";
import { getSession } from "@/lib/auth/actions";

export default async function RoadmapPage() {
  const session = await getSession();
  return (
    <div className="min-h-screen bg-[#f7fbf9]">
      <LandingHeader hasSession={Boolean(session)} />
      <main>
        <RoadmapSection />
        <RoadmapAISection />
      </main>
    </div>
  );
}
