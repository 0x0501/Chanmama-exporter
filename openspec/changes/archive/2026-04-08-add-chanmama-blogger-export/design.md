## Context

The extension currently ships with placeholder WXT content and popup entrypoints. This change replaces the placeholder behavior with a route-scoped Chanmama workflow: inject only on `www.chanmama.com/bloggerRank/*` detail pages, collect a fixed set of page fields from the DOM, and let the popup trigger an export that prints the aggregated result in the active page console.

The implementation spans both extension runtimes. The content script owns DOM access and page-console logging, while the popup owns the user-triggered action. Because browser extensions isolate popup and page contexts, the two sides need an explicit message contract.

## Goals / Non-Goals

**Goals:**
- Inject the content script only on supported Chanmama blogger detail routes.
- Extract all requested fields as strings, except `isPromoted` as a boolean with a missing-selector fallback to `false`.
- Allow the popup to request an export from the active tab and print a single object in the page context console.
- Keep the implementation dependency-free and easy to adjust if Chanmama DOM selectors change.

**Non-Goals:**
- Persist exports to storage, files, or clipboard.
- Support Chanmama routes outside `bloggerRank`.
- Normalize numeric strings into numbers or units.
- Build a generalized scraper framework for other sites.

## Decisions

### Use WXT route matching plus runtime route guard

The content script will use a narrow match pattern for `https://www.chanmama.com/bloggerRank/*` and a runtime pathname check that requires `/bloggerRank/<slug>.html`. This prevents activation on unrelated Chanmama pages while still keeping the manifest simple. An alternative was matching all Chanmama pages and filtering entirely at runtime, but that would inject unnecessary scripts.

### Keep selector definitions in one typed map

The content script will store the requested selectors in a single typed configuration object and resolve them through shared helper functions. This keeps the data contract readable and makes future selector maintenance low-risk. An alternative was hard-coding each `querySelector` inline, but that would scatter page assumptions across the file.

### Export through popup-to-content messaging, then page-context logging

The popup will ask the active tab content script for the payload, and the content script will execute page-context logging so the object appears in the target page console. An alternative was logging from the popup or extension console, but that would not meet the requirement to export after the popup action in the page context developers inspect most often.

### Gracefully degrade on missing data

The payload will return empty strings for missing text fields and `false` for the promotion flag. This keeps the object shape stable and avoids popup failures caused by partial page loads or minor DOM variations. An alternative was surfacing hard errors on missing selectors, but that would make the feature fragile for a development-oriented export flow.

## Risks / Trade-offs

- [Selectors are deeply nested and brittle] -> Centralize selectors and helpers so updates are localized if Chanmama changes its DOM.
- [The page may not be fully rendered when the popup requests export] -> Query the DOM at click time instead of caching on initial load, so the latest rendered data is used.
- [Page console logging from an isolated content script may appear in the extension context instead of the page context] -> Use injected page-context execution when printing the object.
- [Active tab may not be a supported route] -> Show a clear popup status and avoid sending export commands when the page is unsupported.
