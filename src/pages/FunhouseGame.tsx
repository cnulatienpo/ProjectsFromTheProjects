import type { JSX } from "react";
import { Link, useParams } from "react-router-dom";

import { GameLoader } from "@/games/fun_house_writing";

export default function FunhouseGame(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6 text-center">
        <p className="text-lg font-semibold">No Funhouse game selected.</p>
        <Link
          to="/funhouse"
          className="mx-auto inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Browse Funhouse variants
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <GameLoader id={id} />
    </div>
  );
}
