import { storage } from '#imports';

export const CHANMAMA_BLOGGER_PATHNAME_PATTERN = /^\/bloggerRank\/[^/]+\.html$/;

export const CHANMAMA_BLOGGER_URL_PATTERN =
  /^https:\/\/www\.chanmama\.com\/bloggerRank\/[^/?#]+\.html(?:[?#].*)?$/;

export const CHANMAMA_COLLECT_MESSAGE_TYPE = 'chanmama:collect';
export const CHANMAMA_LOG_TO_CONSOLE_MESSAGE_TYPE = 'chanmama:log-to-console';
export const CHANMAMA_FEISHU_IMPORT_MESSAGE_TYPE = 'chanmama:feishu-import';

/**
 * 导出字段英文标识与中文字段名映射。
 * 外部导出对象将使用中文字段名作为 key。
 */
export const CHANMAMA_EXPORT_FIELD_LABELS = {
  nickname: '用户昵称',
  userId: '用户ID',
  followerCount: '粉丝数量',
  salesLast30Days: '近30天销售额',
  primaryCategory: '主营类目',
  liveSalesVolume: '直播销量',
  liveSalesAmount: '直播销售额',
  shortVideoSalesVolume: '短视频销量',
  shortVideoSalesAmount: '短视频销售额',
  videoPortrait: '视频画像',
  hasPromotion: '是否投流',
} as const;

export type ChanmamaExportFieldName =
  (typeof CHANMAMA_EXPORT_FIELD_LABELS)[keyof typeof CHANMAMA_EXPORT_FIELD_LABELS];

export type ChanmamaPromotionFieldName = typeof CHANMAMA_EXPORT_FIELD_LABELS.hasPromotion;

export type ChanmamaTextFieldName = Exclude<ChanmamaExportFieldName, ChanmamaPromotionFieldName>;

export type ChanmamaTextSelectorReadMode = 'single' | 'children';

export type ChanmamaSelectorReadMode = ChanmamaTextSelectorReadMode | 'exists';

export type ChanmamaExportData = {
  /** 达人昵称。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.nickname]: string;
  /** 达人号。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.userId]: string;
  /** 粉丝总数。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.followerCount]: string;
  /** 近 30 天累计销售额。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.salesLast30Days]: string;
  /** 达人主营类目。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.primaryCategory]: string;
  /** 直播累计销量。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.liveSalesVolume]: string;
  /** 直播累计销售额。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.liveSalesAmount]: string;
  /** 短视频累计销量。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.shortVideoSalesVolume]: string;
  /** 短视频累计销售额。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.shortVideoSalesAmount]: string;
  /** 视频画像标签，多个值以 ` / ` 拼接。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.videoPortrait]: string;
  /** 页面中是否存在“有投流”标识。 */
  [CHANMAMA_EXPORT_FIELD_LABELS.hasPromotion]: boolean;
};

type ChanmamaTextSelectorDefinition = {
  field: ChanmamaTextFieldName;
  description: string;
  mode: ChanmamaTextSelectorReadMode;
  defaultSelector: string;
};

type ChanmamaBooleanSelectorDefinition = {
  field: ChanmamaPromotionFieldName;
  description: string;
  mode: 'exists';
  defaultSelector: string;
};

type ChanmamaSelectorDefinition = ChanmamaTextSelectorDefinition | ChanmamaBooleanSelectorDefinition;

export type ChanmamaSelectorSettings = Record<ChanmamaExportFieldName, string>;

export const CHANMAMA_TEXT_SELECTOR_SCHEMA = [
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.nickname,
    description: '达人昵称文本',
    mode: 'single',
    defaultSelector:
      '#seo-text > div > div.author-info > div.info-top.flex.align-items-center > div.mask-block > div > div > div.flex.align-items-center.author-info-group > div.flex-1 > div.flex.align-items-center.mb5 > div.fs16.c000.font-weight-600.ellipsis-1.cursor-pointer.link-hover',
  },
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.userId,
    description: '达人号文本',
    mode: 'single',
    defaultSelector:
      '#seo-text > div > div.author-info > div.info-top.flex.align-items-center > div.mask-block > div > div > div.flex.align-items-center.author-info-group > div.flex-1 > div.flex.align-items-center.fs12 > div.ml6.fs12.font-weight-400.c333.ellipsis-1',
  },
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.followerCount,
    description: '粉丝总数字段',
    mode: 'single',
    defaultSelector:
      '#seo-text > div > div.author-info > div.flex.mt20.align-items-start > div:nth-child(1) > div:nth-child(1) > div.flex.align-items-center > div.fans-num.fs16.font-weight-400.c333.lh100p',
  },
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.salesLast30Days,
    description: '近 30 天销售额',
    mode: 'single',
    defaultSelector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.pl10.mb30.cl > div:nth-child(1) > div.flex.align-items-center.mt12.mb6 > div > span',
  },
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.primaryCategory,
    description: '主营类目',
    mode: 'single',
    defaultSelector:
      '#seo-text > div > div.author-info > div.flex.align-items-center.mt24 > div.el-tooltip.tag-info-box.mr12.flex.align-items-center.c666 > div > div > div > div:nth-child(1)',
  },
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.liveSalesVolume,
    description: '直播累计销量',
    mode: 'single',
    defaultSelector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(1) > div > div:nth-child(4) > div.flex.align-items-center.mt12.mb6 > div > span',
  },
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.liveSalesAmount,
    description: '直播累计销售额',
    mode: 'single',
    defaultSelector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(1) > div > div:nth-child(3) > div.flex.align-items-center.mt12.mb6 > div > span',
  },
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.shortVideoSalesVolume,
    description: '短视频累计销量',
    mode: 'single',
    defaultSelector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(2) > div > div:nth-child(4) > div.flex.align-items-center.mt12.mb6 > div',
  },
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.shortVideoSalesAmount,
    description: '短视频累计销售额',
    mode: 'single',
    defaultSelector:
      '#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(2) > div > div:nth-child(3) > div.flex.align-items-center.mt12.mb6 > div',
  },
  {
    field: CHANMAMA_EXPORT_FIELD_LABELS.videoPortrait,
    description: '视频画像标签（会拼接子节点文本）',
    mode: 'children',
    defaultSelector:
      '#seo-text > div > div.author-info > div.flex.mt20.align-items-start > div.info-block.live-data-block.mr16 > div.flex.align-items-center.flex-wrap.live-portrait-row > div',
  },
] as const satisfies readonly ChanmamaTextSelectorDefinition[];

