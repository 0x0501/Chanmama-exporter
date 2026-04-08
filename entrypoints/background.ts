import {
  CHANMAMA_FEISHU_IMPORT_MESSAGE_TYPE,
  getChanmamaFeishuSettings,
  getChanmamaMissingFeishuSettings,
  isChanmamaFeishuSettingsComplete,
  type ChanmamaExportData,
  type ChanmamaFeishuImportMessage,
  type ChanmamaFeishuImportResponse,
  type ChanmamaFeishuSettings,
} from '@/utils/chanmama';

const FEISHU_OPEN_API_BASE_URL = 'https://open.feishu.cn/open-apis';

type FeishuTenantAccessTokenPayload = {
  code?: number;
  msg?: string;
  tenant_access_token?: string;
  expire?: number;
};

type FeishuCreateRecordPayload = {
  code?: number;
  msg?: string;
  data?: {
    record?: {
      record_id?: string;
    };
  };
};

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function formatFeishuErrorMessage(
  fallbackMessage: string,
  payload: { code?: number; msg?: string } | null,
) {
  const message = payload?.msg?.trim();
  const code = payload?.code;

  if (message && typeof code === 'number') {
    return `${fallbackMessage}（${code}: ${message}）`;
  }

  if (message) {
    return `${fallbackMessage}（${message}）`;
  }

  return fallbackMessage;
}

function assertFeishuSettingsReady(settings: ChanmamaFeishuSettings) {
  if (isChanmamaFeishuSettingsComplete(settings)) {
    return;
  }

  const missingSettings = getChanmamaMissingFeishuSettings(settings);
  throw new Error(`请先在设置中补全飞书配置：${missingSettings.join('、')}。`);
}

async function requestTenantAccessToken(settings: ChanmamaFeishuSettings) {
  const response = await fetch(`${FEISHU_OPEN_API_BASE_URL}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: settings.appId,
      app_secret: settings.appSecret,
    }),
  });

  const payload = await parseJsonResponse<FeishuTenantAccessTokenPayload>(response);

  if (!response.ok) {
    throw new Error(formatFeishuErrorMessage(`飞书鉴权失败，HTTP ${response.status}`, payload));
  }

  if (payload?.code !== 0 || !payload.tenant_access_token) {
    throw new Error(formatFeishuErrorMessage('飞书鉴权失败', payload));
  }

  return payload.tenant_access_token;
}

async function createFeishuRecord(
  settings: ChanmamaFeishuSettings,
  tenantAccessToken: string,
  fields: ChanmamaExportData,
) {
  const clientToken = encodeURIComponent(crypto.randomUUID());
  const appToken = encodeURIComponent(settings.appToken);
  const tableId = encodeURIComponent(settings.tableId);
  const response = await fetch(
    `${FEISHU_OPEN_API_BASE_URL}/bitable/v1/apps/${appToken}/tables/${tableId}/records?client_token=${clientToken}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields,
      }),
    },
  );

  const payload = await parseJsonResponse<FeishuCreateRecordPayload>(response);

  if (!response.ok) {
    throw new Error(formatFeishuErrorMessage(`写入飞书失败，HTTP ${response.status}`, payload));
  }

  if (payload?.code !== 0 || !payload.data?.record?.record_id) {
    throw new Error(formatFeishuErrorMessage('写入飞书失败', payload));
  }

  return payload.data.record.record_id;
}

async function importChanmamaDataToFeishu(
  data: ChanmamaExportData,
): Promise<ChanmamaFeishuImportResponse> {
  try {
    const settings = await getChanmamaFeishuSettings();
    assertFeishuSettingsReady(settings);
    const tenantAccessToken = await requestTenantAccessToken(settings);
    const recordId = await createFeishuRecord(settings, tenantAccessToken, data);

    return {
      ok: true,
      recordId,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : '写入飞书失败，请稍后重试。',
    };
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: ChanmamaFeishuImportMessage) => {
    if (message?.type !== CHANMAMA_FEISHU_IMPORT_MESSAGE_TYPE) {
      return undefined;
    }

    return importChanmamaDataToFeishu(message.payload);
  });
});
