import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <Link href="/dashboard" className="text-[#188a4b] hover:underline text-sm">&larr; Back to dashboard</Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mt-2 mb-8">Last updated: 24 July 2025</p>

        <div className="prose prose-slate max-w-none space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-semibold text-slate-800">1. What Data We Collect</h2>
            <p className="text-slate-600">
              When you create an account, we collect your <strong>email address</strong>, <strong>name</strong> (optional),
              and a <strong>hashed password</strong> (we never store your plain-text password). When you use the calculator,
              we store your <strong>tax entries</strong>, <strong>income data</strong>, and <strong>calculation settings</strong>
              so you can save and revisit them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">2. How We Use Your Data</h2>
            <p className="text-slate-600">
              Your data is used solely to provide the tax calculation service. We do <strong>not</strong> sell,
              share, or rent your personal data to third parties. We do not use your financial data for
              advertising or profiling purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">3. Data Security</h2>
            <p className="text-slate-600">
              Passwords are hashed using bcrypt (12 rounds). Sensitive financial data is encrypted at rest
              using AES-256-GCM. All connections use HTTPS in production. Sessions are managed via
              HttpOnly, Secure, SameSite cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">4. Your Rights (GDPR)</h2>
            <p className="text-slate-600">Under GDPR and UK data protection law, you have the right to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li><strong>Access</strong> your data — export all your data as JSON from your account settings</li>
              <li><strong>Rectification</strong> — edit any of your saved tax entries at any time</li>
              <li><strong>Erasure</strong> — permanently delete your account and all associated data</li>
              <li><strong>Data portability</strong> — download your data in a structured, machine-readable format</li>
              <li><strong>Object</strong> — you can stop using the service and delete your account at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">5. Audit Logs</h2>
            <p className="text-slate-600">
              Every change to your tax entries (create, update, delete) is recorded in an immutable audit log.
              You can view your audit log in your account settings. Audit logs include timestamps and
              before/after snapshots of changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">6. Cookies</h2>
            <p className="text-slate-600">
              We use a single essential cookie for authentication (session management). We do not use
              tracking cookies, analytics cookies, or third-party cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">7. Data Retention</h2>
            <p className="text-slate-600">
              Your data is retained for as long as you maintain an active account. If you delete your account,
              all data (including tax entries, settings, and audit logs) is permanently and irrecoverably deleted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">8. Disclaimer</h2>
            <p className="text-slate-600">
              This website provides tax estimates for informational purposes only. It is <strong>not</strong> a
              substitute for professional tax advice. Always verify calculations with HMRC or a qualified
              accountant. Tax data is sourced from publicly available HMRC rates and thresholds.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
