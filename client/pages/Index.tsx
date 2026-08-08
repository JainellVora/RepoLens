import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { parseRepoInput } from "@/lib/github";
import { RepoLensMark } from "@/components/layout/SiteHeader";

const EXAMPLE_REPOS = [
  "facebook/react",
  "vercel/next.js",
  "vuejs/vue",
  "microsoft/vscode",
];

export default function Index() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const goToRepo = (input: string) => {
    const parsed = parseRepoInput(input);
    if (!parsed) {
      setError("Enter a valid GitHub repo, e.g. facebook/react or https://github.com/facebook/react");
      return;
    }
    setError(null);
    navigate(`/r/${parsed.owner}/${parsed.repo}`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    goToRepo(value);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_5%,transparent_68%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand/8 blur-[120px]" />

      <section className="container relative pb-20 pt-20 sm:pb-28 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up mb-6 flex justify-center" style={{ animationDelay: "40ms" }}>
            <RepoLensMark />
          </div>
          <h1 className="animate-fade-up text-4xl font-extrabold tracking-tight sm:text-6xl" style={{ animationDelay: "80ms" }}>
            Understand any GitHub repo
            <br />
            <span className="text-gradient">in under 60 seconds.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground" style={{ animationDelay: "150ms" }}>
            RepoLens analyzes any public repository and turns it into an interactive dashboard — architecture, dependencies, code organization, and health, instantly.
          </p>

          <form onSubmit={handleSubmit} className="animate-fade-up raised-control mx-auto mt-9 flex max-w-xl flex-col gap-3 rounded-xl p-1 sm:flex-row" style={{ animationDelay: "220ms" }}>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="github.com/owner/repository" className="neo-inset h-13 w-full rounded-lg py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none ring-brand/40 transition-shadow focus:ring-2" />
            </div>
            <button type="submit" className="raised-control inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/12 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_hsl(225_30%_3%_/_0.22)] backdrop-blur-xl transition-transform hover:scale-[1.02] hover:bg-white/18 active:scale-[0.99]">
              Analyze
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <div className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: "280ms" }}>
            <span className="text-xs text-muted-foreground">Try:</span>
            {EXAMPLE_REPOS.map((repo) => <button key={repo} onClick={() => goToRepo(repo)} className="rounded-full border border-border bg-secondary/50 px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground">{repo}</button>)}
          </div>
        </div>
      </section>
    </div>
  );
}
