import { Link } from "react-router-dom";
import { RepoLensMark } from "./SiteHeader";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-background/30 backdrop-blur-2xl">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <RepoLensMark compact />
          <span className="text-sm font-semibold">RepoLens</span>
          <span className="text-sm text-muted-foreground">
            — understand any repo in under 60 seconds.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link
            to="/roadmap"
            className="transition-colors hover:text-foreground"
          >
            Roadmap
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
