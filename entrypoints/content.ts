import {
  CHANMAMA_BLOGGER_PATHNAME_PATTERN,
  CHANMAMA_BOOLEAN_SELECTOR_SCHEMA,
  CHANMAMA_EXPORT_MESSAGE_TYPE,
  CHANMAMA_TEXT_SELECTOR_SCHEMA,
  getChanmamaSelectorSettings,
  type ChanmamaExportData,
  type ChanmamaExportMessage,
  type ChanmamaExportResponse,
  type ChanmamaTextFieldName,
  type ChanmamaTextSelectorReadMode,
} from '@/utils/chanmama';

function isSupportedChanmamaPage() {
  return CHANMAMA_BLOGGER_PATHNAME_PATTERN.test(window.location.pathname);
}

function normalizeText(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function queryElement(selector: string) {
  if (!selector) {
    return null;
  }

  try {
    return document.querySelector<HTMLElement>(selector);
  } catch {
    return null;
  }
}

function getFieldValue(selector: string, mode: ChanmamaTextSelectorReadMode) {
  const element = queryElement(selector);

  if (!element) {
    return '';
  }

  if (mode === 'children') {
    const childTexts = Array.from(element.children)
      .map((child) => normalizeText(child.textContent))
      .filter(Boolean);

    if (childTexts.length > 0) {
      return childTexts.join(' / ');
    }
  }

  return normalizeText(element.textContent);
}

async function collectChanmamaExportData(): Promise<ChanmamaExportData> {
  const selectorSettings = await getChanmamaSelectorSettings();
  const textData = {} as Record<ChanmamaTextFieldName, string>;

  for (const fieldConfig of CHANMAMA_TEXT_SELECTOR_SCHEMA) {
    textData[fieldConfig.field] = getFieldValue(
      selectorSettings[fieldConfig.field],
      fieldConfig.mode,
    );
  }

  return {
    ...textData,
    [CHANMAMA_BOOLEAN_SELECTOR_SCHEMA.field]:
      queryElement(selectorSettings[CHANMAMA_BOOLEAN_SELECTOR_SCHEMA.field]) !== null,
  };
}

function logExportToPageConsole(payload: ChanmamaExportData) {
  const script = document.createElement('script');
  script.textContent = `console.log(${JSON.stringify(payload)});`;
  (document.head ?? document.documentElement).appendChild(script);
  script.remove();
}

export default defineContentScript({
  matches: ['https://www.chanmama.com/bloggerRank/*'],
  runAt: 'document_idle',
  main() {
    if (!isSupportedChanmamaPage()) {
      return;
    }

    browser.runtime.onMessage.addListener((message: ChanmamaExportMessage) => {
      if (message?.type !== CHANMAMA_EXPORT_MESSAGE_TYPE) {
        return undefined;
      }

      return (async () => {
        if (!isSupportedChanmamaPage()) {
          return {
            ok: false,
            error: '当前页面不是支持的蝉妈妈达人详情页。',
          } satisfies ChanmamaExportResponse;
        }

        try {
          const data = await collectChanmamaExportData();
          logExportToPageConsole(data);

          return {
            ok: true,
            data,
          } satisfies ChanmamaExportResponse;
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : '采集失败，请检查 selector 配置后重试。',
          } satisfies ChanmamaExportResponse;
        }
      })();
    });
  },
});
