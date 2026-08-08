import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, User } from "lucide-react";
import { parseRepoInput, parseUserInput } from "@/lib/github";
import { RepoLensMark } from "@/components/layout/SiteHeader";

const EXAMPLE_REPOS = [
  "facebook/react",
  "vercel/next.js",
  "vuejs/vue",
  "microsoft/vscode",
];

const EXAMPLE_USERS = ["vercel", "facebook", "torvalds", "vuejs"];

export default function Index() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = (input: string) => {
    const repoMatch = parseRepoInput(input);
    if (repoMatch) {
      setError(null);
      navigate(`/r/${repoMatch.owner}/${repoMatch.repo}`);
      return;
    }

    const userMatch = parseUserInput(input);
    if (userMatch) {
      setError(null);
      navigate(`/user/${userMatch.username}`);
      return;
    }

    setError("Enter a valid repository (e.g. facebook/react) or GitHub user (e.g. facebook or @jainelvora)");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleSearch(value);
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
            <span className="text-gradient">or explore any user.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground" style={{ animationDelay: "150ms" }}>
            RepoLens analyzes public repositories and GitHub profiles — architecture, dependencies, code organization, and user repos, instantly.
          </p>

          <form onSubmit={handleSubmit} className="animate-fade-up raised-control mx-auto mt-9 flex max-w-xl flex-col gap-3 rounded-xl p-1 sm:flex-row" style={{ animationDelay: "220ms" }}>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="github.com/owner/repo or @username"
                className="neo-inset h-13 w-full rounded-lg py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none ring-brand/40 transition-shadow focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="raised-control inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/12 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_hsl(225_30%_3%_/_0.22)] backdrop-blur-xl transition-transform hover:scale-[1.02] hover:bg-white/18 active:scale-[0.99]"
            >
              Search / Analyze
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <div className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: "280ms" }}>
            <span className="text-xs text-muted-foreground">Repos:</span>
            {EXAMPLE_REPOS.map((repo) => (
              <button
                key={repo}
                onClick={() => handleSearch(repo)}
                className="rounded-full border border-border bg-secondary/50 px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
              >
                {repo}
              </button>
            ))}
          </div>

          <div className="animate-fade-up mt-3 flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: "320ms" }}>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3 text-brand" /> Users:
            </span>
            {EXAMPLE_USERS.map((user) => (
              <button
                key={user}
                onClick={() => handleSearch(`@${user}`)}
                className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 font-mono text-xs text-brand transition-colors hover:bg-brand hover:text-white"
              >
                @{user}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
