# Contract: Deployment history page (DOM)

Applies to `/career/` and `/nl/loopbaan/`.

```text
<main>
  <header> <h1>Deployment history</h1> <p>intro</p> </header>
  <section aria-labelledby="legend-title" data-spec="003:FR-007">     pattern legend
    <h2 id="legend-title">The pattern</h2>
    <dl> <dt>Consolidate</dt><dd>…</dd> ×4 </dl>
  </section>
  <ol class="releases" data-spec="003:FR-001">
    <li data-release="tennet-dap" data-spec="003:FR-002">
      <details data-spec="003:FR-005">
        <summary>
          <span class="label" data-spec="003:FR-003">v2026.05</span>
          <span class="current" data-spec="003:FR-004">latest</span>       only on the current role
          <h2>Manager Data & Analytics Platform</h2>
          <p class="meta">TenneT · Arnhem · <time datetime="2026-05">May 2026</time> – present</p>
          <p class="summary">…</p>
          <ul class="patterns"><li>Design the environment</li>…</ul>
        </summary>
        <div class="notes"> <h3>Context</h3><p>…</p> <h3>Approach</h3><p>…</p> <h3>Result</h3><p>…</p> </div>
      </details>
    </li> ×9
    <li data-release="utwente" class="education" data-spec="003:FR-006"> … </li>
  </ol>
</main>
```

Interface strings (EN / NL): "Deployment history" / "Releasegeschiedenis"; "The pattern" /
"Het patroon"; "present" / "heden"; "latest" / "actueel"; "Context" / "Context"; "Approach" /
"Aanpak"; "Result" / "Resultaat"; "Release notes" / "Releasenotes"; home link "Full deployment
history" / "Volledige releasegeschiedenis".
