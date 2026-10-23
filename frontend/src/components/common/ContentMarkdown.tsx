import { useMemo, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Marked } from "marked";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const marked = new Marked({ gfm: true, breaks: false });
marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      return `<h${depth} id="${slugify(text)}">${text}</h${depth}>\n`;
    },
    table(token) {
      // Wrap tables so they scroll horizontally on small screens.
      const header = token.header.map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`).join("");
      const rows = token.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join("")}</tr>`)
        .join("");
      return `<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      if (!href) return text;
      const external = /^https?:\/\//.test(href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${href}"${title ? ` title="${title}"` : ""}${attrs}>${text}</a>`;
    },
  },
});

const markdownToHtml = (markdown: string) => marked.parse(markdown, { async: false }) as string;

/**
 * Renders the Province's own (trusted) markdown content. Internal links are
 * routed client-side so navigation stays instant.
 */
export function ContentMarkdown({ markdown, className = "prose" }: { markdown: string; className?: string }) {
  const navigate = useNavigate();
  const html = useMemo(() => markdownToHtml(markdown), [markdown]);

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest("a");
    const href = anchor?.getAttribute("href");
    if (!anchor || !href || anchor.target === "_blank" || event.metaKey || event.ctrlKey) return;
    if (href.startsWith("/") && !href.startsWith("//") && !/\.(pdf|jpe?g|png|webp)$/i.test(href)) {
      event.preventDefault();
      navigate(href);
    }
  };

  return <div className={className} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
