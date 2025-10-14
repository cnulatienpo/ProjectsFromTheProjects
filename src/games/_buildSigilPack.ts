// Build a normalized pack { items: [{term, definition, ...}, ...] } from scattered sources.

type AnyRec = Record<string, any>;
type Item = { term?: string; definition?: string; prompt?: string; target?: string; [k: string]: any };
type Pack = { items: Item[] };

const rawTextGlobs = import.meta.glob("/labled data/**/*.{txt,md,jsonl}", { as: "raw", eager: true });
const rawJsonGlobs = import.meta.glob("/labled data/**/*.json", { eager: true });
const rawTsGlobs   = import.meta.glob("/labled data/**/*.{ts,tsx}", { eager: true });

const gtTextGlobs  = import.meta.glob("/game thingss/**/*.{txt,md,jsonl}", { as: "raw", eager: true });
const gtJsonGlobs  = import.meta.glob("/game thingss/**/*.json", { eager: true });
const gtTsGlobs    = import.meta.glob("/game thingss/**/*.{ts,tsx}", { eager: true });

// Helper parsers
function stripBOM(s: string){ return s.charCodeAt(0)===0xFEFF ? s.slice(1) : s; }
function safeParse<T=unknown>(s:string){ try{ return JSON.parse(s) as T; }catch{ return null; } }

function fromJsonModule(mod: any): Item[] {
  if (!mod) return [];
  const val = ("default" in mod) ? mod.default : mod;
  if (Array.isArray(val)) return val as Item[];
  if (val && typeof val === "object" && Array.isArray((val as AnyRec).items)) return (val as AnyRec).items as Item[];
  return [];
}

function fromTsModule(mod: any): Item[] {
  if (!mod) return [];
  if ("items" in mod && Array.isArray(mod.items)) return mod.items as Item[];
  if ("default" in mod && Array.isArray(mod.default)) return mod.default as Item[];
  return [];
}

function fromDelimited(text: string): Item[] {
  const rows = stripBOM(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  // support: "term | definition" or "term\tdefinition" or "term,definition"
  return rows.map(r => {
    const parts = r.split(/\s*\|\s*|\t|,/, 2);
    if (parts.length === 2) return { term: parts[0], definition: parts[1] };
    // Markdown bullet: "- term: definition"
    const m = r.match(/^[\-\*\+]\s*(.+?)\s*:\s*(.+)$/);
    if (m) return { term: m[1], definition: m[2] };
    return { term: r };
  });
}

function fromJsonl(text: string): Item[] {
  const lines = stripBOM(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(l => safeParse<Item>(l) ?? { term: l });
}

function fromMd(text: string): Item[] {
  // naive: collect lines with ":" or headers
  const rows = stripBOM(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items: Item[] = [];
  for (const r of rows) {
    const m = r.match(/^#+\s*(.+)$/); // header -> term
    if (m) { items.push({ term: m[1] }); continue; }
    const d = r.match(/^(.+?)\s*:\s*(.+)$/);
    if (d) { items.push({ term: d[1], definition: d[2] }); continue; }
  }
  return items;
}

function normalizeFields(i: Item): Item {
  // prefer (term, definition); accept (prompt, target)
  const term = i.term ?? i.prompt ?? i.word ?? i.name;
  const definition = i.definition ?? i.target ?? i.meaning ?? i.desc ?? i.definitionText;
  const out: Item = { ...i };
  if (term !== undefined) out.term = String(term);
  if (definition !== undefined) out.definition = String(definition);
  return out;
}

function harvest(): Item[] {
  const items: Item[] = [];

  // JSON modules
  for (const mod of Object.values(rawJsonGlobs)) items.push(...fromJsonModule(mod));
  for (const mod of Object.values(gtJsonGlobs))  items.push(...fromJsonModule(mod));

  // TS modules exporting items/default
  for (const mod of Object.values(rawTsGlobs)) items.push(...fromTsModule(mod));
  for (const mod of Object.values(gtTsGlobs))  items.push(...fromTsModule(mod));

  // Raw text/md/jsonl
  const asItems = (text: string, path: string): Item[] => {
    if (path.endsWith(".jsonl")) return fromJsonl(text);
    if (path.endsWith(".md")) return fromMd(text);
    return fromDelimited(text);
  };

  for (const [p, t] of Object.entries(rawTextGlobs)) items.push(...asItems(String(t), p));
  for (const [p, t] of Object.entries(gtTextGlobs))  items.push(...asItems(String(t), p));

  // Normalize, de-dupe simple
  const norm = items.map(normalizeFields).filter(x => x.term || x.definition);
  const seen = new Set<string>();
  const uniq: Item[] = [];
  for (const it of norm) {
    const key = `${it.term}::${it.definition ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(it);
  }
  return uniq;
}

// Build once at dev time; you (the human) will copy the output below into src/data/sigilSyntaxItems.json
export function __DEV_dumpSigilPack(): string {
  const items = harvest();
  const pack: Pack = { items };
  return JSON.stringify(pack, null, 2);
}
