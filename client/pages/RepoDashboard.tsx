import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  FileText,
  Code2,
  Download,
  ExternalLink,
  FileCode2,
  Files,
  FolderTree,
  GitBranch,
  GitFork,
  GitPullRequest,
  Loader2,
  Network,
  Package,
  Search,
  Server,
  Share2,
  Star,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ANALYSIS_HISTORY_KEY } from "./AnalysisSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildFileTree,
  downloadTextFile,
  fetchPullRequestImpact,
  fetchRepoAnalysis,
  formatBytes,
  formatCompactNumber,
  formatRelativeDate,
  generateMarkdownReport,
  getLanguageColor,
  parsePullRequestInput,
  summarizeReadme,
  type PullRequestImpact,
  type RepoAnalysis,
  type TreeNode,
} from "@/lib/github";

const tabItems = [
  { value: "overview", label: "Overview", icon: LayoutIcon },
  { value: "explorer", label: "Explorer", icon: Files },
  { value: "dependencies", label: "Dependencies", icon: Network },
  { value: "dependency-graph", label: "Graph", icon: Network },
  { value: "architecture", label: "Architecture", icon: Box },
  { value: "hotspots", label: "Hotspots", icon: Zap },
  { value: "health", label: "Health", icon: CheckCircle2 },
  { value: "impact", label: "PR Impact", icon: GitPullRequest },
];

