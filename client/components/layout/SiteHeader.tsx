import { useState } from "react";
import { Link } from "react-router-dom";
import { Cat, Check, Code2, Monitor, Moon, Settings, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "./ThemeProvider";

const GITHUB_CAT_IMAGE = "https://cdn.builder.io/api/v1/image/assets%2F03d5a841c8c44ee1adf85cdf1db1116b%2Fb187ecae5cc7455e920940500fb535bc?format=webp&width=800&height=1200";

export function RepoLensMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`repolens-mark ${compact ? "repolens-mark-compact" : ""}`} aria-hidden="true">
      <span className="repolens-mark-orbit repolens-mark-orbit-back" />
      <span className="repolens-mark-orbit repolens-mark-orbit-front" />
      <span className="repolens-mark-glass" />
      <span className="repolens-mark-core"><img src={GITHUB_CAT_IMAGE} alt="" /></span>
      <span className="repolens-mark-handle" />
    </span>
  );
}

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function ThemeSettings() {
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} aria-label="Theme settings" aria-expanded={open} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/8 text-muted-foreground backdrop-blur-xl transition-colors hover:bg-white/15 hover:text-foreground"><Settings className="h-4 w-4" /></button>
      {open && <div className="absolute right-0 top-12 z-50 w-40 rounded-xl border border-white/15 bg-card/80 p-1.5 shadow-2xl backdrop-blur-2xl">
        <p className="px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Appearance</p>
        {themeOptions.map((option) => <button key={option.value} onClick={() => { setMode(option.value); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-white/10"><option.icon className="h-4 w-4 text-muted-foreground" /><span className="flex-1">{option.label}</span>{mode === option.value && <Check className="h-3.5 w-3.5 text-brand" />}</button>)}
      </div>}
    </div>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/35 shadow-[0_8px_30px_hsl(225_30%_3%_/_0.18)] backdrop-blur-2xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <RepoLensMark compact />
          <span className="text-lg font-bold tracking-tight">
            Repo<span className="text-gradient">Lens</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/search"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            History
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <Cat className="h-4 w-4" />
            GitHub
          </a>
          <ThemeSettings />
          <Link
            to="/"
            className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_hsl(225_30%_3%_/_0.2)] backdrop-blur-xl transition-transform hover:scale-[1.03] hover:bg-white/15"
          >
            Analyze a repo
          </Link>
        </nav>
      </div>
    </header>
  );
}
