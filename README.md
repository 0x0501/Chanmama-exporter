# Easy PR Extension

A browser extension built with `WXT + React + TypeScript`. The current implementation exports creator data from Chanmama blogger detail pages.

## Features

- Activates only on `https://www.chanmama.com/bloggerRank/*.html`
- Detects whether the current tab is a supported page when the popup opens
- Collects page data and prints a single object to the active page console after clicking `Export to Console`

## Exported Fields

- `用户昵称`
- `用户ID`
- `粉丝数量`
- `近30天销售额`
- `主营类目`
- `直播销量`
- `直播销售额`
- `短视频销量`
- `短视频销售额`
- `视频画像`
- `是否投流`

## Notes

- `是否投流` falls back to `false` when the target element is not found
- `视频画像` is merged into a single string in page order

## Tech Stack

- React
- TypeScript
- WXT
- BaseUI

## Install

```bash
pnpm i
```

## Development

```bash
pnpm run dev
```

## Build

```bash
pnpm run build
```

## Type Check

```bash
pnpm run compile
```

## Usage

1. Start dev mode or build the extension first.
2. Load the WXT output directory in your browser.
3. Open a Chanmama blogger detail page, for example:

```text
https://www.chanmama.com/bloggerRank/XpVfCbDDPbFh3jg9fN8IJGOfV1lOJOmo.html
```

4. Click the extension icon to open the popup.
5. Click `Export to Console`.
6. Open DevTools on the active page and inspect the exported object in the page console.

## Test Fixture

The repository includes a sample page for local reference:

- [tests/sample.html](E:/Code Space/easy-pr-extension/tests/sample.html)
