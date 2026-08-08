import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  ExternalLink,
  GitFork,
  Globe,
  Loader2,
  MapPin,
  Search,
  Star,
  User,
  Users,
  XCircle,
} from "lucide-react";
import {
  fetchUserProfile,
  fetchUserRepos,
  formatCompactNumber,
  formatRelativeDate,
  GithubApiError,
  type RepoInfo,
  type UserProfile,
} from "@/lib/github";
import { Badge } from "@/components/ui/badge";

export default function UserDashboard() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name">("updated");
  const [languageFilter, setLanguageFilter] = useState<string>("all");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);

    Promise.all([fetchUserProfile(username), fetchUserRepos(username)])
      .then(([userProfile, userRepos]) => {
        setProfile(userProfile);
        setRepos(userRepos);
      })
      .catch((err) => {
        if (err instanceof GithubApiError) {
          setError(err.message);
        } else {
          setError("Failed to load user information.");
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  const languages = Array.from(
    new Set(repos.map((r) => r.language).filter((l): l is string => Boolean(l)))
  );

  const filteredRepos = repos
    .filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesLanguage = languageFilter === "all" || repo.language === languageFilter;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });

  if (loading) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="mt-4 text-sm text-muted-foreground">Fetching public repositories for @{username}...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center backdrop-blur-xl">
          <XCircle className="mx-auto h-10 w-10 text-destructive" />
          <h2 className="mt-4 text-lg font-bold">User Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error || "Could not retrieve user details."}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 sm:py-16">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* User Header Profile */}
      <div className="mt-6 flex flex-col gap-6 rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <img
            src={profile.avatar_url}
            alt={profile.login}
            className="h-20 w-20 rounded-2xl border border-brand/40 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight">
                {profile.name || profile.login}
              </h1>
              <span className="font-mono text-sm text-muted-foreground">@{profile.login}</span>
            </div>
            {profile.bio && <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{profile.bio}</p>}

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {profile.company && (
                <span className="inline-flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-brand" /> {profile.company}
                </span>
              )}
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brand" /> {profile.location}
                </span>
              )}
              {profile.blog && (
                <a
                  href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                >
                  <Globe className="h-3.5 w-3.5 text-brand" /> {profile.blog}
                </a>
              )}
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-brand" /> {formatCompactNumber(profile.followers)} followers
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-brand" /> {profile.public_repos} public repos
              </span>
            </div>
          </div>
        </div>

        <a
          href={profile.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold transition-colors hover:bg-white/20"
        >
          View on GitHub
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Repositories Controls Header */}
      <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Repositories <Badge className="ml-2 font-mono text-xs">{filteredRepos.length}</Badge>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Select any repository to run full RepoLens analysis</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user repos..."
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "updated" | "stars" | "name")}
            className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="updated">Recently Updated</option>
            <option value="stars">Most Stars</option>
            <option value="name">Repository Name</option>
          </select>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRepos.map((repo) => (
          <div
            key={repo.full_name}
            className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card/60 p-5 transition-all hover:border-brand/50 hover:bg-card/90 hover:shadow-xl"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/r/${repo.owner.login}/${repo.name}`}
                  className="font-mono text-sm font-semibold tracking-tight transition-colors hover:text-brand"
                >
                  {repo.name}
                </Link>
                {repo.language && (
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {repo.language}
                  </Badge>
                )}
              </div>

              <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
                {repo.description || "No description provided."}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-warning" /> {formatCompactNumber(repo.stargazers_count)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5" /> {formatCompactNumber(repo.forks_count)}
                </span>
              </div>

              <Link
                to={`/r/${repo.owner.login}/${repo.name}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                Analyze
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
          <Search className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No repositories found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No public repositories match your current search/filter parameters.
          </p>
        </div>
      )}
    </div>
  );
}
