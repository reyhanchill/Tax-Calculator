"use client";

import { useState } from "react";
import { Country, StudentLoanPlan } from "@/lib/tax/types";
import { deleteUserAccount, updateUserSettings } from "@/lib/tax/actions";
import { changeUserPassword } from "@/lib/auth/actions";
import {
  alignTaxCodeWithCountry,
  defaultTaxCodeForCountry,
  normalizeCountryAndTaxCode,
} from "@/lib/tax/countryTaxCode";

interface SettingsHubProps {
  defaultCountry: Country;
  defaultTaxCode: string;
  defaultStudentLoanPlans: StudentLoanPlan[];
  defaultPensionEmployeeRate: number;
  defaultPensionEmployerRate: number;
  defaultSalarySacrifice: boolean;
}

const STUDENT_LOAN_OPTIONS: Array<{ value: StudentLoanPlan; label: string }> = [
  { value: "plan1", label: "Plan 1" },
  { value: "plan2", label: "Plan 2" },
  { value: "plan4", label: "Plan 4" },
  { value: "plan5", label: "Plan 5" },
  { value: "postgraduate", label: "Postgraduate" },
];

export default function SettingsHub({
  defaultCountry,
  defaultTaxCode,
  defaultStudentLoanPlans,
  defaultPensionEmployeeRate,
  defaultPensionEmployerRate,
  defaultSalarySacrifice,
}: SettingsHubProps) {
  const initialCountryTax = normalizeCountryAndTaxCode(defaultCountry, defaultTaxCode);
  const [country, setCountry] = useState<Country>(initialCountryTax.country);
  const [taxCode, setTaxCode] = useState(initialCountryTax.taxCode);
  const [studentLoanPlans, setStudentLoanPlans] = useState<StudentLoanPlan[]>(
    defaultStudentLoanPlans,
  );
  const [pensionEmployeeRate, setPensionEmployeeRate] = useState(
    defaultPensionEmployeeRate,
  );
  const [pensionEmployerRate, setPensionEmployerRate] = useState(
    defaultPensionEmployerRate,
  );
  const [salarySacrifice, setSalarySacrifice] = useState(defaultSalarySacrifice);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const handleCountryChange = (nextCountry: Country) => {
    setCountry(nextCountry);
    setTaxCode((prev) => alignTaxCodeWithCountry(prev || "1257L", nextCountry));
  };
  const handleTaxCodeChange = (nextTaxCode: string) => {
    const normalized = normalizeCountryAndTaxCode(country, nextTaxCode);
    setCountry(normalized.country);
    setTaxCode(normalized.taxCode);
  };

  const saveSettings = async () => {
    setMessage("");
    setIsSaving(true);
    const normalized = normalizeCountryAndTaxCode(country, taxCode || "1257L");
    setCountry(normalized.country);
    setTaxCode(normalized.taxCode);
    const result = await updateUserSettings({
      country: normalized.country,
      defaultTaxCode: normalized.taxCode,
      studentLoanPlans,
      pensionEmployeeRate,
      pensionEmployerRate,
      useSalarySacrifice: salarySacrifice,
    });
    setIsSaving(false);
    if (result && "error" in result) {
      setMessage(result.error ?? "Unable to update settings.");
      return;
    }
    setMessage("Settings updated.");
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete account permanently? This cannot be undone.",
    );
    if (!confirmed) return;
    const result = await deleteUserAccount();
    if (result && "error" in result) {
      setMessage(result.error ?? "Unable to delete account.");
      return;
    }
    window.location.href = "/";
  };

  const togglePlan = (plan: StudentLoanPlan) => {
    setStudentLoanPlans((prev) =>
      prev.includes(plan) ? prev.filter((item) => item !== plan) : [...prev, plan],
    );
  };
  const updatePassword = async () => {
    setPasswordMessage("");
    setPasswordError("");
    setIsSavingPassword(true);

    const result = await changeUserPassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setIsSavingPassword(false);
    if (result && "error" in result) {
      setPasswordError(result.error ?? "Unable to update password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated.");
  };

  const cardClass = "bg-white rounded-2xl border border-slate-200";

  return (
    <div className="space-y-6">
      <div className={`${cardClass} p-6`}>
        <h2 className="text-lg font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage default assumptions used in calculators and recommendations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
              Default country
            </label>
            <select
              value={country}
              onChange={(event) => handleCountryChange(event.target.value as Country)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
            >
              <option value="england">England</option>
              <option value="scotland">Scotland</option>
              <option value="wales">Wales</option>
              <option value="northern-ireland">Northern Ireland</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
              Default tax code
            </label>
            <input
              value={taxCode}
              onChange={(event) => handleTaxCodeChange(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
              placeholder={defaultTaxCodeForCountry(country)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
              Salary sacrifice default
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 h-[42px]">
              <input
                type="checkbox"
                checked={salarySacrifice}
                onChange={(event) => setSalarySacrifice(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Enabled
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
              Employee pension rate (%)
            </label>
            <input
              type="number"
              min={0}
              value={pensionEmployeeRate * 100}
              onChange={(event) =>
                setPensionEmployeeRate(Math.max(0, Number(event.target.value) / 100))
              }
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
              Employer pension rate (%)
            </label>
            <input
              type="number"
              min={0}
              value={pensionEmployerRate * 100}
              onChange={(event) =>
                setPensionEmployerRate(Math.max(0, Number(event.target.value) / 100))
              }
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
            Default student loan plans
          </p>
          <div className="flex flex-wrap gap-2">
            {STUDENT_LOAN_OPTIONS.map((option) => {
              const active = studentLoanPlans.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => togglePlan(option.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    active
                      ? "bg-[#188a4b] text-white border-[#188a4b]"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-[#188a4b] hover:bg-[#14733f] text-white font-semibold text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>
          {message && <p className="text-xs text-slate-600">{message}</p>}
        </div>
      </div>

      <div className={`${cardClass} p-6`}>
        <h3 className="text-base font-semibold text-slate-800">Security & account controls</h3>
        <p className="text-sm text-slate-500 mt-1">Manage password and account deletion.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
              placeholder="Current password"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
              placeholder="New password"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
              placeholder="Confirm password"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={updatePassword}
            disabled={isSavingPassword}
            className="bg-[#188a4b] hover:bg-[#14733f] text-white font-semibold text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {isSavingPassword ? "Updating..." : "Update password"}
          </button>
          {passwordMessage && <p className="text-xs text-emerald-700">{passwordMessage}</p>}
          {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500">
            Account deletion permanently removes settings, reports, and audit-linked records.
          </p>
          <button
            onClick={deleteAccount}
            className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Delete account permanently
          </button>
        </div>
      </div>
    </div>
  );
}
