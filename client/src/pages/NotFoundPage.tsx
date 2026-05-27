import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in">
      <p className="text-7xl font-extrabold bg-linear-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-text-primary">Page Not Found</h1>
      <p className="mt-2 text-text-secondary">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 flex items-center gap-2 rounded-lg bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-blue-hover hover:shadow-lg hover:shadow-accent-blue/25"
      >
        <Home className="h-4 w-4" />
        Go Home
      </Link>
    </div>
  );
}
