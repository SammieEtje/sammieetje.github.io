# Contract: Overview page (DOM)

Applies to `/` and `/nl/`. Selectors used by tests are `data-spec` attributes and roles.

```text
<main>
  <div class="overview" data-spec="002:FR-009">
    <section data-spec="001:FR-001">                   identity card (from 001)
      <picture data-spec="002:FR-001">
        <source type="image/avif" srcset="… 96w, … 128w, … 192w, … 256w" sizes="…">
        <source type="image/webp" srcset="…" sizes="…">
        <img src="….jpg" alt="Portrait of Sander Ettema" width="128" height="128" loading="eager">
      </picture>
      <h1>Sander Ettema</h1> … (role, headline, LinkedIn CTA, chips)
    </section>
    <section aria-labelledby="numbers-title" data-spec="002:FR-004">
      <h2 id="numbers-title">Key numbers</h2>
      <ul>
        <li data-spec="002:FR-006">
          <p><strong>10,000</strong> <span>voluntary users …</span></p>   value + label: one statement
          <p class="context">Rabobank · 2016–2020</p>
        </li> ×3
      </ul>
    </section>
    <section aria-labelledby="about-title" data-spec="002:FR-007">
      <h2 id="about-title">About</h2><p>…three sentences…</p>
    </section>
    <section aria-labelledby="links-title" data-spec="002:FR-008">
      <h2 id="links-title">Links</h2>
      <ul><li><a href="https://www.linkedin.com/in/sanderettema/" rel="me noopener">LinkedIn …</a></li>
          <li><a href="https://github.com/SammieEtje" rel="me noopener">GitHub …</a></li></ul>
    </section>
  </div>
</main>
```

Card titles (EN / NL): "Key numbers" / "Kerncijfers", "About" / "Over mij", "Links" / "Links".
