# Data Model: Measure Inline Scripts

Quality report v2, per page (additions in bold):

| Field | Meaning |
|-------|---------|
| `scriptBytes` | **total** compressed JavaScript the page delivers (external + inline) — published and gated |
| **`scripts.external`** | compressed transfer size of separate script files (from Lighthouse) |
| **`scripts.inline`** | gzip size of executable embedded script (from the built HTML) |

Executable script types: absent, `module`, `text/javascript`, `application/javascript`. Everything
else inside `<script>` is data and is not counted.
