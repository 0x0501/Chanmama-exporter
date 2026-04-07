## ADDED Requirements

### Requirement: Extension activates only on supported Chanmama blogger detail pages
The extension SHALL inject and enable blogger export behavior only for pages under `https://www.chanmama.com/bloggerRank/*` that represent a blogger detail route in the form `/bloggerRank/<identifier>.html`.

#### Scenario: Supported blogger page
- **WHEN** a user opens `https://www.chanmama.com/bloggerRank/XpVfCbDDPbFh3jg9fN8IJGOfV1lOJOmo.html`
- **THEN** the content script MUST be active and ready to respond to popup export requests

#### Scenario: Unsupported Chanmama page
- **WHEN** a user opens a page outside the supported blogger detail route
- **THEN** the extension MUST NOT expose blogger export behavior for that tab

### Requirement: Content script extracts the requested blogger data fields
The content script SHALL return a single object containing the requested blogger data fields from the current page: nickname, userId, followerCount, salesLast30Days, primaryCategory, liveSalesVolume, liveSalesAmount, shortVideoSalesVolume, shortVideoSalesAmount, videoPortrait, and isPromoted.

#### Scenario: All target fields are present
- **WHEN** the popup requests an export on a supported blogger detail page with all selectors available
- **THEN** the content script MUST return an object with each field populated from the matching DOM node text

#### Scenario: Promotion tag is absent
- **WHEN** the popup requests an export and the promotion selector does not match any element
- **THEN** the content script MUST set `isPromoted` to `false`

#### Scenario: Optional text fields are absent
- **WHEN** the popup requests an export and any requested text selector except the promotion flag is missing
- **THEN** the content script MUST still return the object and use an empty string for the missing field

### Requirement: Popup can trigger export and print the aggregated payload
The popup SHALL provide an export action that requests the current tab payload from the content script and prints the aggregated object to the active page console.

#### Scenario: Export from supported page
- **WHEN** the user opens the extension popup on a supported Chanmama blogger detail page and clicks the export button
- **THEN** the extension MUST collect the current page data and print one aggregated object in the page console

#### Scenario: Export from unsupported page
- **WHEN** the user opens the extension popup on an unsupported tab
- **THEN** the popup MUST not attempt export silently and MUST indicate that the current page is unsupported
