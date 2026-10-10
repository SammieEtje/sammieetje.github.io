# Contract: TechDocs page (DOM)

```text
<main>
  <header> <h1>TechDocs</h1> <p>intro</p> </header>
  <section id="pillar-people" data-spec="006:FR-002"> <h2>The wrong image of people</h2> <p>intro</p>
    <ol data-spec="006:FR-003">
      <li data-article="intake-form" data-spec="006:FR-004">
        <article>
          <h3><a href="https://www.linkedin.com/pulse/…" lang="en" data-spec="006:FR-005">Title<span class="visually-hidden"> (on LinkedIn)</span></a></h3>
          <p class="meta"><time datetime="2026-06-02">2 June 2026</time> · 5 min read</p>
          <p class="series" data-spec="006:FR-006">Running the platform as a product · part 5 of 5</p>   (series only)
          <p class="excerpt">…</p>
        </article>
      </li>
    </ol>
  </section>
  <section id="pillar-regulated"> … <p class="soon">An article on this theme is in the works.</p> </section>
</main>
```

Method page: `<p class="further" data-spec="006:FR-009">Further reading: <a …>Title</a></p>` in four sections.
