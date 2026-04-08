import {
  CHANMAMA_BLOGGER_PATHNAME_PATTERN,
  CHANMAMA_BOOLEAN_SELECTOR_SCHEMA,
  CHANMAMA_COLLECT_MESSAGE_TYPE,
  CHANMAMA_TEXT_SELECTOR_SCHEMA,
  createChanmamaError,
  getChanmamaSelectorSettings,
  type ChanmamaCollectMessage,
  type ChanmamaCollectResponse,
  type ChanmamaExportData,
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
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : `Invalid selector: ${selector.slice(0, 120)}`,
    );
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

async function handleCollect(): Promise<ChanmamaCollectResponse> {
  if (!isSupportedChanmamaPage()) {
    return {
      ok: false,
      error: createChanmamaError(
        'content-collect',
        'UNSUPPORTED_PAGE',
        '当前页面不是支持的蝉妈妈达人详情页。',
        [`pathname=${window.location.pathname}`],
      ),
    };
  }

  try {
    const data = await collectChanmamaExportData();

    return {
      ok: true,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: createChanmamaError(
        'content-collect',
        'QUERY_FAILED',
        '采集失败，请检查 selector 配置后重试。',
        [
          `pathname=${window.location.pathname}`,
          error instanceof Error ? error.message : 'Unknown content collection error',
        ],
      ),
    };
  }
}

export default defineContentScript({
  matches: ['https://www.chanmama.com/bloggerRank/*'],
  runAt: 'document_idle',
  main(ctx) {
    if (!isSupportedChanmamaPage()) {
      return;
    }

    const handleMessage = (
      message: ChanmamaCollectMessage,
      _sender: unknown,
      sendResponse: (response?: ChanmamaCollectResponse) => void,
    ) => {
      if (message?.type === CHANMAMA_COLLECT_MESSAGE_TYPE) {
        void handleCollect()
          .then((response) => {
            sendResponse(response);
          })
          .catch((error: unknown) => {
            sendResponse({
              ok: false,
              error: createChanmamaError(
                'content-collect',
                'UNKNOWN',
                '采集失败，请检查 selector 配置后重试。',
                [error instanceof Error ? error.message : 'Unknown content runtime error'],
              ),
            } satisfies ChanmamaCollectResponse);
          });

        return true;
      }

      return undefined;
    };

    browser.runtime.onMessage.addListener(handleMessage);
    ctx.onInvalidated(() => {
      browser.runtime.onMessage.removeListener(handleMessage);
    });
  },
});
