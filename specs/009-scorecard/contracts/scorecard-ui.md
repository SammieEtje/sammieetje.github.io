# Contract: Scorecard page (DOM)

```text
<main>
  <header> <h1>Scorecard</h1> <p class="intro">…</p> </header>
  <p class="state" data-spec="009:FR-008">No measurement loaded … <a href="/quality/report.json">raw report</a></p>
  <ul class="tiles">
    <li data-tile="specs">Specs shipped <strong>9</strong> <a href="…/specs">…</a></li>   (static)
    <li data-tile="unit" hidden>…</li> <li data-tile="e2e" hidden>…</li> <li data-tile="duration" hidden>…</li>
  </ul>
  <section class="live" hidden data-spec="009:FR-006">
    <p class="verdict">All budgets met · commit <a>abc1234</a> · measured …</p>
    <table> <caption>…</caption> <thead>Page · Performance · Accessibility · Best practices · SEO · JavaScript</thead>
      <tbody> <tr><th scope="row">/</th><td>100 <span class="status">within budget</span></td>…</tr> </tbody>
    </table>
  </section>
</main>
```
