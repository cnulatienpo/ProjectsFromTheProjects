import { Link } from "react-router-dom";

export default function Dictionary() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <header>
        <h1 className="text-3xl font-semibold">Dictionary</h1>
        <p className="text-neutral-500">Dictionary — placeholder page (wire me up later)</p>
      </header>
      <p>
        This placeholder keeps the Sigil & Syntax navigation functioning until the interactive
        dictionary experience is restored.
      </p>
      <p>
        <Link className="text-blue-500 underline" to="/">Return home</Link>
      </p>
    </section>
  );
}
