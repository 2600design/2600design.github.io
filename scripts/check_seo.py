#!/usr/bin/env python3
"""Check the static site's indexable pages, metadata, schema and local links.

Run from any directory: python3 scripts/check_seo.py
No packages or network access required. Canonical pages come from sitemap.xml.
"""
from collections import Counter
from datetime import date
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.2600design.com.au"
errors = []


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.ids = []
        self.h1s = 0
        self.mains = 0
        self.feed(source)
        self.titles = [unescape(s) for s in re.findall(r"<title>(.*?)</title>", source, re.S)]
        self.schemas = [json.loads(s) for s in re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', source, re.S)]

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        self.h1s += tag == "h1"
        self.mains += tag == "main"

    def meta(self, key):
        return [a.get("content", "") for t, a in self.tags
                if t == "meta" and (a.get("name") == key or a.get("property") == key)]

    def canonical(self):
        return [a.get("href") for t, a in self.tags
                if t == "link" and a.get("rel") == "canonical"]


def check(condition, where, message):
    if not condition:
        errors.append(f"{where}: {message}")


def local_file(path):
    candidate = ROOT / unquote(path).lstrip("/")
    if candidate.is_dir():
        return candidate / "index.html"
    if candidate.is_file():
        return candidate
    if not candidate.suffix:
        return candidate.with_suffix(".html")
    return candidate


def local_url(url):
    parts = urlsplit(url)
    return parts.netloc in ("", "www.2600design.com.au", "2600design.com.au") and parts.scheme in ("", "https", "http")


def check_css(source, source_url, where):
    for match in re.finditer(r'''url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)''', source):
        value = next(v for v in match.groups() if v is not None)
        if not value.startswith(("data:", "#")):
            target = urljoin(source_url, value)
            if local_url(target):
                check(local_file(urlsplit(target).path).exists(), where, f"missing CSS image {value}")


def main():
    sitemap = ET.parse(ROOT / "sitemap.xml")
    urls = [n.text for n in sitemap.findall(
        "{http://www.sitemaps.org/schemas/sitemap/0.9}url/"
        "{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    plan = json.loads((ROOT / "_seo/page-search-map.json").read_text())
    planned = {BASE + row["path"]: row for row in plan}
    check(set(planned) == set(urls), "search map", "page plan and sitemap differ")
    check(len(urls) == len(set(urls)), "sitemap", "duplicate URLs")
    check(len(urls) == 16, "sitemap", "expected all sixteen public content pages")
    check(f"Sitemap: {BASE}/sitemap.xml" in (ROOT / "robots.txt").read_text(), "robots", "wrong sitemap host")
    check((ROOT / "CNAME").read_text().strip() == urlsplit(BASE).netloc, "CNAME", "canonical host differs from Pages host")
    titles, descriptions, pages = [], [], {}
    for url in urls:
        check(url.startswith(BASE + "/"), url, "non-preferred host or protocol")
        f = local_file(urlsplit(url).path)
        check(f.exists(), url, "sitemap target does not exist")
        if not f.exists():
            continue
        source = f.read_text()
        try:
            page = Page(source)
        except (ValueError, json.JSONDecodeError) as exc:
            errors.append(f"{url}: invalid JSON-LD: {exc}")
            continue
        pages[url] = page
        check(page.canonical() == [url], url, "canonical must equal the sitemap URL")
        check(len(page.titles) == 1 and bool(page.titles[0]), url, "expected one nonempty title")
        check(len(page.meta("description")) == 1 and bool(page.meta("description")[0]), url, "expected one nonempty description")
        check(page.h1s == 1, url, "expected exactly one H1")
        check(page.mains == 1, url, "expected exactly one main landmark")
        check(not any("noindex" in v for v in page.meta("robots")), url, "canonical page has noindex")
        check(any(t == "html" and a.get("lang") == "en-AU" for t, a in page.tags), url, "missing Australian English language")
        check(page.meta("og:url") == [url], url, "OG URL differs from canonical")
        check(len(page.ids) == len(set(page.ids)), url, "duplicate HTML IDs")
        if page.titles:
            titles.extend(page.titles)
            check(page.meta("og:title") == page.titles == page.meta("twitter:title"), url, "social titles differ")
            check(page.titles == [planned.get(url, {}).get("title")], url, "title differs from page search plan")
        check(page.meta("description") == [planned.get(url, {}).get("description")], url, "description differs from page search plan")
        check(len(page.meta("viewport")) == 1 and "width=device-width" in page.meta("viewport")[0], url, "missing responsive viewport")
        descriptions.extend(page.meta("description"))
        check(page.meta("og:description") == page.meta("description") == page.meta("twitter:description"), url, "social descriptions differ")
        for key in ("og:image", "twitter:image"):
            values = page.meta(key)
            check(len(values) == 1 and values[0].startswith(BASE + "/"), url, f"missing absolute {key}")
            for value in values:
                image = local_file(urlsplit(value).path)
                check(image.exists(), url, f"missing social image {image.name}")
                check(image.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"), url, "social image should be a raster format")
                if image.exists():
                    check(image.stat().st_size < 5_000_000, url, "social image exceeds 5 MB")
        check(bool(page.meta("og:image:alt")) and bool(page.meta("twitter:image:alt")), url, "missing social image alt text")
        graph = page.schemas[0].get("@graph", []) if len(page.schemas) == 1 else []
        check(bool(graph), url, "expected a static JSON-LD graph")
        nodes = {n.get("@id"): n for n in graph}
        check(len(nodes) == len(graph), url, "duplicate schema entity IDs")
        check(url + "#webpage" in nodes, url, "missing WebPage entity")
        check(BASE + "/#organization" in nodes and BASE + "/#website" in nodes, url, "missing studio or website entity")
        web = nodes.get(url + "#webpage", {})
        check(web.get("name") == (page.titles[0] if page.titles else None), url, "schema page title differs from HTML")
        check(web.get("description") in page.meta("description"), url, "schema description differs from HTML")
        check(BASE + "/#flora" in nodes, url, "missing designer entity")
        check(nodes.get(BASE + "/#organization", {}).get("founder") == {"@id": BASE + "/#flora"}, url, "studio founder reference differs")
        if url == BASE + "/about.html":
            alumni = nodes.get(BASE + "/#flora", {}).get("alumniOf", [])
            check({n.get("name") for n in alumni} == {"Macquarie University", "University of Technology Sydney"}, url, "designer education differs from confirmed background")
        for node in graph:
            if node.get("@type") == "CreativeWork":
                check(node.get("mainEntityOfPage") == {"@id": url + "#webpage"}, url, "case study lacks its page reference")
                check(bool(node.get("image")) and local_file(urlsplit(node.get("image", "")).path).exists(), url, "case study image is missing")
            if node.get("@type") == "ItemList":
                links = {urljoin(url, a.get("href", "")) for t, a in page.tags if t == "a"}
                for item in node.get("itemListElement", []):
                    check(item.get("url") in links, url, "schema lists a project that is not linked on the page")
        if url != BASE + "/":
            crumb = nodes.get(url + "#breadcrumb", {})
            items = crumb.get("itemListElement", [])
            check(bool(items) and items[-1].get("item") == url, url, "invalid breadcrumb endpoint")
        for tag, attrs in page.tags:
            if tag == "img":
                check("alt" in attrs, url, "image lacks alt text")
                if not attrs.get("src", "").endswith(".svg"):
                    check("width" in attrs and "height" in attrs, url, "raster image lacks intrinsic dimensions")
            for attr in ("href", "src", "poster"):
                value = attrs.get(attr, "")
                if not value or value.startswith(("data:", "mailto:", "tel:")):
                    continue
                target = urljoin(url, value)
                if not local_url(target):
                    continue
                parts = urlsplit(target)
                check(parts.netloc == urlsplit(BASE).netloc, url, f"non-canonical internal host {target}")
                linked = local_file(parts.path)
                check(linked.exists(), url, f"broken {attr}: {value}")
                if parts.fragment and linked.exists() and linked.suffix == ".html":
                    target_page = Page(linked.read_text())
                    check(unquote(parts.fragment) in target_page.ids, url, f"broken fragment: {value}")
            for ref in attrs.get("aria-labelledby", "").split():
                check(ref in page.ids, url, f"missing aria-labelledby target {ref}")
        check("data:image/jpeg;base64," not in source, url, "embedded raster background duplicates HTML payload")
        check_css(source, url, url)
        for t, attrs in page.tags:
            if t == "link" and attrs.get("rel") == "stylesheet" and local_url(attrs.get("href", "")):
                target = urljoin(url, attrs["href"])
                css = local_file(urlsplit(target).path)
                if css.exists():
                    check_css(css.read_text(), target, css.name)
            if t == "img" and attrs.get("srcset"):
                for candidate in attrs["srcset"].split(","):
                    value = candidate.strip().split()[0]
                    check(local_file(urlsplit(urljoin(url, value)).path).exists(), url, f"missing responsive image {value}")
    # A valid sitemap must also describe real image assets and modification dates.
    sns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    ins = "{http://www.google.com/schemas/sitemap-image/1.1}"
    for entry in sitemap.findall(sns + "url"):
        url = entry.findtext(sns + "loc")
        try:
            date.fromisoformat(entry.findtext(sns + "lastmod", ""))
        except ValueError:
            errors.append(f"{url}: sitemap lastmod must be a real ISO date")
        for image in entry.findall(ins + "image/" + ins + "loc"):
            check(image.text.startswith(BASE + "/") and local_file(urlsplit(image.text).path).exists(), url, "sitemap references a missing image")
    # Every page must be reachable from the homepage through ordinary HTML links.
    reachable, pending = set(), [BASE + "/"]
    while pending:
        current = pending.pop()
        if current in reachable:
            continue
        reachable.add(current)
        for tag, attrs in pages[current].tags:
            if tag == "a":
                target = urlsplit(urljoin(current, attrs.get("href", "")))
                clean = target._replace(query="", fragment="").geturl()
                if clean in pages and clean not in reachable:
                    pending.append(clean)
    check(reachable == set(pages), "internal links", "one or more canonical pages are unreachable from the homepage")
    canonical_files = {local_file(urlsplit(url).path).resolve() for url in urls}
    for candidate in ROOT.rglob("*.html"):
        relative = candidate.relative_to(ROOT)
        if any(part.startswith(".") or part == "node_modules" for part in relative.parts):
            continue
        if candidate.resolve() in canonical_files:
            continue
        source = candidate.read_text()
        if "<html" not in source.lower():
            continue
        other = Page(source)
        is_alias = other.canonical() and other.canonical()[0] in urls and any(
            t == "meta" and a.get("http-equiv", "").lower() == "refresh" for t, a in other.tags)
        check(is_alias or any("noindex" in value for value in other.meta("robots")), str(relative), "preview or obsolete page could be indexed")
    for css in (ROOT / "v2-bg.css", ROOT / "shared-footer.css", ROOT / "projects/project-pages.css"):
        check_css(css.read_text(), BASE + "/" + str(css.relative_to(ROOT)), css.name)
    widget = (ROOT / "chat-widget.js").read_text()
    for href in re.findall(r'''href=["']([^"']+)["']''', widget):
        if local_url(href):
            check(href.startswith("/"), "chat-widget.js", "internal links must work from nested project pages")
            check(local_file(urlsplit(href).path).exists(), "chat-widget.js", f"broken link: {href}")
    for label, values in (("titles", titles), ("descriptions", descriptions)):
        check(all(n == 1 for n in Counter(values).values()), label, "canonical pages have duplicate metadata")
    alias = Page((ROOT / "shopify-websites/index.html").read_text())
    check(alias.canonical() == [BASE + "/shopify-websites.html"], "Shopify alias", "wrong redirect canonical")
    check(any(t == "meta" and a.get("http-equiv") == "refresh" and a.get("content") == "0;url=/shopify-websites.html" for t, a in alias.tags), "Shopify alias", "missing immediate redirect")
    check("noindex" in Page((ROOT / "404.html").read_text()).meta("robots")[0], "404", "error page should be noindex")
    if errors:
        print("SEO checks failed:")
        print("\n".join("- " + error for error in errors))
        return 1
    print(f"PASS: {len(pages)} reachable canonical pages; search plan; unique metadata; entity/schema consistency; social and responsive images; sitemap dates/images; internal links, fragments and linked CSS assets; Shopify alias; 404.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
