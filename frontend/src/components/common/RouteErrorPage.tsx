import { Link, useRouteError } from "react-router-dom";

/** Friendly fallback for route loading failures (including interrupted lazy imports). */
export function RouteErrorPage() {
  const error = useRouteError();
  const isModuleLoadFailure =
    error instanceof Error &&
    /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk/i.test(error.message);

  return (
    <main className="container container--narrow notfound">
      <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>
        {isModuleLoadFailure ? "This page could not finish loading" : "Something went wrong"}
      </h1>
      <p className="text-muted">
        {isModuleLoadFailure
          ? "The connection may have been interrupted, or the website was just updated. Reloading usually fixes this."
          : "We could not display this page. Please try reloading it."}
      </p>
      <div className="row" style={{ justifyContent: "center", marginTop: 20 }}>
        <button type="button" className="btn" onClick={() => window.location.reload()}>
          Reload page
        </button>
        <Link to="/" className="btn btn--outline" reloadDocument>
          Go to home page
        </Link>
      </div>
    </main>
  );
}