export const CHANMAMA_BOOLEAN_SELECTOR_SCHEMA = {
  field: CHANMAMA_EXPORT_FIELD_LABELS.hasPromotion,
  description: '是否投流（存在即 true）',
  mode: 'exists',
  defaultSelector:
    '#seo-text > div > div.author-info > div.flex.align-items-center.mt24 > div.creative-tag.mr12.flex.align-items-center.cursor-pointer > span',
} as const satisfies ChanmamaBooleanSelectorDefinition;

export const CHANMAMA_SELECTOR_SCHEMA = [
  ...CHANMAMA_TEXT_SELECTOR_SCHEMA,
  CHANMAMA_BOOLEAN_SELECTOR_SCHEMA,
] as const satisfies readonly ChanmamaSelectorDefinition[];

type ChanmamaFeishuSettingsSchemaItem = {
  field: keyof ChanmamaFeishuSettings;
  label: string;
  description: string;
  placeholder: string;
  inputType?: 'password';
};

export type ChanmamaFeishuSettings = {
  appId: string;
  appSecret: string;
  appToken: string;
  tableId: string;
};

export const CHANMAMA_FEISHU_SETTINGS_FIELD_LABELS = {
  appId: 'app_id',
  appSecret: 'app_secret',
  appToken: 'app_token',
  tableId: 'table_id',
} as const satisfies Record<keyof ChanmamaFeishuSettings, string>;

