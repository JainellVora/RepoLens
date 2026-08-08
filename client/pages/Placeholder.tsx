import { Link } from "react-router-dom";
import { Construction } from "lucide-react";

export default function Placeholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
        <Construction className="h-6 w-6 text-brand" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {description ??
          "This page hasn't been built yet. Keep prompting to describe what you'd like here, and it'll come to life."}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-md bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03]"
      >
        Back to home
      </Link>
    </div>
  );
}
