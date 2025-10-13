import { useEffect, useState } from "react";
import { fetchBeats, fetchCatalog, fetchPractice, type PracticeItem } from "../lib/cutGamesClient";

type CatalogSummary = {
    tweetrunkCount?: number;
    goodCount?: number;
    badCount?: number;
    beatsIndex?: unknown;
    lessonsByTagCount?: number;
    modes?: unknown;
    [key: string]: unknown;
};

export default function CutGamesDebug() {
    const [catalog, setCatalog] = useState<CatalogSummary | null>(null);
    const [beats, setBeats] = useState<any[]>([]);
    const [good, setGood] = useState<PracticeItem[]>([]);
    const [bad, setBad] = useState<PracticeItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [cat, beatsIndex, goodRows, badRows] = await Promise.all([
                    fetchCatalog(),
                    fetchBeats(),
                    fetchPractice({ mode: "good" }),
                    fetchPractice({ mode: "bad" })
                ]);
                if (cancelled) return;
                setCatalog(cat);
                setBeats(Array.isArray(beatsIndex) ? beatsIndex : []);
                setGood(goodRows.slice(0, 3));
                setBad(badRows.slice(0, 3));
            } catch (err) {
                if (cancelled) return;
                setError((err as Error).message || "Failed to load Cut Games data");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="mx-auto max-w-4xl space-y-4 p-6">
            <h1 className="text-2xl font-semibold">Cut Games Debug</h1>
            {error && <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>}
            {catalog && (
                <div className="rounded border border-brand-soft/40 p-4 shadow-sm">
                    <h2 className="text-xl font-medium">Catalog</h2>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>Tweetrunk entries: {catalog.tweetrunkCount ?? "?"}</li>
                        <li>Practice good scenes: {catalog.goodCount ?? "?"}</li>
                        <li>Practice bad scenes: {catalog.badCount ?? "?"}</li>
                        <li>Beats tracked: {Array.isArray(beats) ? beats.length : "?"}</li>
                        <li>Lesson tags: {catalog.lessonsByTagCount ?? "?"}</li>
                    </ul>
                </div>
            )}
            {good.length > 0 && (
                <section className="rounded border border-emerald-500/40 p-4">
                    <h2 className="font-medium text-emerald-700">Practice: Good (sample)</h2>
                    <ol className="mt-2 space-y-2 text-sm text-slate-700">
                        {good.map(item => (
                            <li key={`good-${item.id}`}>
                                <div className="font-semibold">#{item.id}</div>
                                <div className="whitespace-pre-line">{item.scene}</div>
                                {item.beat && <div className="text-xs uppercase text-emerald-600">beat: {item.beat}</div>}
                            </li>
                        ))}
                    </ol>
                </section>
            )}
            {bad.length > 0 && (
                <section className="rounded border border-rose-500/40 p-4">
                    <h2 className="font-medium text-rose-700">Practice: Bad (sample)</h2>
                    <ol className="mt-2 space-y-2 text-sm text-slate-700">
                        {bad.map(item => (
                            <li key={`bad-${item.id}`}>
                                <div className="font-semibold">#{item.id}</div>
                                <div className="whitespace-pre-line">{item.scene}</div>
                                {item.beat && <div className="text-xs uppercase text-rose-600">beat: {item.beat}</div>}
                                {item.pitfall && <div className="text-xs uppercase text-rose-500">pitfall: {item.pitfall}</div>}
                            </li>
                        ))}
                    </ol>
                </section>
            )}
        </div>
    );
}
