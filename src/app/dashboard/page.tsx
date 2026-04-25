import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/actions";
import DashboardShell from "@/components/DashboardShell";
import { Logo } from "@/components/Logo";
import DashboardHeaderNavTrigger from "@/components/DashboardHeaderNavTrigger";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const userProps = {
    name: user.name ?? "",
    email: user.email,
    accountType: (user.accountType as "individual" | "self-employed" | "business") ?? "individual",
    country: (user.settings?.country as "england" | "scotland" | "wales" | "northern-ireland") ?? "england",
    taxCode: user.settings?.defaultTaxCode ?? "1257L",
    studentLoanPlans: JSON.parse(user.settings?.studentLoanPlans ?? "[]"),
    pensionEmployeeRate: user.settings?.pensionEmployeeRate ?? 0.05,
    pensionEmployerRate: user.settings?.pensionEmployerRate ?? 0.03,
    salarySacrifice: user.settings?.useSalarySacrifice ?? false,
  };
  const headerDisplayName = userProps.name.trim() || userProps.email.split("@")[0] || "Account";
  const headerLinks = [
    { href: "/#platform", label: "Platform" },
    { href: "/#features", label: "Features" },
    { href: "/roadmap", label: "Roadmap" },
    { href: "/about-us", label: "About Us" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center gap-4">
            <Logo size="sm" />
            <div className="hidden md:flex flex-1 justify-center min-w-0 px-1">
              <nav className="flex max-w-full items-center gap-1 rounded-full border border-emerald-100 bg-white/80 px-1 py-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {headerLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-xs lg:text-sm font-medium text-slate-600 hover:text-[#188a4b] transition px-2.5 lg:px-3 py-1.5 rounded-full hover:bg-emerald-50 whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="ml-auto shrink-0">
              <DashboardHeaderNavTrigger displayName={headerDisplayName} />
            </div>
          </div>
          <div className="md:hidden pb-2">
            <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <nav className="mx-auto flex w-max items-center gap-1 rounded-full border border-emerald-100 bg-white/80 px-1 py-1">
                {headerLinks.map((item) => (
                  <Link
                    key={`mobile-${item.label}`}
                    href={item.href}
                    className="text-xs font-medium text-slate-600 hover:text-[#188a4b] transition px-2.5 py-1.5 rounded-full hover:bg-emerald-50 whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — client component handles tab switching */}
      <DashboardShell user={userProps} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-400">This website provides estimates for informational purposes only. It is not financial or tax advice.</p>
          <p className="text-xs text-slate-400 mt-1">Always verify with HMRC or a qualified accountant. Tax data sourced from <a href="https://www.gov.uk/government/organisations/hm-revenue-customs" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">gov.uk</a>.</p>
          <p className="text-[11px] text-slate-300 mt-3">© {new Date().getFullYear()} TaxFlow</p>
        </div>
      </footer>
    </div>
  );
}
