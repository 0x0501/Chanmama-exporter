import {
  CHANMAMA_BLOGGER_PATHNAME_PATTERN,
  CHANMAMA_EXPORT_MESSAGE_TYPE,
  type ChanmamaExportData,
  type ChanmamaExportMessage,
  type ChanmamaExportResponse,
} from '@/utils/chanmama';

type TextFieldName = Exclude<keyof ChanmamaExportData, '是否投流'>;

type TextFieldSelectorConfig = {
  selector: string;
  mode?: 'single' | 'children';
};

const TEXT_FIELD_SELECTORS: Record<TextFieldName, TextFieldSelectorConfig> = {
  用户昵称: {
    selector:
      '#seo-text > div > div.author-info > div.info-top.flex.align-items-center > div.mask-block > div > div > div.flex.align-items-center.author-info-group > div.flex-1 > div.flex.align-items-center.mb5 > div.fs16.c000.font-weight-600.ellipsis-1.cursor-pointer.link-hover',
  },
  用户ID: {
    selector:
      '#seo-text > div > div.author-info > div.info-top.flex.align-items-center > div.mask-block > div > div > div.flex.align-items-center.author-info-group > div.flex-1 > div.flex.align-items-center.fs12 > div.ml6.fs12.font-weight-400.c333.ellipsis-1',
  },
  粉丝数量: {
    selector:
      '#seo-text > div > div.author-info > div.flex.mt20.align-items-start > div:nth-child(1) > div:nth-child(1) > div.flex.align-items-center > div.fans-num.fs16.font-weight-400.c333.lh100p',
  },
  近30天销售额: {
    selector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.pl10.mb30.cl > div:nth-child(1) > div.flex.align-items-center.mt12.mb6 > div > span',
  },
  主营类目: {
    selector:
      '#seo-text > div > div.author-info > div.flex.align-items-center.mt24 > div.el-tooltip.tag-info-box.mr12.flex.align-items-center.c666 > div > div > div > div:nth-child(1)',
  },
  直播销量: {
    selector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(1) > div > div:nth-child(4) > div.flex.align-items-center.mt12.mb6 > div > span',
  },
  直播销售额: {
    selector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(1) > div > div:nth-child(3) > div.flex.align-items-center.mt12.mb6 > div > span',
  },
  短视频销量: {
    selector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(2) > div > div:nth-child(4) > div.flex.align-items-center.mt12.mb6 > div',
  },
  短视频销售额: {
    selector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(2) > div > div:nth-child(3) > div.flex.align-items-center.mt12.mb6 > div',
  },
  视频画像: {
    selector:
      '#seo-text > div > div.author-info > div.flex.mt20.align-items-start > div.info-block.live-data-block.mr16 > div.flex.align-items-center.flex-wrap.live-portrait-row > div',
    mode: 'children',
  },
};

const PROMOTION_SELECTOR =
  '#seo-text > div > div.author-info > div.flex.align-items-center.mt24 > div.creative-tag.mr12.flex.align-items-center.cursor-pointer > span';

function isSupportedChanmamaPage() {
  return CHANMAMA_BLOGGER_PATHNAME_PATTERN.test(window.location.pathname);
}

function normalizeText(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function getFieldValue({ selector, mode = 'single' }: TextFieldSelectorConfig) {
  const element = document.querySelector<HTMLElement>(selector);

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

function collectChanmamaExportData(): ChanmamaExportData {
  const data = {} as Record<TextFieldName, string>;

  for (const [fieldName, config] of Object.entries(TEXT_FIELD_SELECTORS) as [
    TextFieldName,
    TextFieldSelectorConfig,
  ][]) {
    data[fieldName] = getFieldValue(config);
  }

  return {
    ...data,
    是否投流: document.querySelector(PROMOTION_SELECTOR) !== null,
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

      if (!isSupportedChanmamaPage()) {
        return Promise.resolve({
          ok: false,
          error: '当前页面不是支持的蝉妈妈达人详情页。',
        } satisfies ChanmamaExportResponse);
      }

      const data = collectChanmamaExportData();
      logExportToPageConsole(data);

      return Promise.resolve({
        ok: true,
        data,
      } satisfies ChanmamaExportResponse);
    });
  },
});
