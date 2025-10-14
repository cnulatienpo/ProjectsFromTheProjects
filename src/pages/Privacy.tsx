export default function Privacy() {
  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-4 p-6 font-mono text-sm">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="mt-1 text-neutral-600">Last updated: 13 October 2025</p>
      </header>

      <p>
        Projects From The Projects (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) builds fiction-writing
        practice tools under the banner <strong>The Good Word</strong>. This policy
        explains what information we collect when you use our website and games,
        how we use it, and the choices you have about your data.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Information we collect</h2>
        <p>
          We collect only the information required to keep the site functional and
          improve the experiences we build. That includes:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Usage data.</strong> Basic analytics such as page views, feature
            interactions, approximate geography, device/browser type, and referral
            sources. Analytics data is aggregated and does not identify you
            personally.
          </li>
          <li>
            <strong>Voluntary information.</strong> Details you send us when you fill
            out a feedback form, request support, or email us directly.
          </li>
          <li>
            <strong>Progress saves.</strong> When you opt-in, we store writing game
            progress in your browser using local storage so you can pick up where you
            left off. This information stays on your device unless you choose to
            export it.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">How we use information</h2>
        <p>We use collected information to:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Monitor site performance and debug issues.</li>
          <li>Plan new features and prioritize writing games.</li>
          <li>Respond to requests, feedback, or bug reports you send us.</li>
          <li>Enforce our Terms of Service and keep the community safe.</li>
        </ul>
        <p>
          We do not sell your personal information or share it with advertisers.
          When we use trusted infrastructure providers (for example, to host
          analytics or store issue reports) we ensure they process data only on our
          behalf and under strict confidentiality agreements.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Cookies &amp; tracking</h2>
        <p>
          We explain our cookie usage in more detail in the Cookie Policy. In
          short, we rely on a small number of essential cookies to remember your
          preferences (such as analytics consent) and to keep interactive features
          working.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Data retention</h2>
        <p>
          We keep analytics data for up to 18 months so we can identify trends over
          time. Correspondence that you initiate (for example, support requests) is
          kept for as long as the conversation is active and archived once resolved.
          You can request deletion at any time by emailing us.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct,
          export, or delete your personal information. Contact us and we will act on
          your request within 30 days. We may need to verify your identity before
          fulfilling certain requests.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Children&apos;s privacy</h2>
        <p>
          Our games are designed for writers aged 13 and older. We do not knowingly
          collect personal information from children under 13. If you believe a
          child has provided us with information, please let us know so we can
          remove it.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Updates to this policy</h2>
        <p>
          We will update this document when our practices change. Significant
          changes will be announced on the site. When required by law we will ask
          for your consent before applying the updates.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Contact</h2>
        <p>
          Questions about privacy? Email us at
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
