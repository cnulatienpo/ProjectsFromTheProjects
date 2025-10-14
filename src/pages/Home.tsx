import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="p-8 font-mono" data-testid="page-home">
      <h1
        className="font-extrabold text-5xl text-center w-full mb-10"
        style={{ letterSpacing: "0.05em" }}
      >
        Projects From The Projects
      </h1>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Project 1</h2>
        <Link
          to="/games"
          className="block mx-auto max-w-xl bg-neutral-900 text-white rounded-xl shadow-lg p-8 text-xl font-semibold hover:bg-neutral-800 transition cursor-pointer"
          style={{ textDecoration: "none" }}
        >
          Literary Deviousness—A Gamified Fiction Writing School for Broke Mutherfuckers
        </Link>
      </div>
    </main>
  );
}
