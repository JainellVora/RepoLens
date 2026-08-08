import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Code2, Search, Star, Trash2 } from "lucide-react";
import { formatCompactNumber, formatRelativeDate } from "@/lib/github";

export interface SavedAnalysis {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  updatedAt: string;
  analyzedAt: string;
}

export const ANALYSIS_HISTORY_KEY = "repolens-analysis-history";

export default function AnalysisSearch() {
  const [items, setItems] = useState<SavedAnalysis[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(ANALYSIS_HISTORY_KEY) ?? "[]"));
    } catch {
      setItems([]);
    }
  }, []);

  const filtered = items.filter((item) => item.fullName.toLowerCase().includes(query.toLowerCase()));
  const clearHistory = () => {
    localStorage.removeItem(ANALYSIS_HISTORY_KEY);
    setItems([]);
  };

  return (
    <div className="container py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">Workspace</p><h1 className="mt-3 text-3xl font-bold tracking-tight">Analyzed repositories</h1><p className="mt-2 text-muted-foreground">Jump back into repositories you have explored recently.</p></div>
          {items.length > 0 && <button onClick={clearHistory} className="inline-flex items-center gap-2 self-start rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Clear history</button>}
        </div>
        <div className="relative mt-8"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search analyzed repositories..." className="h-12 w-full rounded-lg border border-border bg-card pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand/40" /></div>
        <div className="mt-6 space-y-3">
          {filtered.map((item) => <Link key={item.fullName} to={`/r/${item.owner}/${item.repo}`} className="group flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-5 transition-colors hover:border-brand/50 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><Code2 className="h-5 w-5 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="truncate font-mono text-sm font-semibold">{item.fullName}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.description || "No description provided."}</p></div></div><div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-warning" /> {formatCompactNumber(item.stars)}</span><span>{item.language || "Unknown"}</span><span className="hidden items-center gap-1 sm:inline-flex"><Clock3 className="h-3.5 w-3.5" /> {formatRelativeDate(item.analyzedAt)}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div></Link>)}
          {filtered.length === 0 && <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center"><Search className="mx-auto h-7 w-7 text-muted-foreground" /><h2 className="mt-4 font-semibold">No analyzed repositories found</h2><p className="mt-2 text-sm text-muted-foreground">Analyze a public GitHub repository and it will appear here.</p><Link to="/" className="mt-6 inline-flex rounded-md bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">Analyze a repository</Link></div>}
        </div>
      </div>
    </div>
  );
}
