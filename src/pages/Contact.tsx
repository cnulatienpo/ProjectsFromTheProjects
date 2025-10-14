export default function Contact() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-4 p-6 font-mono text-sm">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">Contact</h1>
        <p className="mt-1 text-neutral-600">We read every note.</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Email</h2>
        <p>
          General questions, bug reports, or collaboration ideas: send a message to
          {" "}
          <a className="underline" href="mailto:hello@thegoodword.games">
            hello@thegoodword.games
          </a>
          . We aim to reply within two business days.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Press &amp; partnerships</h2>
        <p>
          For interviews, event appearances, or licensing, reach the studio team at
          {" "}
          <a className="underline" href="mailto:press@thegoodword.games">
            press@thegoodword.games
          </a>
          . Include timelines and relevant background so we can respond quickly.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Community</h2>
        <p>
          Join upcoming playtests by signing up to our newsletter (request an invite
          via email) or by following our public updates on the project blog. We host
          a quarterly office hour for educators and writing group facilitators—ask
          for the next date if you&apos;d like to attend.
        </p>
      </section>
    </article>
  );
}
