export default function Cookies() {
  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-4 p-6 font-mono text-sm">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">Cookie Policy</h1>
        <p className="mt-1 text-neutral-600">Last updated: 13 October 2025</p>
      </header>

      <p>
        This policy explains how Projects From The Projects uses cookies and similar
        technologies on The Good Word. Cookies are small text files stored on your
        device when you visit a website. We keep our cookie footprint light and
        transparent so you can stay in control.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Types of cookies we use</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Essential cookies.</strong> Required to deliver core
            functionality such as remembering that you dismissed the cookie banner
            or keeping in-progress gameplay states alive during a session.
          </li>
          <li>
            <strong>Analytics cookies.</strong> Help us understand how people
            discover and use the site so we can make better games. These cookies are
            optional and are only set after you provide consent.
          </li>
          <li>
            <strong>Local storage.</strong> Technically not cookies, but we use local
            storage to keep track of progress within writing games you opt into.
            This data stays on your device unless you choose to export or clear it.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Managing your preferences</h2>
        <p>
          When you first visit the site we ask for your analytics consent. You can
          change your mind anytime by clearing cookies and site data from your
          browser. Essential cookies cannot be disabled because the site will not
          function correctly without them.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Third-party cookies</h2>
        <p>
          If we embed third-party content (for example, a feedback form) those
          providers may set their own cookies. We review partners carefully and will
          update this policy if our integrations change.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Contact</h2>
        <p>
          Questions about cookies? Email us at
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
