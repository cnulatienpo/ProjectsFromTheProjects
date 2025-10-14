export default function Terms() {
  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-4 p-6 font-mono text-sm">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">Terms of Service</h1>
        <p className="mt-1 text-neutral-600">Last updated: 13 October 2025</p>
      </header>

      <p>
        These terms govern your access to and use of The Good Word, a collection of
        writing games operated by Projects From The Projects. By using the site,
        you agree to follow these terms and all applicable laws. If you disagree
        with any part of the terms, do not use the service.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Using the service</h2>
        <p>
          You may use the site for personal, non-commercial purposes. Do not abuse
          the service by attempting to hack, overload, or disrupt it. Do not use the
          site to harass others or to post content that is unlawful, discriminatory,
          or violates anyone&apos;s rights.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Accounts</h2>
        <p>
          Accounts are currently optional and may be introduced in stages. When
          account features are available you must provide accurate information and
          keep your credentials secure. You are responsible for all activity that
          happens under your account. Let us know immediately if you suspect your
          account has been compromised.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Content &amp; ownership</h2>
        <p>
          We own the site design, software, and original content we publish. You
          retain ownership of the writing you produce while using the tools. By
          submitting feedback, suggestions, or improvements, you grant us a
          non-exclusive, perpetual license to use that input to improve the service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Third-party services</h2>
        <p>
          We may link to third-party resources or integrate optional services such
          as analytics providers. Those services are governed by their own policies
          and terms. We are not responsible for their content or practices.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Disclaimer</h2>
        <p>
          The service is provided &quot;as is&quot;. We make no warranties about reliability,
          availability, or suitability for your purposes. To the maximum extent
          permitted by law, we are not liable for any indirect or consequential
          damages arising from your use of the site.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Termination</h2>
        <p>
          We may suspend or end your access if you violate these terms or use the
          service in a way that could harm other users or our infrastructure. You
          can stop using the service at any time. We will strive to notify you of
          significant changes to the service that affect your access.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Changes to these terms</h2>
        <p>
          We may update these terms periodically. If changes are significant we
          will post a notice on the site or email affected users when possible. By
          continuing to use the service after updates take effect, you agree to the
          revised terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Contact</h2>
        <p>
          Questions about these terms? Email
          {" "}
          <a className="underline" href="mailto:hello@thegoodword.games">
            hello@thegoodword.games
          </a>
          .
        </p>
      </section>
    </article>
  );
}
