# Quickstart: Privacy-Friendly Analytics

## Precondition (Sander, once)

1. Create an account at goatcounter.com with the site code `sammieetje`, so the dashboard is
   `https://sammieetje.goatcounter.com`. If the code is taken, change `endpoint` in
   `src/site/analytics.ts`; nothing else changes.
2. Keep the dashboard private (the default needs a login). No secret goes into the repository.

## Local validation

```sh
npm run check
```

Expect:

- unit tests for `shouldCount`, the request builders and the article-link scan pass;
- the end-to-end test on `localhost` sees zero requests to any other host on every page
  (contract C1);
- the end-to-end test under `https://sammieetje.github.io` (routed to the local build) sees
  exactly one page view per page to the analytics host and nothing to any other host, an event
  for an article click, none with Global Privacy Control or Do Not Track set, and no `?` or `#`
  in `p` or `r` (contract C2–C5);
- no cookies and no browser storage after any page load (C6);
- the privacy page in both languages, linked from every footer, passes axe in both colour
  schemes;
- all Lighthouse budgets are met with the script included.

## After deploy

1. Open `https://sammieetje.github.io/` and `/nl/privacy/` in a normal browser window.
2. Click one article link on `/writing/`.
3. Within a few minutes the GoatCounter dashboard shows both page views and the article event.
4. In a browser with Global Privacy Control on (for example Brave or Firefox with the setting),
   repeat step 1: the dashboard count does not change.
5. In the browser's developer tools, check Application → Storage: no cookies, nothing stored.
