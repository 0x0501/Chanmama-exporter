## 1. Route-scoped content extraction

- [x] 1.1 Replace the placeholder content script match rules with the Chanmama blogger detail route and add a runtime route guard.
- [x] 1.2 Implement typed selector helpers that collect the requested blogger fields and apply empty-string / false fallbacks.
- [x] 1.3 Add content-script messaging that returns the export payload and prints the aggregated object in the page console.

## 2. Popup export flow

- [x] 2.1 Replace the starter popup UI with a Chanmama export panel and export button.
- [x] 2.2 Detect whether the active tab is a supported Chanmama blogger detail page before allowing export.
- [x] 2.3 Invoke the content-script export flow from the popup and show success or unsupported/error status.

## 3. Verification

- [x] 3.1 Validate the route-matching behavior against supported and unsupported URLs.
- [x] 3.2 Verify that the exported object includes all required keys and the promotion fallback behavior.
