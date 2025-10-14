export default function About() {
  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-4 p-6 font-mono text-sm">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">About The Good Word</h1>
        <p className="mt-1 text-neutral-600">Craft games for writers who love language.</p>
      </header>

      <p>
        The Good Word is an experiment by Projects From The Projects: can playful
        constraints, linguistic puzzles, and collaborative storytelling prompts help
        writers stretch their craft? We think so. Each game is designed to reward
        curiosity about etymology, precision in diction, and the joy of building a
        story from unexpected angles.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">What we&apos;re building</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Daily word challenges.</strong> Explore rare words sourced from
            historical dictionaries and modern corpora.
          </li>
          <li>
            <strong>Story structure drills.</strong> Practice beats, pitfalls, and
            revisions through interactive critiques.
          </li>
          <li>
            <strong>Shared vocabularies.</strong> Swap discoveries with other writers
            and keep a personal lexicon of favorites.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Our principles</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Make tools that respect a writer&apos;s time and privacy.</li>
          <li>Design for long-term craft growth, not streak anxiety.</li>
          <li>Share the research trail so anyone can trace every word.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Who is behind this?</h2>
        <p>
          Projects From The Projects is a small studio of editors, engineers, and
          narrative designers who cut their teeth in newsrooms and narrative games.
          We release early, listen carefully, and iterate in public.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Stay in touch</h2>
        <p>
          We share dev logs, upcoming playtests, and new pack releases in our
          newsletter. Drop a note to
          {" "}
          <a className="underline" href="mailto:hello@thegoodword.games">
            hello@thegoodword.games
          </a>
          {" "}
          if you&apos;d like an invite.
        </p>
      </section>
    </article>
  );
}
