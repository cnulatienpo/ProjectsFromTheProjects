import { Link } from "react-router-dom";

export default function Foundation() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <header>
        <h1 className="text-3xl font-semibold">Foundation</h1>
        <p className="text-neutral-500">Foundation — placeholder page (wire me up later)</p>
      </header>
      <p>
        This is a placeholder page for the Foundations curriculum. Replace this content with the
        actual lesson browser when it is ready.
      </p>
      <p>
        <Link className="text-blue-500 underline" to="/">Return home</Link>
      </p>
    </section>
  );
}
