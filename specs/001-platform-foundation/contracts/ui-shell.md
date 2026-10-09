# Contract: Portal Shell (DOM)

Every page renders this structure. Tests select elements by role or by `data-spec`.

```text
<html lang="en|nl" style="color-scheme: light dark">
  <head>
    <title>…</title>                                     FR-006
    <meta name="description" content="…">               FR-006
    <link rel="canonical" href="…">                      FR-009
    <link rel="alternate" hreflang="en|nl|x-default">    FR-009
    <meta property="og:title|og:description|og:type|og:url|og:locale|og:locale:alternate">
  </head>
  <body>
    <a href="#main" data-spec="001:FR-003">Skip to content</a>
    <header data-spec="001:FR-002">
      site identity (link to home in current language)
      <nav aria-label="Language" data-spec="001:FR-008">
        <a hreflang="en" lang="en" [aria-current="true"]>EN</a>
        <a hreflang="nl" lang="nl" [aria-current="true"]>NL</a>
      </nav>
    </header>
    <nav aria-label="Primary|Hoofdmenu" data-spec="001:FR-004">
      <a [aria-current="page"]><span>term</span><span>subtitle</span></a> …
    </nav>
    <main id="main" tabindex="-1" data-spec="001:FR-002"> … </main>
    <footer data-spec="001:FR-012">
      <a href="…/commit/<sha>">build <shortSha></a>
      <a href="…/sammieetje.github.io">source</a>
      <a href="…/tree/main/specs">specs</a>
    </footer>
  </body>
</html>
```

Home page `<main>` content (FR-001), marked `data-spec="001:FR-001"`:

- `<h1>` with the name.
- Role line: current role, then positioning.
- Headline statement.
- Link to LinkedIn with accessible name including "LinkedIn".

404 page `<main>` (FR-011), marked `data-spec="001:FR-011"`: an English and a Dutch section,
each with its own `lang` attribute, each linking to both home pages.

Behavioural guarantees:

- No `<script>` elements are emitted in this feature.
- No element references another origin as a resource (`src`, `href` on `link rel=stylesheet|preload|icon`).
  Navigational `<a href>` to other origins is allowed (LinkedIn, GitHub).
