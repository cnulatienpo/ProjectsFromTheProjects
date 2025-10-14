export default function DMCA() {
  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-4 p-6 font-mono text-sm">
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold">DMCA Policy</h1>
        <p className="mt-1 text-neutral-600">Last updated: 13 October 2025</p>
      </header>

      <p>
        Projects From The Projects respects intellectual property rights and
        expects our community to do the same. This page explains how to submit a
        Digital Millennium Copyright Act (DMCA) notice if you believe copyrighted
        material appears on The Good Word without permission.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Submit a takedown notice</h2>
        <p>Send an email that includes all of the following:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Your full legal name and contact information.</li>
          <li>
            Identification of the copyrighted work you believe was infringed (for
            example, a URL to the original work or a detailed description).
          </li>
          <li>
            Identification of the allegedly infringing material on The Good Word,
            including exact URLs or enough information to locate it.
          </li>
          <li>
            A statement that you have a good-faith belief the use is not authorized
            by the copyright owner, agent, or the law.
          </li>
          <li>
            A statement, under penalty of perjury, that the information in your
            notice is accurate and that you are authorized to act on behalf of the
            copyright owner.
          </li>
          <li>Your physical or electronic signature.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Where to send notices</h2>
        <p>
          Email DMCA requests to
          {" "}
          <a className="underline" href="mailto:legal@thegoodword.games">
            legal@thegoodword.games
          </a>
          . If postal mail is required we will provide a mailing address after we
          receive your email.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Counter notices</h2>
        <p>
          If you believe your content was removed by mistake or misidentification,
          you may submit a counter notice containing the information required by
          Section 512(g) of the DMCA. We will forward the counter notice to the
          original claimant and restore the material within 10–14 business days
          unless the claimant notifies us that they have filed a lawsuit seeking a
          court order.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Repeat infringers</h2>
        <p>
          We reserve the right to terminate access for users who repeatedly infringe
          copyrights or who ignore valid takedown requests.
        </p>
      </section>
    </article>
  );
}
