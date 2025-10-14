export default function ResetPassword() {
  return (
    <article className="mx-auto flex max-w-xl flex-col gap-4 p-6 font-mono text-sm text-neutral-700">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-1 text-neutral-500">We&apos;re migrating to the unified account system.</p>
      </header>

      <p>
        If you have a beta account, you can reset your password using the secure
        link provided in your onboarding email. We do not yet support self-serve
        resets on this site while the new identity service is being tested.
      </p>

      <p>
        Need help? Email
        {" "}
        <a className="underline" href="mailto:support@thegoodword.games">
          support@thegoodword.games
        </a>
        {" "}
        from the address associated with your account and we&apos;ll send a manual reset
        link within one business day.
      </p>
    </article>
  );
}
