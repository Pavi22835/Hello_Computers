function PrivacyPolicy() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">
        Privacy Policy
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--muted)]">
        <section>
          <h2 className="font-semibold text-[var(--ink)]">
            Information We Collect
          </h2>

          <p className="mt-2">
            We may collect information such as your name,
            email address, phone number, delivery address and
            order information when you use our services.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-[var(--ink)]">
            How We Use Information
          </h2>

          <p className="mt-2">
            Information may be used to process orders,
            provide customer support and improve our services.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-[var(--ink)]">
            Data Security
          </h2>

          <p className="mt-2">
            We take reasonable measures to protect customer
            information from unauthorized access.
          </p>
        </section>
      </div>
    </section>
  );
}

export default PrivacyPolicy;