"use client";

import { useEffect, useState } from "react";
import { logout } from "@/lib/auth/actions";
import Link from "next/link";
import TaxCalculator from "./TaxCalculator";
import SelfEmployedAssessment from "./SelfEmployedAssessment";
import BusinessTaxHub from "./BusinessTaxHub";
import SettingsHub from "./SettingsHub";
import ProfileView from "./ProfileView";
import { Country, StudentLoanPlan } from "@/lib/tax/types";

interface UserProps {
  name: string;
  email: string;
  accountType: "individual" | "self-employed" | "business";
  country: Country;
  taxCode: string;
  studentLoanPlans: StudentLoanPlan[];
  pensionEmployeeRate: number;
  pensionEmployerRate: number;
  salarySacrifice: boolean;
}
type Tab =
  | "profile"
  | "workspace"
  | "settings";

export default function DashboardShell({ user }: { user: UserProps }) {
  const [activeTab, setActiveTab] = useState<Tab>("workspace");
  const [profileName, setProfileName] = useState(user.name || "");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const useHeaderAccountMenu =
    user.accountType === "individual" ||
    user.accountType === "self-employed" ||
    user.accountType === "business";
  useEffect(() => {
    if (!useHeaderAccountMenu) return;

    const handleToggle = () => setIsSidebarOpen((prev) => !prev);

    window.addEventListener("individual-header-nav-toggle", handleToggle);

    return () => {
      window.removeEventListener("individual-header-nav-toggle", handleToggle);
    };
  }, [useHeaderAccountMenu]);

  const workspaceTab =
    user.accountType === "individual"
      ? "Individual Tax Estimation"
      : user.accountType === "self-employed"
        ? "Self-Employed Assessment"
        : "Owner Tax Hub";
  const allTabs: Array<{ key: Tab; label: string; icon: string }> = [
    { key: "workspace", label: workspaceTab, icon: "🧮" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];
  const tabs = allTabs;
  const sidebarTabs = useHeaderAccountMenu
    ? tabs.filter((tab) => tab.key !== "workspace")
    : tabs;
  const showBackToDashboard = activeTab !== "workspace";
  const showDashboardIntro = activeTab !== "settings" && activeTab !== "profile";
  const tabContent = (
    <>
      {activeTab === "profile" && useHeaderAccountMenu && (
        <ProfileView
          defaultName={profileName}
          email={user.email}
          onProfileNameUpdated={setProfileName}
        />
      )}
      {activeTab === "workspace" &&
        (user.accountType === "individual" ? (
          <TaxCalculator
            defaultCountry={user.country}
            defaultTaxCode={user.taxCode}
            defaultStudentLoanPlans={user.studentLoanPlans}
            defaultPensionEmployeeRate={user.pensionEmployeeRate}
            defaultPensionEmployerRate={user.pensionEmployerRate}
            defaultSalarySacrifice={user.salarySacrifice}
          />
        ) : user.accountType === "self-employed" ? (
          <SelfEmployedAssessment
            defaultCountry={user.country}
            defaultStudentLoanPlans={user.studentLoanPlans}
            defaultPensionEmployeeRate={user.pensionEmployeeRate}
          />
        ) : (
          <BusinessTaxHub
            defaultCountry={user.country}
            defaultTaxCode={user.taxCode}
            defaultStudentLoanPlans={user.studentLoanPlans}
            defaultPensionEmployeeRate={user.pensionEmployeeRate}
          />
        ))}
      {activeTab === "settings" && (
        <SettingsHub
          defaultCountry={user.country}
          defaultTaxCode={user.taxCode}
          defaultStudentLoanPlans={user.studentLoanPlans}
          defaultPensionEmployeeRate={user.pensionEmployeeRate}
          defaultPensionEmployerRate={user.pensionEmployerRate}
          defaultSalarySacrifice={user.salarySacrifice}
        />
      )}
    </>
  );

  if (useHeaderAccountMenu) {
    return (
      <main className="w-full px-3 sm:px-6 lg:px-8 py-6">
        {isSidebarOpen && (
          <div className="fixed top-16 left-0 right-0 z-40 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
              <div
                id="individual-header-nav"
                className="pointer-events-auto w-72 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg p-3"
              >
                <div className="pb-3 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("profile");
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left rounded-xl p-2 transition ${
                      activeTab === "profile" ? "bg-emerald-100/70" : "hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                        {(profileName?.[0] || user.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{profileName || "User"}</p>
                        <p className="text-[11px] text-slate-500 leading-tight">Account / Profile View</p>
                      </div>
                    </div>
                  </button>
                </div>

                {sidebarTabs.length > 0 && (
                  <nav className="mt-3 space-y-1.5">
                    {sidebarTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setActiveTab(tab.key);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-sm transition ${
                          activeTab === tab.key
                            ? "bg-emerald-100/70 border-emerald-300 text-emerald-800"
                            : "bg-white border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                      >
                        <span className="text-sm">{tab.icon}</span>
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                )}

                <div className="mt-3 pt-3 border-t border-slate-200">
                  <Link
                    href="/privacy"
                    className="block text-left text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2.5 rounded-lg transition"
                  >
                    Privacy Policy
                  </Link>
                  <form action={logout} className="mt-1">
                    <button
                      type="submit"
                      className="w-full text-left text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2.5 rounded-lg transition"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="min-h-[calc(100vh-6rem)]">
          <div className={showDashboardIntro ? "mb-6" : "mb-3"}>
            {showBackToDashboard && (
              <button
                type="button"
                onClick={() => setActiveTab("workspace")}
                className="text-[#188a4b] hover:underline text-sm"
              >
                &larr; Back to dashboard
              </button>
            )}
            {showDashboardIntro && (
              <>
                <h1 className={`text-2xl font-bold text-slate-900 ${showBackToDashboard ? "mt-3" : ""}`}>Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Welcome back. Here&apos;s your tax snapshot.</p>
              </>
            )}
          </div>
          {tabContent}
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        {showBackToDashboard && (
          <button
            type="button"
            onClick={() => setActiveTab("workspace")}
            className="text-[#188a4b] hover:underline text-sm"
          >
            &larr; Back to dashboard
          </button>
        )}
        <div className={`flex flex-wrap gap-3 ${showBackToDashboard ? "mt-3" : ""}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all border ${
                activeTab === tab.key
                  ? "bg-white border-slate-900 text-slate-900 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>{tabContent}</div>
    </main>
  );
}
