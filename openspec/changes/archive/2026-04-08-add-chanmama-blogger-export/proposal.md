## Why

The extension currently uses a placeholder content script and popup, so it cannot help users capture blogger metrics from Chanmama detail pages. We need a focused export flow for the Chanmama blogger detail route so users can trigger the extension only where the data is relevant and inspect the collected payload quickly during development.

## What Changes

- Restrict extension activation to `https://www.chanmama.com/bloggerRank/*` blogger detail pages instead of the current placeholder Google match.
- Add page data collection for the requested blogger profile, sales, category, portrait, and ad-delivery fields on Chanmama detail pages.
- Add popup behavior that lets users export the collected data and print a single aggregated object to the page console.
- Treat the "是否投流" field as `false` when the selector is absent instead of failing the export.

## Capabilities

### New Capabilities
- `chanmama-blogger-export`: Activate the extension on supported Chanmama blogger pages, collect the required page fields, and export the result from the popup.

### Modified Capabilities

None.

## Impact

- Affected code: `entrypoints/content.ts`, `entrypoints/popup/App.tsx`, popup styles, and related extension messaging/types.
- Systems: browser extension content script injection and popup-to-tab communication.
- Dependencies: no new external dependency is expected; implementation should rely on DOM querying and existing WXT runtime APIs.
