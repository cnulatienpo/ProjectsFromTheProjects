export default function Signup() {
  return (
    <article className="mx-auto flex max-w-xl flex-col gap-4 p-6 font-mono text-sm text-neutral-700">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">Sign up</h1>
        <p className="mt-1 text-neutral-500">Request early access to account features.</p>
      </header>

      <p>
        We&apos;re slowly opening account registrations so we can stress-test syncing
        and collaborative features. If you&apos;d like to join, send a brief note about
        your writing practice and how you plan to use The Good Word.
      </p>

      <p>
        Email
        {" "}
        <a className="underline" href="mailto:hello@thegoodword.games">
          hello@thegoodword.games
        </a>
        {" "}
        with the subject line &ldquo;Early access request&rdquo;. We onboard new cohorts at
        the start of each month and will confirm once there&apos;s a spot.
      </p>
    </article>
  );
}
