export function RouteLoader() {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="text-center">
        <div className="spinner" style={{ margin: "0 auto" }} />
        <p className="text-muted small" style={{ marginTop: 12 }}>
          Loading…
        </p>
      </div>
    </div>
  );
}
