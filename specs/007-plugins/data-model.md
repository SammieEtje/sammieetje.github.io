# Data Model: Plugins

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `profile-site`, `specdriven-app`, `mypool` |
| `name` | string | repository name |
| `repo` | URL | `https://github.com/SammieEtje/<name>` |
| `live` | URL \| `'self'` \| undefined | `'self'` for this site |
| `purpose`, `demonstrates` | Text per locale | |
| `tech` | string[] | names as written by their projects |
| `lifecycle` | `production` \| `experimental` \| `archived` | |
| `specs` | URL \| undefined | set for spec-driven projects |
| `since` | number | year started |
