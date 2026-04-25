"use client";

import { FormEvent, useState } from "react";
import {
  subscribeToEarlyAccess,
  type EarlyAccessInterest,
} from "@/lib/newsletter/actions";

interface EarlyAccessSignupFormProps {
  interest: EarlyAccessInterest;
  buttonLabel: string;
  inputPlaceholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export default function EarlyAccessSignupForm({
  interest,
  buttonLabel,
  inputPlaceholder = "Enter your email",
  className = "",
  inputClassName = "",
  buttonClassName = "",
}: EarlyAccessSignupFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const title = interest === "ai" ? "Join AI Early Access" : "Join Early Access";
  const description =
    interest === "ai"
      ? "Enter your email and we’ll notify you when AI features launch."
      : "Enter your email and we’ll notify you when early access launches.";

  const closeModal = () => {
    setIsOpen(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    const result = await subscribeToEarlyAccess({ email, interest });
    setIsSubmitting(false);

    if (result && "error" in result) {
      setIsError(true);
      setMessage(result.error ?? "Unable to join early access right now.");
      return;
    }

    setIsError(false);
    setMessage(result?.message ?? "You have been added to the early access list.");
    setEmail("");
  };

  return (
    <>
      <div className={className}>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setIsError(false);
            setIsOpen(true);
          }}
          className={`inline-flex items-center justify-center text-sm font-semibold px-5 py-2.5 rounded-lg transition ${buttonClassName}`}
        >
          {buttonLabel}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600 mt-1">{description}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                aria-label="Close signup modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder={inputPlaceholder}
                className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition ${inputClassName}`}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-lg bg-[#188a4b] hover:bg-[#14733f] text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Joining..." : "Submit"}
                </button>
              </div>
              {message && (
                <p className={`text-xs ${isError ? "text-red-600" : "text-emerald-700"}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
