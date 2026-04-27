export default function AboutUsSection() {
  return (
    <section id="about-us" className="snap-start pt-16 pb-12 scroll-mt-24 bg-[#f7fbf9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          <h3 className="text-base font-bold text-emerald-900">Tax Year Coverage</h3>
          <p className="text-sm text-emerald-800 mt-1.5 leading-relaxed">
            We cover <strong>9 tax years</strong> from 2018/19 to 2026/27. Please note that HMRC only allows
            tax filing or claims for up to <strong>4 previous years</strong>. Older years are provided for reference only.
          </p>
        </div>
      </div>
    </section>
  );
}
