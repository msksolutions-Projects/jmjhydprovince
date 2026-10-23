#!/usr/bin/env python3
"""Read-only extraction of public institution-page bodies from the JMJ website.

The source website has unrelated injected material. Never use the homepage body
or untrusted page HTML as frontend HTML: this tool extracts text/tables from
institution-specific `.entry-content` containers and produces plain Markdown.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from lxml import html


BASE = "https://jmjhyderabadprovince.org"
PROJECT = Path(__file__).resolve().parent.parent
OUT = PROJECT / "src" / "data" / "institutionProfilesExtracted.json"
REPORT = PROJECT / "INSTITUTIONS_SOURCE_AUDIT.md"
INSTITUTIONS = json.loads((PROJECT / "src" / "data" / "institutions.json").read_text())

# Source slugs deliberately associated with the 32 current directory records.
# The old menu has additional establishments that are not individually listed
# among the 32; they remain in `extraSourcePages` for a subsequent decision.
ID_TO_SLUG = {
    "1": "jmj-achampet", "2": "jmj-ayyalurimetta", "3": "jmj-convent-bhopal",
    "4": "st-josephs-high-school-gajwel", "5": "jmj-gyaraspur",
    "6": "st-theresas-girls-high-school-sanathnagar",
    "7": "st-theresas-hospital-sanathnagar", "8": "page_id=2177",
    "9": "st-theresas-t-l-c-home-sanathnagar",
    "10": "jmj-shanthinilayam-sanathnagar", "11": "jmj-jyothinilayam-somajiguda",
    "12": "jmj-nilayam-jagadgirigutta", "13": "jmj-convent-krishnapuram",
    "14": "jmj-convent-katra", "15": "st-josephs-english-medium-school-koilkuntla",
    "17": "jmjem-school-kurnool1", "18": "st-josephs-b-ed-d-ed-college",
    "19": "st-theresas-general-hospital-gosha-kurnool",
    "20": "st-josephs-boarding-for-girls-kurnool-1",
    "21": "jmj-institutions-kurnool-2", "22": "shanthi-nikethan-kurnool-3",
    "23": "jmj-e-m-school-madapuram", "24": "jmj-e-m-school-manoharabad",
    "25": "jmj-sneha-sadan-orphanage-miyapur",
    "26": "jmj-shanthi-sadan-miyapur",
    "27": "st-josephs-high-school-nagarjuna-sagar",
    "28": "page_id=2163", "29": "jmj-physically-rehabilitation-centre-pedda-kottala",
    "30": "jmj-institutions-pedda-pendial",
    "31": "st-theresas-hospital-shamshabad", "32": "page_id=2224",
}


def fetch(url: str) -> bytes:
    if urlparse(url).netloc != "jmjhyderabadprovince.org":
        raise ValueError("Source host is not permitted")
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; JMJ Province Content Audit/1.0)"})
    with urlopen(request, timeout=30) as response:
        return response.read()


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def page_url_key(url: str) -> str:
    parsed = urlparse(url)
    return parsed.query if parsed.query.startswith("page_id=") else parsed.path.strip("/")


def organization_menu(home: html.HtmlElement) -> list[dict[str, str]]:
    anchors = home.xpath("//a[@href]")
    start = next(i for i, a in enumerate(anchors) if page_url_key(a.get("href", "")) == "jmj-achampet")
    end = next(i for i, a in enumerate(anchors[start + 1 :], start + 1) if clean(a.text_content()) == "Administration")
    result = []
    for a in anchors[start:end]:
        url = a.get("href", "")
        if not url.startswith(BASE + "/"):
            continue
        label = clean(a.text_content())
        result.append({"label": label, "url": url, "key": page_url_key(url)})
    # The old site includes distinct institutions under the same broader house.
    # Preserve every page exactly once, even if it is not one of the 32 records.
    return list({page["key"]: page for page in result}.values())


def markdown_from_content(container: html.HtmlElement) -> tuple[str, list[str]]:
    # Only parse content containers, never the menu, footer or script payloads.
    for bad in container.xpath(".//script|.//style|.//iframe|.//form|.//noscript"):
        bad.drop_tree()
    parts: list[str] = []
    urls: list[str] = []
    for el in container.iter():
        tag = el.tag.lower() if isinstance(el.tag, str) else ""
        if tag == "img":
            src = el.get("data-src") or el.get("src") or ""
            if src.startswith(BASE + "/wp-content/uploads/") and src not in urls:
                urls.append(src)
            continue
        if tag not in {"h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "table"}:
            continue
        if tag != "table" and el.xpath("ancestor::table"):
            continue
        if tag == "p" and el.xpath("ancestor::li"):
            continue
        if tag == "table":
            rows = []
            for row in el.xpath(".//tr"):
                cells = [clean(c.text_content()).replace("|", "\\|") for c in row.xpath("./th|./td")]
                if cells and any(cells):
                    rows.append(cells)
            if rows:
                width = max(map(len, rows))
                rows = [r + [""] * (width - len(r)) for r in rows]
                table_lines = ["| " + " | ".join(rows[0]) + " |"]
                table_lines.append("| " + " | ".join("---" for _ in range(width)) + " |")
                table_lines.extend("| " + " | ".join(r) + " |" for r in rows[1:])
                parts.append("\n".join(table_lines))
            continue
        value = clean(el.text_content())
        if not value:
            continue
        if re.fullmatch(r"h[1-6]", tag):
            level = min(int(tag[1]) + 1, 5)
            parts.append("#" * level + " " + value)
        elif tag == "li":
            parts.append("- " + value)
        else:
            parts.append(value)
    # Deduplicate consecutive visual copies often caused by nested WP markup.
    distinct: list[str] = []
    for part in parts:
        if not distinct or distinct[-1] != part:
            distinct.append(part)
    return "\n\n".join(distinct).strip(), urls


def main() -> int:
    home = html.fromstring(fetch(BASE + "/jmj-achampet/"))
    source_pages = organization_menu(home)
    print(f"Found {len(source_pages)} institution-related menu links", flush=True)
    if len(source_pages) < 32:
        raise RuntimeError("Too few official source pages; refusing incomplete extraction")

    pages: dict[str, dict] = {}
    for i, page in enumerate(source_pages, 1):
        try:
            doc = html.fromstring(fetch(page["url"]))
            containers = doc.xpath('//*[contains(concat(" ", normalize-space(@class), " "), " entry-content ")]')
            if not containers:
                raise ValueError("No page-content container found")
            markdown, images = markdown_from_content(containers[0])
            if not markdown:
                raise ValueError("Institution page contains no extracted text")
            pages[page["key"]] = {**page, "markdown": markdown, "imageUrls": images, "status": "extracted"}
            print(f"{i:02}/{len(source_pages)} {page['key']}: {len(markdown)} chars", flush=True)
        except Exception as exc:
            pages[page["key"]] = {**page, "markdown": "", "imageUrls": [], "status": "unavailable", "error": str(exc)}
            print(f"{i:02}/{len(source_pages)} {page['key']}: ERROR {exc}", flush=True)

    records: dict[str, dict] = {}
    for institution in INSTITUTIONS:
        institution_id = institution["id"]
        key = ID_TO_SLUG.get(institution_id)
        if not key:
            records[institution_id] = {"status": "no_matching_dedicated_page", "sourceUrl": None, "markdown": "", "imageUrls": []}
        else:
            source = pages.get(key)
            if not source:
                records[institution_id] = {"status": "source_not_in_menu", "sourceUrl": None, "markdown": "", "imageUrls": []}
            else:
                records[institution_id] = {"status": source["status"], "sourceUrl": source["url"], "markdown": source["markdown"], "imageUrls": source["imageUrls"]}

    mapped_keys = set(ID_TO_SLUG.values())
    extras = [page for key, page in pages.items() if key not in mapped_keys]
    data = {
        "source": BASE,
        "note": "Extracted only public institution body text; untrusted scripts, navigation and spam were excluded. Historical figures may not reflect present-day enrollment.",
        "directoryRecords": len(INSTITUTIONS),
        "sourcePageCount": len(source_pages),
        "profiles": records,
        "extraSourcePages": extras,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    successes = sum(item["status"] == "extracted" for item in records.values())
    lines = [
        "# JMJ Hyderabad Province — institution source audit",
        "",
        "Extracted from the institution pages in the source site's Organizations menu.",
        "The source site's unrelated spam, scripts and navigation were deliberately excluded.",
        "",
        f"- Current frontend directory records: **{len(INSTITUTIONS)}**",
        f"- Source menu institution-related pages: **{len(source_pages)}**",
        f"- Directory records with extracted dedicated pages: **{successes}**",
        "",
        "| ID | Directory record | Extraction | Official source |",
        "| --- | --- | --- | --- |",
    ]
    for institution in INSTITUTIONS:
        p = records[institution["id"]]
        lines.append(f"| {institution['id']} | {institution['institution'].replace('|', '/')} | {p['status']} | {p['sourceUrl'] or '—'} |")
    lines += ["", "## Additional source pages not represented as separate directory records", ""]
    lines += [f"- [{p['label']}]({p['url']}) — {p['status']}" for p in extras]
    lines += ["", "## Important", "", "The original source content may include out-of-date student numbers or historic dates. These remain attributed to the original pages rather than being presented as current statistics."]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Completed {successes}/{len(INSTITUTIONS)} matched pages; {len(extras)} extra source pages; audit: {REPORT}")
    return 0 if successes >= 30 else 1


if __name__ == "__main__":
    sys.exit(main())
