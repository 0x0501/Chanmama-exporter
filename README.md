# Chanmama Exporter (Browser extension)

A browser extension built with `WXT + React + TypeScript`. The current implementation exports creator data from Chanmama blogger detail pages.

## Features

- Activates only on `https://www.chanmama.com/bloggerRank/*.html`
- Detects whether the current tab is a supported page when the popup opens
- Adds a top-right `Debug` switch in the popup
- Collects page data and prints a single object to the active page console when `Debug` is enabled
- Imports the collected data into Feishu Bitable by default when `Debug` is disabled
- Disables the import action when Feishu settings are incomplete and `Debug` is disabled
- Provides Feishu + selector settings dialog in popup (built with BaseUI)
- Persists selector settings with WXT storage (`local:chanmama-selector-settings`)
- Persists Feishu settings and `Debug` mode with WXT storage

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
- Empty or invalid custom selectors automatically fall back to default selectors
- Feishu Bitable field names should match `Exported Fields`
- `是否投流` is written as a boolean value; in Feishu it is recommended to use a checkbox field

## Feishu Settings

The popup settings now include the following Feishu Bitable configuration:

- `app_id`
- `app_secret`
- `app_token`
- `table_id`

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
3. Open a Chanmama blogger detail page.
4. Click the extension icon to open the popup.
5. Open popup `Setting` and configure Feishu if you want to import to Bitable.
6. Keep `Debug` off to import to Feishu, or turn `Debug` on to print to the page console.
7. Click the main action button.
8. If `Debug` is enabled, open DevTools on the active page and inspect the exported object in the page console.
