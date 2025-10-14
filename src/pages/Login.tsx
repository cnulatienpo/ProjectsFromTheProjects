export default function Login() {
  return (
    <article className="mx-auto flex max-w-xl flex-col gap-4 p-6 font-mono text-sm text-neutral-700">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-1 text-neutral-500">Account features are rolling out in phases.</p>
      </header>

      <p>
        Accounts are currently in limited testing. If you already have credentials
        from a playtest invite, use the private beta portal linked in your welcome
        email. Public login will arrive once we finish syncing progress across
        devices.
      </p>

      <p>
        Need access or misplaced your invite? Email
        {" "}
        <a className="underline" href="mailto:support@thegoodword.games">
          support@thegoodword.games
        </a>
        {" "}
        and we&apos;ll help you get set up.
      </p>
    </article>
  );
}