function LayoutIcon(props: { className?: string }) {
  return <Server {...props} />;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-secondary/20 px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-mono text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function TreeRow({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const isFolder = node.type === "tree";
  return (
    <div>
      <button
        onClick={() => isFolder && setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary/70"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {isFolder ? (
          open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : <span className="w-3.5" />}
        {isFolder ? <BookOpen className="h-4 w-4 text-brand" /> : <FileCode2 className="h-4 w-4 text-muted-foreground" />}
        <span className={isFolder ? "font-medium" : "font-mono text-xs text-muted-foreground"}>{node.name}</span>
        {!isFolder && node.size ? <span className="ml-auto pr-2 font-mono text-[10px] text-muted-foreground">{formatBytes(node.size)}</span> : null}
      </button>
      {isFolder && open && node.children.map((child) => <TreeRow key={child.path} node={child} depth={depth + 1} />)}
    </div>
  );
}

function LanguageBars({ analysis }: { analysis: RepoAnalysis }) {
  const entries = Object.entries(analysis.languages).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
        {entries.map(([language, bytes], index) => <div key={language} style={{ width: `${(bytes / total) * 100}%`, backgroundColor: getLanguageColor(language, index) }} />)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {entries.slice(0, 6).map(([language, bytes], index) => (
          <div key={language} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getLanguageColor(language, index) }} />
            <span className="text-muted-foreground">{language}</span>
            <span className="ml-auto font-mono">{((bytes / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DependencyGraph({ deps }: { deps: [string, string][] }) {
  const visible = deps.slice(0, 10);
  const left = visible.filter((_, index) => index % 2 === 0);
  const right = visible.filter((_, index) => index % 2 === 1);
  const Node = ({ dependency }: { dependency: [string, string] }) => <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 shadow-lg backdrop-blur-xl"><Package className="h-4 w-4 shrink-0 text-brand-cyan" /><span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{dependency[0]}</span><span className="font-mono text-[10px] text-muted-foreground">{dependency[1]}</span></div>;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-background/45 p-4 sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="relative grid min-h-[360px] grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_150px_1fr] sm:gap-8">
        <div className="space-y-3">{left.map((dependency) => <Node key={dependency[0]} dependency={dependency} />)}</div>
        <div className="relative z-10 mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-3xl border border-brand/50 bg-brand/15 text-center shadow-[0_0_35px_hsl(var(--brand)/.25)] backdrop-blur-xl"><Network className="h-7 w-7 text-brand-cyan" /><span className="mt-2 max-w-24 truncate font-mono text-xs font-semibold">{deps.length ? "project" : "no deps"}</span><span className="mt-1 text-[10px] text-muted-foreground">{deps.length} direct</span></div>
        <div className="space-y-3">{right.map((dependency) => <Node key={dependency[0]} dependency={dependency} />)}</div>
      </div>
      {!visible.length && <p className="mt-4 text-center text-sm text-muted-foreground">No package.json dependencies were detected.</p>}
      {visible.length > 0 && <p className="relative mt-5 text-center text-[11px] text-muted-foreground">Showing {visible.length} direct dependencies · package relationships are inferred from the manifest.</p>}
    </div>
  );
}

function LoadingState({ owner, repo }: { owner: string; repo: string }) {
  return (
    <div className="container flex min-h-[75vh] flex-col items-center justify-center py-24 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
        <Loader2 className="h-7 w-7 animate-spin text-white" />
      </div>
      <p className="mt-7 font-mono text-sm text-brand">analyzing {owner}/{repo}</p>
      <h1 className="mt-3 text-2xl font-bold">Mapping the codebase<span className="animate-pulse">...</span></h1>
      <p className="mt-2 text-sm text-muted-foreground">Fetching metadata, files, languages, and dependencies from GitHub.</p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-2 text-left">
        {["Repository metadata", "Language breakdown", "File structure", "Dependency manifests"].map((item, index) => (
          <div key={item} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-sm" style={{ opacity: 1 - index * 0.12 }}>
            {index === 0 ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Loader2 className="h-4 w-4 animate-spin text-brand" />}
            <span className="text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RepoDashboard() {
  const { owner = "", repo = "" } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [prInput, setPrInput] = useState("");
  const [prImpact, setPrImpact] = useState<PullRequestImpact | null>(null);
  const [prError, setPrError] = useState<string | null>(null);
  const [prLoading, setPrLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setAnalysis(null);
    setError(null);
    fetchRepoAnalysis(owner, repo).then((result) => {
      if (active) {
        setAnalysis(result);
        try {
          const current = JSON.parse(localStorage.getItem(ANALYSIS_HISTORY_KEY) ?? "[]");
          const next = [{ owner, repo, fullName: result.repo.full_name, description: result.repo.description, stars: result.repo.stargazers_count, language: result.repo.language, updatedAt: result.repo.updated_at, analyzedAt: new Date().toISOString() }, ...current.filter((item: { fullName: string }) => item.fullName !== result.repo.full_name)].slice(0, 20);
          localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(next));
        } catch {
          // Local history is an enhancement and should never block analysis.
        }
      }
    }).catch((err: Error) => {
      if (active) setError(err.message);
    });
    return () => { active = false; };
  }, [owner, repo]);

  const tree = useMemo(() => analysis ? buildFileTree(analysis.tree) : [], [analysis]);
  const files = useMemo(() => analysis?.tree.filter((entry) => entry.type === "blob") ?? [], [analysis]);
  const filteredTree = useMemo(() => {
    if (!query.trim()) return tree;
    const term = query.toLowerCase();
    return tree.filter((node) => node.path.toLowerCase().includes(term));
  }, [query, tree]);

  if (error) {
    return (
      <div className="container flex min-h-[75vh] flex-col items-center justify-center py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10"><XCircle className="h-7 w-7 text-destructive" /></div>
        <h1 className="mt-6 text-2xl font-bold">Unable to analyze this repository</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
        <button onClick={() => navigate("/")} className="mt-7 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white">Try another repository</button>
      </div>
    );
  }
  if (!analysis) return <LoadingState owner={owner} repo={repo} />;

  const { repo: repoInfo } = analysis;
  const totalBytes = Object.values(analysis.languages).reduce((sum, bytes) => sum + bytes, 0);
  const packageDeps = Object.entries(analysis.packageJson?.dependencies ?? {});
  const shareAnalysis = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const analyzePullRequest = async () => {
    const parsed = parsePullRequestInput(prInput);
    if (!parsed) {
      setPrError("Paste a pull request URL or enter a number like #42.");
      return;
    }
    setPrLoading(true);
    setPrError(null);
    try {
      setPrImpact(await fetchPullRequestImpact(owner, repo, parsed.number));
    } catch (err) {
      setPrError(err instanceof Error ? err.message : "Unable to analyze this pull request.");
    } finally {
      setPrLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/10">
      <div className="border-b border-border/70 bg-background">
        <div className="container py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => navigate("/")} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><ArrowLeft className="h-4 w-4" /></button>
              <img src={repoInfo.owner.avatar_url} alt="" className="h-9 w-9 rounded-full border border-border" />
              <div className="min-w-0">
                <div className="flex items-center gap-2"><h1 className="truncate text-lg font-bold">{repoInfo.full_name}</h1><Badge variant="outline" className="hidden sm:inline-flex">Public</Badge></div>
                <p className="truncate text-sm text-muted-foreground">{repoInfo.description || "No description provided."}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => downloadTextFile(`${repoInfo.name}-repolens-report.md`, generateMarkdownReport(analysis))} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export MD</span></button>
              <button onClick={() => window.print()} className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary md:inline-flex"><FileText className="h-4 w-4" /> PDF</button>
              <button onClick={shareAnalysis} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"><Share2 className="h-4 w-4" /> <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span></button>
              <a href={repoInfo.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-brand-gradient px-3 py-2 text-sm font-semibold text-white shadow-glow"><Code2 className="h-4 w-4" /> <span className="hidden sm:inline">View on GitHub</span><ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-warning" /> {formatCompactNumber(repoInfo.stargazers_count)} stars</span>
            <span className="text-border">·</span><span className="inline-flex items-center gap-1.5"><GitFork className="h-3.5 w-3.5" /> {formatCompactNumber(repoInfo.forks_count)} forks</span>
            <span className="text-border">·</span><span className="inline-flex items-center gap-1.5"><CircleDot className="h-3.5 w-3.5" /> {formatCompactNumber(repoInfo.open_issues_count)} issues</span>
            <span className="text-border">·</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> updated {formatRelativeDate(repoInfo.updated_at)}</span>
          </div>
        </div>
      </div>

      <div className="container py-7">
        <Tabs defaultValue="overview" className="space-y-7">
          <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg border border-border/70 bg-card/50 p-1">
            {tabItems.map((tab) => <TabsTrigger key={tab.value} value={tab.value} className="gap-2 px-3 py-2 text-xs sm:text-sm"><tab.icon className="h-3.5 w-3.5" />{tab.label}</TabsTrigger>)}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <section className="glass-card p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10"><BookOpen className="h-5 w-5 text-brand" /></div><div><h2 className="font-semibold">Summary</h2><p className="text-xs text-muted-foreground">What this repository is used for</p></div></div><p className="mt-5 max-w-4xl text-sm leading-7 text-muted-foreground">{summarizeReadme(analysis.readme, repoInfo.description)}</p></section>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat icon={Code2} label="Primary language" value={repoInfo.language ?? "—"} />
              <Stat icon={Files} label="Files analyzed" value={files.length.toLocaleString()} />
              <Stat icon={Users} label="Contributors" value={analysis.contributors.length.toString()} />
              <Stat icon={Package} label="Repository size" value={formatBytes(repoInfo.size * 1024)} />
            </div>
            <div className="grid gap-6 lg:grid-cols-5">
              <section className="glass-card p-6 lg:col-span-3"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Language breakdown</h2><p className="mt-1 text-xs text-muted-foreground">Based on bytes of code</p></div><Code2 className="h-5 w-5 text-brand" /></div><div className="mt-7"><LanguageBars analysis={analysis} /></div></section>
              <section className="glass-card p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Top contributors</h2><p className="mt-1 text-xs text-muted-foreground">By commit count</p></div><Users className="h-5 w-5 text-brand" /></div><div className="mt-5 space-y-3">{analysis.contributors.slice(0, 5).map((contributor) => <a key={contributor.login} href={contributor.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md p-1 transition-colors hover:bg-secondary/60"><img src={contributor.avatar_url} alt="" className="h-7 w-7 rounded-full" /><span className="flex-1 truncate text-sm">{contributor.login}</span><span className="font-mono text-xs text-muted-foreground">{contributor.contributions}</span></a>)}{analysis.contributors.length === 0 && <p className="text-sm text-muted-foreground">No contributor data available.</p>}</div></section>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="glass-card p-6"><h2 className="font-semibold">Repository signals</h2><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg bg-secondary/50 p-4"><p className="text-xs text-muted-foreground">Default branch</p><p className="mt-2 flex items-center gap-2 font-mono text-sm"><GitBranch className="h-3.5 w-3.5 text-brand" />{repoInfo.default_branch}</p></div><div className="rounded-lg bg-secondary/50 p-4"><p className="text-xs text-muted-foreground">License</p><p className="mt-2 text-sm font-medium">{repoInfo.license?.spdx_id || "Not specified"}</p></div><div className="rounded-lg bg-secondary/50 p-4"><p className="text-xs text-muted-foreground">Last push</p><p className="mt-2 text-sm font-medium">{formatRelativeDate(repoInfo.pushed_at)}</p></div><div className="rounded-lg bg-secondary/50 p-4"><p className="text-xs text-muted-foreground">Total code size</p><p className="mt-2 font-mono text-sm font-medium">{formatBytes(totalBytes)}</p></div></div></section>
              <section className="glass-card p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Quick architecture</h2><span className="text-xs text-muted-foreground">Top-level modules</span></div><div className="mt-5 space-y-2">{tree.slice(0, 7).map((node) => <div key={node.path} className="flex items-center gap-3 rounded-md bg-secondary/40 px-3 py-2.5">{node.type === "tree" ? <FolderTree className="h-4 w-4 text-brand" /> : <FileCode2 className="h-4 w-4 text-brand" />}<span className="font-mono text-xs">{node.name}</span><span className="ml-auto text-[10px] uppercase text-muted-foreground">{node.type === "tree" ? "module" : "file"}</span></div>)}</div></section>
            </div>
          </TabsContent>

          <TabsContent value="explorer"><section className="glass-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 p-5"><div><h2 className="font-semibold">File explorer</h2><p className="mt-1 text-xs text-muted-foreground">{files.length} files · {tree.length} top-level entries{analysis.truncated ? " · tree truncated by GitHub" : ""}</p></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter files..." className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-brand" /></div></div><div className="max-h-[600px] overflow-y-auto p-3">{filteredTree.map((node) => <TreeRow key={node.path} node={node} />)}</div></section></TabsContent>

          <TabsContent value="dependencies"><div className="grid gap-6 lg:grid-cols-3"><section className="glass-card p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Dependency map</h2><p className="mt-1 text-xs text-muted-foreground">Direct dependencies detected from package.json</p></div><Network className="h-5 w-5 text-brand" /></div>{packageDeps.length ? <div className="mt-5 grid gap-2 sm:grid-cols-2">{packageDeps.map(([name, version]) => <div key={name} className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/10"><Package className="h-3.5 w-3.5 text-brand" /></span><span className="flex-1 truncate font-mono text-xs">{name}</span><span className="font-mono text-[10px] text-muted-foreground">{version}</span></div>)}</div> : <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No package.json dependencies detected.</div>}</section><section className="glass-card p-6"><h2 className="font-semibold">Dependency health</h2><div className="mt-6 flex flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10"><CheckCircle2 className="h-8 w-8 text-success" /></div><p className="mt-4 font-semibold">No known issues</p><p className="mt-1 text-xs text-muted-foreground">Basic health checks pass. Deep vulnerability scanning is on the roadmap.</p></div></section></div></TabsContent>

          <TabsContent value="dependency-graph"><section className="glass-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Interactive dependency graph</h2><p className="mt-1 text-xs text-muted-foreground">Explore direct package relationships detected from package.json.</p></div><Network className="h-5 w-5 text-brand" /></div><div className="mt-5"><DependencyGraph deps={packageDeps} /></div></section></TabsContent>

          <TabsContent value="architecture"><section className="glass-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Module architecture</h2><p className="mt-1 text-xs text-muted-foreground">Top-level structure of the repository</p></div><Box className="h-5 w-5 text-brand" /></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tree.filter((node) => node.type === "tree").map((node, index) => <div key={node.path} className="relative rounded-xl border border-border/70 bg-secondary/30 p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10"><BookOpen className="h-5 w-5 text-brand" /></div><div><p className="font-mono text-sm font-semibold">{node.name}</p><p className="text-xs text-muted-foreground">{node.children.length} entries</p></div></div><div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.min(100, 20 + node.children.length * 8)}%` }} /></div><span className="mt-2 block text-[10px] uppercase tracking-wider text-muted-foreground">module {String(index + 1).padStart(2, "0")}</span></div>)}</div></section></TabsContent>

          <TabsContent value="hotspots"><section className="glass-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Code hotspots</h2><p className="mt-1 text-xs text-muted-foreground">Largest files are a useful starting point for review</p></div><Zap className="h-5 w-5 text-warning" /></div><div className="mt-6 space-y-2">{[...files].sort((a, b) => (b.size ?? 0) - (a.size ?? 0)).slice(0, 15).map((file, index) => <div key={file.path} className="flex items-center gap-4 rounded-lg border border-border/50 bg-secondary/20 px-4 py-3"><span className="w-5 font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><FileCode2 className="h-4 w-4 text-brand" /><span className="flex-1 truncate font-mono text-xs">{file.path}</span><div className="hidden w-32 overflow-hidden rounded-full bg-secondary sm:block"><div className="h-1.5 rounded-full bg-brand-gradient" style={{ width: `${Math.max(5, ((file.size ?? 0) / (files[index]?.size || 1)) * 20)}%` }} /></div><span className="w-14 text-right font-mono text-xs text-muted-foreground">{formatBytes(file.size ?? 0)}</span></div>)}</div></section></TabsContent>

          <TabsContent value="impact"><section className="glass-card p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><GitPullRequest className="h-5 w-5 text-brand" /><h2 className="font-semibold">PR impact preview</h2><Badge variant="secondary">Preview</Badge></div><p className="mt-2 max-w-xl text-sm text-muted-foreground">Paste a pull request URL to estimate which modules, dependencies, and hotspots could be affected before merging.</p></div><div className="flex w-full flex-col gap-2 sm:w-auto"><div className="flex gap-2"><input value={prInput} onChange={(event) => setPrInput(event.target.value)} placeholder="PR URL or #42" className="h-10 min-w-0 rounded-md border border-white/15 bg-white/8 px-3 text-xs outline-none backdrop-blur-xl focus:ring-2 focus:ring-brand/40 sm:w-44" /><button onClick={analyzePullRequest} disabled={prLoading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/12 px-3 py-2 text-sm font-semibold text-white backdrop-blur-xl disabled:opacity-60">{prLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitPullRequest className="h-4 w-4" />} {prLoading ? "Analyzing" : "Analyze"}</button></div>{prError && <p className="text-right text-xs text-destructive">{prError}</p>}</div></div>{prImpact && <div className="mt-6 rounded-xl border border-brand/25 bg-brand/5 p-4"><div className="flex flex-wrap items-center gap-2"><a href={prImpact.html_url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-brand">#{prImpact.number} {prImpact.title}</a><Badge variant="outline">{prImpact.state}</Badge><span className="text-xs text-muted-foreground">by {prImpact.author}</span></div><div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>{prImpact.changed_files} files</span><span className="text-success">+{prImpact.additions} additions</span><span className="text-destructive">-{prImpact.deletions} deletions</span></div><div className="mt-4 flex flex-wrap gap-1.5">{prImpact.files.slice(0, 12).map((file) => <span key={file} className="rounded-md border border-border/70 bg-card/60 px-2 py-1 font-mono text-[10px]">{file}</span>)}</div></div>}
            <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-dashed border-border bg-secondary/20 p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Files changed</p><p className="mt-3 text-2xl font-bold text-muted-foreground">—</p><p className="mt-1 text-xs text-muted-foreground">Awaiting a pull request</p></div><div className="rounded-lg border border-dashed border-border bg-secondary/20 p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Modules touched</p><p className="mt-3 text-2xl font-bold text-muted-foreground">—</p><p className="mt-1 text-xs text-muted-foreground">Dependency impact map</p></div><div className="rounded-lg border border-dashed border-border bg-secondary/20 p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Risk signal</p><p className="mt-3 text-2xl font-bold text-muted-foreground">—</p><p className="mt-1 text-xs text-muted-foreground">Complexity and hotspot delta</p></div></div></section></TabsContent>

          <TabsContent value="health"><section className="glass-card p-6"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><CheckCircle2 className="h-6 w-6 text-success" /></div><div><h2 className="font-semibold">Repository health</h2><p className="mt-1 text-sm text-muted-foreground">A quick, non-invasive check of public repository signals.</p></div></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg border border-success/20 bg-success/5 p-4"><CheckCircle2 className="h-4 w-4 text-success" /><p className="mt-3 text-sm font-medium">Publicly accessible</p><p className="mt-1 text-xs text-muted-foreground">GitHub metadata available</p></div><div className="rounded-lg border border-success/20 bg-success/5 p-4"><CheckCircle2 className="h-4 w-4 text-success" /><p className="mt-3 text-sm font-medium">Manifest detected</p><p className="mt-1 text-xs text-muted-foreground">{analysis.packageJson ? "package.json parsed" : "No JS manifest found"}</p></div><div className="rounded-lg border border-border bg-secondary/20 p-4"><CircleDot className="h-4 w-4 text-brand" /><p className="mt-3 text-sm font-medium">Issues open</p><p className="mt-1 text-xs text-muted-foreground">{repoInfo.open_issues_count} currently tracked</p></div><div className="rounded-lg border border-border bg-secondary/20 p-4"><Clock3 className="h-4 w-4 text-brand" /><p className="mt-3 text-sm font-medium">Recently updated</p><p className="mt-1 text-xs text-muted-foreground">Pushed {formatRelativeDate(repoInfo.pushed_at)}</p></div></div></section></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