export const CHANMAMA_FEISHU_SETTINGS_SCHEMA = [
  {
    field: 'appId',
    label: CHANMAMA_FEISHU_SETTINGS_FIELD_LABELS.appId,
    description: '飞书自建应用的 App ID',
    placeholder: 'cli_xxxxxxxxxxxxxxxx',
  },
  {
    field: 'appSecret',
    label: CHANMAMA_FEISHU_SETTINGS_FIELD_LABELS.appSecret,
    description: '飞书自建应用的 App Secret',
    placeholder: '应用密钥',
    inputType: 'password',
  },
  {
    field: 'appToken',
    label: CHANMAMA_FEISHU_SETTINGS_FIELD_LABELS.appToken,
    description: '多维表格 app_token',
    placeholder: 'appxxxxxxxxxxxxxxxx',
  },
  {
    field: 'tableId',
    label: CHANMAMA_FEISHU_SETTINGS_FIELD_LABELS.tableId,
    description: '目标数据表 table_id',
    placeholder: 'tblxxxxxxxxxxxxxxxx',
  },
] as const satisfies readonly ChanmamaFeishuSettingsSchemaItem[];

export const CHANMAMA_DEFAULT_FEISHU_SETTINGS: ChanmamaFeishuSettings = {
  appId: '',
  appSecret: '',
  appToken: '',
  tableId: '',
};

function buildDefaultSelectorSettings(): ChanmamaSelectorSettings {
  const defaults = {} as ChanmamaSelectorSettings;

  for (const { field, defaultSelector } of CHANMAMA_SELECTOR_SCHEMA) {
    defaults[field] = defaultSelector;
  }

  return defaults;
}

export const CHANMAMA_DEFAULT_SELECTOR_SETTINGS = buildDefaultSelectorSettings();

const CHANMAMA_SELECTOR_SETTINGS_STORAGE_KEY = 'local:chanmama-selector-settings';
const CHANMAMA_FEISHU_SETTINGS_STORAGE_KEY = 'local:chanmama-feishu-settings';
const CHANMAMA_DEBUG_ENABLED_STORAGE_KEY = 'local:chanmama-debug-enabled';

const chanmamaSelectorSettingsStorage = storage.defineItem<Partial<ChanmamaSelectorSettings>>(
  CHANMAMA_SELECTOR_SETTINGS_STORAGE_KEY,
  {
    fallback: {},
  },
);

const chanmamaFeishuSettingsStorage = storage.defineItem<Partial<ChanmamaFeishuSettings>>(
  CHANMAMA_FEISHU_SETTINGS_STORAGE_KEY,
  {
    fallback: {},
  },
);

const chanmamaDebugEnabledStorage = storage.defineItem<boolean>(CHANMAMA_DEBUG_ENABLED_STORAGE_KEY, {
  fallback: false,
});

function normalizeSelectorValue(selector: unknown): string | null {
  if (typeof selector !== 'string') {
    return null;
  }

  const trimmedSelector = selector.trim();
  return trimmedSelector.length > 0 ? trimmedSelector : null;
}

function normalizeFeishuSettingValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeChanmamaSelectorSettings(
  value: Partial<ChanmamaSelectorSettings> | null | undefined,
): ChanmamaSelectorSettings {
  const normalized = { ...CHANMAMA_DEFAULT_SELECTOR_SETTINGS };

  if (!value) {
    return normalized;
  }

  for (const { field, defaultSelector } of CHANMAMA_SELECTOR_SCHEMA) {
    const selector = normalizeSelectorValue(value[field]);
    normalized[field] = selector ?? defaultSelector;
  }

  return normalized;
}

export function normalizeChanmamaFeishuSettings(
  value: Partial<ChanmamaFeishuSettings> | null | undefined,
): ChanmamaFeishuSettings {
  return {
    appId: normalizeFeishuSettingValue(value?.appId),
    appSecret: normalizeFeishuSettingValue(value?.appSecret),
    appToken: normalizeFeishuSettingValue(value?.appToken),
    tableId: normalizeFeishuSettingValue(value?.tableId),
  };
}

export async function getChanmamaSelectorSettings(): Promise<ChanmamaSelectorSettings> {
  const value = await chanmamaSelectorSettingsStorage.getValue();
  return normalizeChanmamaSelectorSettings(value);
}

export async function setChanmamaSelectorSettings(
  value: Partial<ChanmamaSelectorSettings>,
): Promise<ChanmamaSelectorSettings> {
  const normalized = normalizeChanmamaSelectorSettings(value);
  await chanmamaSelectorSettingsStorage.setValue(normalized);
  return normalized;
}

