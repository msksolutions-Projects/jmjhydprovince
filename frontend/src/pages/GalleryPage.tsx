import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Seo } from "@/components/seo/Seo";
import { Icon } from "@/components/ui/Icon";
import { fetchGallery, UPLOADS_ID, type GalleryImage } from "@/features/gallery/gallery.service";

const PAGE_SIZE = 48;

function Lightbox({
  image,
  position,
  total,
  onClose,
  onStep,
}: {
  image: GalleryImage;
  position: number;
  total: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.classList.add("no-scroll");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
      previous?.focus();
    };
  }, [onClose, onStep]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photograph viewer"
      onClick={(event) => event.target === event.currentTarget && onClose()}
      onTouchStart={(event) => (touchX.current = event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const dx = (event.changedTouches[0]?.clientX ?? 0) - touchX.current;
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <img src={image.src} alt={image.alt} />
      <button ref={closeRef} type="button" className="lightbox__btn lightbox__close" onClick={onClose} aria-label="Close viewer">
        <Icon name="close" />
      </button>
      <button type="button" className="lightbox__btn lightbox__prev" onClick={() => onStep(-1)} aria-label="Previous photograph">
        <Icon name="chevronLeft" />
      </button>
      <button type="button" className="lightbox__btn lightbox__next" onClick={() => onStep(1)} aria-label="Next photograph">
        <Icon name="chevronRight" />
      </button>
      <div className="lightbox__caption">
        {image.categoryLabel} · {position} of {total}
      </div>
    </div>
  );
}

export function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "all";
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["gallery"],
    queryFn: ({ signal }) => fetchGallery(signal),
    staleTime: Infinity,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = query.trim().toLowerCase();
    return data.images.filter(
      (image) =>
        (category === "all" || image.category === category || (category === UPLOADS_ID && image.isUpload)) &&
        (!term || `${image.title} ${image.categoryLabel}`.toLowerCase().includes(term)),
    );
  }, [data, category, query]);

  const visible = filtered.slice(0, limit);
  const active = activeIndex === null ? null : (filtered[activeIndex] ?? null);

  const step = useCallback(
    (delta: number) =>
      setActiveIndex((current) =>
        current === null || filtered.length === 0 ? current : (current + delta + filtered.length) % filtered.length,
      ),
    [filtered.length],
  );
  const close = useCallback(() => setActiveIndex(null), []);

  // Preload neighbours so the viewer feels instant.
  useEffect(() => {
    if (activeIndex === null) return;
    [1, -1].forEach((d) => {
      const next = filtered[(activeIndex + d + filtered.length) % filtered.length];
      if (next) new Image().src = next.src;
    });
  }, [activeIndex, filtered]);

  const choose = (id: string) => {
    setSearchParams(id === "all" ? {} : { category: id }, { replace: true });
    setLimit(PAGE_SIZE);
  };

  return (
    <>
      <Seo
        title="Photo Gallery"
        description="The JMJ Hyderabad Province photo gallery, organized into 12 collections spanning formation, profession, gatherings and community life."
        path="/gallery"
      />
      <PageHeader
        eyebrow="Media"
        title="Photo Gallery"
        description="Twelve collections of Province photographs, from formation and profession to celebrations, meetings and youth gatherings."
        breadcrumbs={[{ label: "Media", href: "/news" }]}
      />

      <PageShell sidebar={false}>
        {isPending && (
          <div aria-busy="true" aria-label="Loading photographs">
            <div className="photo-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: "4 / 3" }} />
              ))}
            </div>
          </div>
        )}

        {isError && (
          <ErrorState title="The gallery did not load" message={(error as Error).message} onRetry={() => void refetch()} />
        )}

        {data && (
          <>
            <div className="filter-chips" role="group" aria-label="Albums">
              <button type="button" className="filter-chip" aria-pressed={category === "all"} onClick={() => choose("all")}>
                All ({data.images.length})
              </button>
              {data.categories
                .filter((item) => item.count > 0)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="filter-chip"
                    aria-pressed={category === item.id}
                    onClick={() => choose(item.id)}
                  >
                    {item.label} ({item.count})
                  </button>
                ))}
            </div>

            <div className="row row--between" style={{ marginBottom: 16 }}>
              <div className="input-icon" style={{ flex: "1 1 260px", maxWidth: 420 }}>
                <Icon name="search" />
                <input
                  className="input"
                  type="search"
                  aria-label="Search photographs"
                  placeholder="Search photographs"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setLimit(PAGE_SIZE);
                  }}
                />
              </div>
              <p className="status-line" role="status" aria-live="polite" style={{ margin: 0 }}>
                {filtered.length} {filtered.length === 1 ? "photograph" : "photographs"}
              </p>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="image"
                title="No photographs match that search"
                description="Try a different album, or clear the search to see the whole archive."
                action={
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => {
                      setQuery("");
                      choose("all");
                    }}
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <>
                <ul className="reset-list photo-grid">
                  {visible.map((image, index) => (
                    <li key={image.id}>
                      <button type="button" aria-label={`View photograph ${index + 1}`} onClick={() => setActiveIndex(index)}>
                        <img src={image.thumbnail} alt={image.alt} loading="lazy" decoding="async" width={500} height={375} />
                      </button>
                    </li>
                  ))}
                </ul>
                {limit < filtered.length && (
                  <div className="text-center" style={{ marginTop: 28 }}>
                    <button type="button" className="btn btn--outline" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
                      Load more photographs ({filtered.length - limit} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </PageShell>

      {active && activeIndex !== null && (
        <Lightbox image={active} position={activeIndex + 1} total={filtered.length} onClose={close} onStep={step} />
      )}
    </>
  );
}
