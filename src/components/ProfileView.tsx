"use client";

import { useState } from "react";
import { changeUserPassword, updateUserProfileDetails } from "@/lib/auth/actions";

interface ProfileViewProps {
  defaultName: string;
  email: string;
  onProfileNameUpdated?: (name: string) => void;
}
function splitName(name: string): { firstName: string; surname: string } {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: "", surname: "" };
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    surname: parts.slice(1).join(" "),
  };
}

export default function ProfileView({ defaultName, email, onProfileNameUpdated }: ProfileViewProps) {
  const [firstName, setFirstName] = useState(splitName(defaultName).firstName);
  const [surname, setSurname] = useState(splitName(defaultName).surname);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");


  const handleSaveProfile = async () => {
    setProfileMessage("");
    setProfileError("");
    const first = firstName.trim();
    const last = surname.trim();
    if (!first || !last) {
      setProfileError("Please provide both first name and surname.");
      return;
    }
    const fullName = `${first} ${last}`.trim();
    setIsSavingProfile(true);
    const result = await updateUserProfileDetails({ name: fullName });
    setIsSavingProfile(false);
    if (result && "error" in result) {
      setProfileError(result.error ?? "Unable to update profile.");
      return;
    }
    onProfileNameUpdated?.(fullName);
    setProfileMessage("Profile updated.");
  };

  const handleUpdatePassword = async () => {
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800">Account / Profile View</h2>
        <p className="text-sm text-slate-500 mt-1">Update your account details below.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              First Name
            </label>
            <input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Surname
            </label>
            <input
              value={surname}
              onChange={(event) => setSurname(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition"
              placeholder="Surname"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              value={email}
              readOnly
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 bg-slate-50"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="bg-[#188a4b] hover:bg-[#14733f] text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
          >
            {isSavingProfile ? "Saving..." : "Save / Update"}
          </button>
          {profileMessage && <p className="text-xs text-emerald-700">{profileMessage}</p>}
          {profileError && <p className="text-xs text-red-600">{profileError}</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800">Change Password</h3>
        <p className="text-sm text-slate-500 mt-1">Use at least 8 characters.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition"
              placeholder="Current password"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition"
              placeholder="New password"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition"
              placeholder="Confirm password"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleUpdatePassword}
            disabled={isSavingPassword}
            className="bg-[#188a4b] hover:bg-[#14733f] text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
          >
            {isSavingPassword ? "Updating..." : "Update Password"}
          </button>
          {passwordMessage && <p className="text-xs text-emerald-700">{passwordMessage}</p>}
          {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
        </div>
      </div>
    </div>
  );
}