export async function resetChanmamaSelectorSettings(): Promise<ChanmamaSelectorSettings> {
  await chanmamaSelectorSettingsStorage.removeValue();
  return { ...CHANMAMA_DEFAULT_SELECTOR_SETTINGS };
}

export async function getChanmamaFeishuSettings(): Promise<ChanmamaFeishuSettings> {
  const value = await chanmamaFeishuSettingsStorage.getValue();
  return normalizeChanmamaFeishuSettings(value);
}

export async function setChanmamaFeishuSettings(
  value: Partial<ChanmamaFeishuSettings>,
): Promise<ChanmamaFeishuSettings> {
  const normalized = normalizeChanmamaFeishuSettings(value);
  await chanmamaFeishuSettingsStorage.setValue(normalized);
  return normalized;
}

export async function resetChanmamaFeishuSettings(): Promise<ChanmamaFeishuSettings> {
  await chanmamaFeishuSettingsStorage.removeValue();
  return { ...CHANMAMA_DEFAULT_FEISHU_SETTINGS };
}

export async function getChanmamaDebugEnabled(): Promise<boolean> {
  const value = await chanmamaDebugEnabledStorage.getValue();
  return Boolean(value);
}

export async function setChanmamaDebugEnabled(value: boolean): Promise<boolean> {
  await chanmamaDebugEnabledStorage.setValue(Boolean(value));
  return Boolean(value);
}

export function isChanmamaFeishuSettingsComplete(settings: ChanmamaFeishuSettings): boolean {
  return Object.values(settings).every((value) => value.length > 0);
}

export function getChanmamaMissingFeishuSettings(settings: ChanmamaFeishuSettings): string[] {
  return CHANMAMA_FEISHU_SETTINGS_SCHEMA.filter(({ field }) => settings[field].length === 0).map(
    ({ label }) => label,
  );
}

export type ChanmamaCollectMessage = {
  type: typeof CHANMAMA_COLLECT_MESSAGE_TYPE;
};

export type ChanmamaLogToConsoleMessage = {
  type: typeof CHANMAMA_LOG_TO_CONSOLE_MESSAGE_TYPE;
  payload: ChanmamaExportData;
};

export type ChanmamaFeishuImportMessage = {
  type: typeof CHANMAMA_FEISHU_IMPORT_MESSAGE_TYPE;
  payload: ChanmamaExportData;
};

export type ChanmamaErrorStage =
  | 'popup-init'
  | 'popup-export'
  | 'content-collect'
  | 'content-log'
  | 'background-feishu';

export type ChanmamaErrorCode =
  | 'UNSUPPORTED_PAGE'
  | 'NO_RESPONSE'
  | 'INVALID_RESPONSE'
  | 'INVALID_SELECTOR'
  | 'QUERY_FAILED'
  | 'SCRIPT_INJECTION_FAILED'
  | 'CONSOLE_LOG_FAILED'
  | 'FEISHU_SETTINGS_INCOMPLETE'
  | 'FEISHU_AUTH_FAILED'
  | 'FEISHU_RECORD_FAILED'
  | 'UNKNOWN';

export type ChanmamaErrorInfo = {
  stage: ChanmamaErrorStage;
  code: ChanmamaErrorCode;
  message: string;
  details?: string[];
};

export type ChanmamaCollectResponse =
  | {
      ok: true;
      data: ChanmamaExportData;
    }
  | {
      ok: false;
      error: ChanmamaErrorInfo;
    };

export type ChanmamaLogToConsoleResponse =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: ChanmamaErrorInfo;
    };

export type ChanmamaFeishuImportResponse =
  | {
      ok: true;
      recordId: string;
    }
  | {
      ok: false;
      error: ChanmamaErrorInfo;
    };

export function createChanmamaError(
  stage: ChanmamaErrorStage,
  code: ChanmamaErrorCode,
  message: string,
  details?: string[],
): ChanmamaErrorInfo {
  return {
    stage,
    code,
    message,
    details: details?.filter(Boolean),
  };
}

export function isSupportedChanmamaBloggerUrl(url?: string | null): boolean {
  if (!url) {
    return false;
  }

  return CHANMAMA_BLOGGER_URL_PATTERN.test(url);
}
