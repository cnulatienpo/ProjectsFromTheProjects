import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="p-8 font-mono" data-testid="page-home">
      <h1 className="text-2xl mb-4">Projects From The Projects</h1>
      <p className="mb-4">
        <Link className="underline" to="/games">
          Literary Deviousness
        </Link>
      </p>
    </main>
  );
}
