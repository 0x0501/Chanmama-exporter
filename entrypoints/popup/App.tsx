import { useEffect, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import './App.css';
import {
  CHANMAMA_COLLECT_MESSAGE_TYPE,
  CHANMAMA_DEFAULT_FEISHU_SETTINGS,
  CHANMAMA_DEFAULT_SELECTOR_SETTINGS,
  CHANMAMA_FEISHU_IMPORT_MESSAGE_TYPE,
  CHANMAMA_FEISHU_SETTINGS_SCHEMA,
  CHANMAMA_LOG_TO_CONSOLE_MESSAGE_TYPE,
  CHANMAMA_SELECTOR_SCHEMA,
  getChanmamaDebugEnabled,
  getChanmamaFeishuSettings,
  getChanmamaSelectorSettings,
  isChanmamaFeishuSettingsComplete,
  isSupportedChanmamaBloggerUrl,
  resetChanmamaSelectorSettings,
  setChanmamaDebugEnabled,
  setChanmamaFeishuSettings,
  setChanmamaSelectorSettings,
  type ChanmamaCollectResponse,
  type ChanmamaErrorInfo,
  type ChanmamaFeishuImportResponse,
  type ChanmamaFeishuSettings,
  type ChanmamaLogToConsoleResponse,
  type ChanmamaSelectorReadMode,
  type ChanmamaSelectorSettings,
} from '@/utils/chanmama';

type PopupStatus =
  | {
      tone: 'neutral';
      message: string;
      details?: string[];
    }
  | {
      tone: 'success' | 'error';
      message: string;
      details?: string[];
    };

function buildErrorStatus(error: ChanmamaErrorInfo): PopupStatus {
  return {
    tone: 'error',
    message: error.message,
    details: [`stage=${error.stage}`, `code=${error.code}`, ...(error.details ?? [])],
  };
}

function getSelectorModeLabel(mode: ChanmamaSelectorReadMode) {
  if (mode === 'children') {
    return '拼接子节点文本';
  }

  if (mode === 'exists') {
    return '存在即 true';
  }

  return '单节点文本';
}

function areSelectorSettingsDefault(settings: ChanmamaSelectorSettings) {
  return CHANMAMA_SELECTOR_SCHEMA.every(
    ({ field, defaultSelector }) => settings[field] === defaultSelector,
  );
}

function getDefaultStatusMessage(
  isSupportedPage: boolean,
  isDebugEnabled: boolean,
  isFeishuReady: boolean,
) {
  if (!isSupportedPage) {
    return '当前标签页不是支持的达人详情页，请切换到目标页面后再试。';
  }

  if (isDebugEnabled) {
    return '已检测到蝉妈妈达人详情页。Debug 模式已开启，导出将写入页面控制台。';
  }

  if (isFeishuReady) {
    return '已检测到蝉妈妈达人详情页。点击后会把采集结果导入飞书多维表格。';
  }

  return '已检测到蝉妈妈达人详情页。请先在设置中补全飞书配置，或打开 Debug 模式。';
}

function getExportTargetLabel(isDebugEnabled: boolean) {
  return isDebugEnabled ? '页面控制台' : '飞书多维表格';
}

function getFootnoteMessage(isDebugEnabled: boolean, isFeishuReady: boolean) {
  if (isDebugEnabled) {
    return '打开目标页面开发者工具的 Console 面板即可查看导出结果。';
  }

  if (isFeishuReady) {
    return '关闭 Debug 后，扩展会把当前页面字段新增为一条飞书多维表格记录。';
  }

  return '关闭 Debug 后需要先在设置中补全 app_id、app_secret、app_token 和 table_id。';
}

function getActionButtonLabel(
  isDebugEnabled: boolean,
  isExporting: boolean,
  isFeishuReady: boolean,
) {
  if (isExporting) {
    return isDebugEnabled ? '导出中...' : '导入中...';
  }

  if (isDebugEnabled) {
    return '导出到控制台';
  }

  return isFeishuReady ? '导入到飞书多维表格' : '请先配置飞书';
}

function App() {
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [isSupportedPage, setIsSupportedPage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUpdatingDebug, setIsUpdatingDebug] = useState(false);
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);
  const [savedSelectorSettings, setSavedSelectorSettings] = useState<ChanmamaSelectorSettings>(
    CHANMAMA_DEFAULT_SELECTOR_SETTINGS,
  );
  const [selectorDraft, setSelectorDraft] = useState<ChanmamaSelectorSettings>(
    CHANMAMA_DEFAULT_SELECTOR_SETTINGS,
  );
  const [savedFeishuSettings, setSavedFeishuSettings] = useState<ChanmamaFeishuSettings>(
    CHANMAMA_DEFAULT_FEISHU_SETTINGS,
  );
  const [feishuDraft, setFeishuDraft] = useState<ChanmamaFeishuSettings>(
    CHANMAMA_DEFAULT_FEISHU_SETTINGS,
  );
  const [status, setStatus] = useState<PopupStatus>({
    tone: 'neutral',
    message: '正在识别当前标签页。',
  });

  const usesDefaultSelectors = areSelectorSettingsDefault(savedSelectorSettings);
  const isFeishuReady = isChanmamaFeishuSettingsComplete(savedFeishuSettings);
  const isFeishuDraftReady = isChanmamaFeishuSettingsComplete(feishuDraft);
  const exportTargetLabel = getExportTargetLabel(isDebugEnabled);
  const actionButtonLabel = getActionButtonLabel(isDebugEnabled, isExporting, isFeishuReady);
  const footnoteMessage = getFootnoteMessage(isDebugEnabled, isFeishuReady);
  const isExportDisabled =
    !isSupportedPage || isExporting || isUpdatingDebug || (!isDebugEnabled && !isFeishuReady);

  useEffect(() => {
    async function initializePopup() {
      try {
        const [tabs, selectorSettings, feishuSettings, debugEnabled] = await Promise.all([
          browser.tabs.query({ active: true, currentWindow: true }),
          getChanmamaSelectorSettings(),
          getChanmamaFeishuSettings(),
          getChanmamaDebugEnabled(),
        ]);
        const [tab] = tabs;
        const tabId = tab?.id ?? null;
        const url = tab?.url ?? '';
        const supported = isSupportedChanmamaBloggerUrl(url);
        const feishuReady = isChanmamaFeishuSettingsComplete(feishuSettings);

        setSavedSelectorSettings(selectorSettings);
        setSelectorDraft(selectorSettings);
        setSavedFeishuSettings(feishuSettings);
        setFeishuDraft(feishuSettings);
        setIsDebugEnabled(debugEnabled);
        setActiveTabId(tabId);
        setActiveUrl(url);
        setIsSupportedPage(supported);
        setStatus({
          tone: 'neutral',
          message: getDefaultStatusMessage(supported, debugEnabled, feishuReady),
        });
      } catch (error) {
        setStatus({
          tone: 'error',
          message: error instanceof Error ? error.message : '初始化失败，请稍后重试。',
          details: [error instanceof Error ? error.stack ?? error.message : 'Unknown init error'],
        });
      }
    }

    void initializePopup();
  }, []);

  function handleSelectorValueChange(field: keyof ChanmamaSelectorSettings, value: string) {
    setSelectorDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleFeishuValueChange(field: keyof ChanmamaFeishuSettings, value: string) {
    setFeishuDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSettingsOpenChange(open: boolean) {
    setIsSettingsOpen(open);

    if (!open) {
      return;
    }

    try {
      const [selectorSettings, feishuSettings] = await Promise.all([
        getChanmamaSelectorSettings(),
        getChanmamaFeishuSettings(),
      ]);
      setSavedSelectorSettings(selectorSettings);
      setSelectorDraft(selectorSettings);
      setSavedFeishuSettings(feishuSettings);
      setFeishuDraft(feishuSettings);
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : '无法读取设置。',
        details: [error instanceof Error ? error.stack ?? error.message : 'Unknown settings read error'],
      });
    }
  }

  async function handleSaveSettings() {
    setIsSavingSettings(true);

    try {
      const [savedSelectors, savedFeishu] = await Promise.all([
        setChanmamaSelectorSettings(selectorDraft),
        setChanmamaFeishuSettings(feishuDraft),
      ]);
      const feishuReady = isChanmamaFeishuSettingsComplete(savedFeishu);

      setSavedSelectorSettings(savedSelectors);
      setSelectorDraft(savedSelectors);
      setSavedFeishuSettings(savedFeishu);
      setFeishuDraft(savedFeishu);
      setIsSettingsOpen(false);
      setStatus({
        tone: feishuReady || isDebugEnabled ? 'success' : 'neutral',
        message: feishuReady
          ? '设置已保存。关闭 Debug 后会默认导入飞书多维表格。'
          : '设置已保存。飞书配置尚未完整，关闭 Debug 后导入按钮会保持禁用。',
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : '保存设置失败。',
        details: [error instanceof Error ? error.stack ?? error.message : 'Unknown settings save error'],
      });
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleResetSelectorSettings() {
    setIsSavingSettings(true);

    try {
      const defaultSettings = await resetChanmamaSelectorSettings();
      setSavedSelectorSettings(defaultSettings);
      setSelectorDraft(defaultSettings);
      setStatus({
        tone: 'success',
        message: '已恢复默认字段配置。',
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : '恢复默认配置失败。',
        details: [error instanceof Error ? error.stack ?? error.message : 'Unknown selector reset error'],
      });
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleDebugToggle(nextEnabled: boolean) {
    setIsUpdatingDebug(true);

    try {
      const savedValue = await setChanmamaDebugEnabled(nextEnabled);
      setIsDebugEnabled(savedValue);
      setStatus({
        tone: savedValue || isFeishuReady ? 'success' : 'neutral',
        message: savedValue
          ? 'Debug 模式已开启，后续导出会写入页面控制台。'
          : getDefaultStatusMessage(isSupportedPage, false, isFeishuReady),
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : '切换 Debug 模式失败。',
        details: [error instanceof Error ? error.stack ?? error.message : 'Unknown debug toggle error'],
      });
    } finally {
      setIsUpdatingDebug(false);
    }
  }

  async function handleExport() {
    if (!isSupportedPage || activeTabId === null) {
      setStatus({
        tone: 'error',
        message: '请先切换到 https://www.chanmama.com/bloggerRank/*.html 页面。',
      });
      return;
    }

    if (!isDebugEnabled && !isFeishuReady) {
      setStatus({
        tone: 'error',
        message: '请先在设置中补全飞书配置，或打开 Debug 模式。',
      });
      return;
    }

    setIsExporting(true);
    setStatus({
      tone: 'neutral',
      message: isDebugEnabled
        ? '正在采集当前页面字段，并写入页面控制台。'
        : '正在采集当前页面字段，并导入飞书多维表格。',
    });

    try {
      const collectResponse = (await browser.tabs.sendMessage(activeTabId, {
        type: CHANMAMA_COLLECT_MESSAGE_TYPE,
      })) as ChanmamaCollectResponse;

      if (!collectResponse) {
        setStatus(
          buildErrorStatus({
            stage: 'popup-export',
            code: 'NO_RESPONSE',
            message: '采集失败，content script 没有返回结果。',
            details: [`tabId=${activeTabId}`, `url=${activeUrl}`],
          }),
        );
        return;
      }

      if (!collectResponse.ok) {
        setStatus(buildErrorStatus(collectResponse.error));
        return;
      }

      if (isDebugEnabled) {
        const consoleResponse = (await browser.tabs.sendMessage(activeTabId, {
          type: CHANMAMA_LOG_TO_CONSOLE_MESSAGE_TYPE,
          payload: collectResponse.data,
        })) as ChanmamaLogToConsoleResponse;

        if (!consoleResponse) {
          setStatus(
            buildErrorStatus({
              stage: 'popup-export',
              code: 'NO_RESPONSE',
              message: '写入页面控制台失败，content script 没有返回结果。',
              details: [`tabId=${activeTabId}`],
            }),
          );
          return;
        }

        if (!consoleResponse.ok) {
          setStatus(buildErrorStatus(consoleResponse.error));
          return;
        }

        setStatus({
          tone: 'success',
          message: `导出完成，页面控制台已输出 ${Object.keys(collectResponse.data).length} 个字段。`,
        });
        return;
      }

      const feishuResponse = (await browser.runtime.sendMessage({
        type: CHANMAMA_FEISHU_IMPORT_MESSAGE_TYPE,
        payload: collectResponse.data,
      })) as ChanmamaFeishuImportResponse;

      if (!feishuResponse) {
        setStatus(
          buildErrorStatus({
            stage: 'popup-export',
            code: 'NO_RESPONSE',
            message: '导入飞书失败，background 没有返回结果。',
            details: [`tabId=${activeTabId}`],
          }),
        );
        return;
      }

      if (!feishuResponse.ok) {
        setStatus(buildErrorStatus(feishuResponse.error));
        return;
      }

      setStatus({
        tone: 'success',
        message: `导入完成，飞书多维表格已新增记录 ${feishuResponse.recordId}。`,
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : '导出失败，请稍后重试。',
        details: [error instanceof Error ? error.stack ?? error.message : 'Unknown popup export error'],
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog.Root open={isSettingsOpen} onOpenChange={(open) => void handleSettingsOpenChange(open)}>
      <main className="popup-panel">
        <section className="surface">
          <header className="surface-header">
            <div className="header-topline">
              <p className="eyebrow">Chanmama Exporter</p>

              <div className="header-actions">
                <label className="debug-toggle">
                  <span className="debug-toggle-copy">
                    <span className={`chip chip-inline ${isDebugEnabled ? 'chip-accent' : 'chip-muted'}`}>
                      {isDebugEnabled ? '控制台' : '飞书'}
                    </span>
                  </span>

                  <span className="debug-toggle-control">
                    <input
                      type="checkbox"
                      className="debug-checkbox"
                      checked={isDebugEnabled}
                      disabled={isUpdatingDebug}
                      onChange={(event) => void handleDebugToggle(event.target.checked)}
                    />
                    <span className="debug-track" aria-hidden="true">
                      <span className="debug-thumb" />
                    </span>
                  </span>
                </label>

                <Dialog.Trigger className="button button-subtle button-toolbar">设置</Dialog.Trigger>
              </div>
            </div>

            <div className="title-group">
              <h1>达人详情导出</h1>
              <div className="header-summary">
                <span className={`chip ${isDebugEnabled ? 'chip-accent' : 'chip-muted'}`}>
                  {isDebugEnabled ? 'Debug 已开启' : '默认导入模式'}
                </span>
                <span className="header-summary-text">当前输出到 {exportTargetLabel}</span>
              </div>
            </div>
          </header>

          <section className={`status-panel status-panel-${status.tone}`}>
            <div className="status-panel-head">
              <div className="status-indicator">
                <span className="status-dot" aria-hidden="true" />
                <div className="status-copy-group">
                  <p className="status-title">{isSupportedPage ? '页面已就绪' : '等待匹配页面'}</p>
                  <p className="status-message">{status.message}</p>
                  {status.details?.length ? (
                    <pre className="status-details">{status.details.join('\n')}</pre>
                  ) : null}
                </div>
              </div>

              <span className={`chip ${isSupportedPage ? 'chip-success' : 'chip-muted'}`}>
                {isSupportedPage ? '可导出' : '未匹配'}
              </span>
            </div>
          </section>

          <section className="meta-panel" aria-label="导出信息">
            <div className="meta-row">
              <span className="meta-label">导出模式</span>
              <span className="meta-value">{isDebugEnabled ? 'Debug' : '默认模式'}</span>
            </div>

            <div className="meta-row">
              <span className="meta-label">输出位置</span>
              <span className="meta-value">{exportTargetLabel}</span>
            </div>

            <div className="meta-row">
              <span className="meta-label">飞书配置</span>
              <span className={`chip ${isFeishuReady ? 'chip-success' : 'chip-muted'}`}>
                {isFeishuReady ? '已配置' : '未完成'}
              </span>
            </div>

            <div className="meta-row">
              <span className="meta-label">字段配置</span>
              <span className={`chip ${usesDefaultSelectors ? 'chip-muted' : 'chip-accent'}`}>
                {usesDefaultSelectors ? '默认配置' : '自定义配置'}
              </span>
            </div>

            <div className="meta-row meta-row-stacked">
              <span className="meta-label">当前 URL</span>
              <code className="url-value">{activeUrl || '未读取到标签页地址'}</code>
            </div>
          </section>

          <p className="footnote">{footnoteMessage}</p>

          <Button
            type="button"
            className="button button-primary action-button"
            disabled={isExportDisabled}
            onClick={handleExport}>
            {actionButtonLabel}
          </Button>
        </section>
      </main>

      <Dialog.Portal>
        <Dialog.Backdrop className="settings-backdrop" />
        <Dialog.Viewport className="settings-viewport">
          <Dialog.Popup className="settings-dialog">
            <header className="settings-header">
              <div className="settings-heading">
                <Dialog.Title className="settings-title">导出设置</Dialog.Title>
                <Dialog.Description className="settings-description">
                  配置飞书多维表格与页面 selector。关闭 Debug 后，会默认把采集结果导入飞书。
                </Dialog.Description>
              </div>

              <span className="settings-summary">
                {CHANMAMA_FEISHU_SETTINGS_SCHEMA.length + CHANMAMA_SELECTOR_SCHEMA.length} 项配置
              </span>
            </header>

            <div className="settings-form">
              <section className="settings-section">
                <div className="settings-section-head">
                  <div className="settings-heading">
                    <h2 className="settings-section-title">飞书多维表格</h2>
                    <p className="settings-helper">
                      使用飞书自建应用的 `tenant_access_token` 鉴权，并向目标多维表格新增记录。
                    </p>
                  </div>

                  <span className={`chip ${isFeishuDraftReady ? 'chip-success' : 'chip-muted'}`}>
                    {isFeishuDraftReady ? '已配置' : '待补全'}
                  </span>
                </div>

                <div className="feishu-grid">
                  {CHANMAMA_FEISHU_SETTINGS_SCHEMA.map((fieldConfig) => (
                    <Field.Root key={fieldConfig.field} className="selector-field feishu-field">
                      <div className="selector-heading">
                        <Field.Label className="selector-label">{fieldConfig.label}</Field.Label>
                        <Field.Description className="selector-description">
                          {fieldConfig.description}
                        </Field.Description>
                      </div>

                      <Input
                        type={'inputType' in fieldConfig ? fieldConfig.inputType : 'text'}
                        className="selector-input"
                        value={feishuDraft[fieldConfig.field]}
                        onValueChange={(value) =>
                          handleFeishuValueChange(fieldConfig.field, String(value))
                        }
                        placeholder={fieldConfig.placeholder}
                      />
                    </Field.Root>
                  ))}
                </div>
              </section>

              <section className="settings-section">
                <div className="settings-section-head">
                  <div className="settings-heading">
                    <h2 className="settings-section-title">字段 Selector</h2>
                    <p className="settings-helper">
                      基于页面结构覆盖默认抓取规则。留空或非法值会自动回退到默认 selector。
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="button button-ghost"
                    disabled={isSavingSettings}
                    onClick={handleResetSelectorSettings}>
                    恢复默认
                  </Button>
                </div>

                <div className="selector-list">
                  {CHANMAMA_SELECTOR_SCHEMA.map((fieldConfig) => (
                    <Field.Root key={fieldConfig.field} className="selector-field">
                      <div className="selector-field-head">
                        <div className="selector-heading">
                          <Field.Label className="selector-label">{fieldConfig.field}</Field.Label>
                          <Field.Description className="selector-description">
                            {fieldConfig.description}
                          </Field.Description>
                        </div>

                        <span className="selector-mode">{getSelectorModeLabel(fieldConfig.mode)}</span>
                      </div>

                      <Input
                        className="selector-input"
                        value={selectorDraft[fieldConfig.field]}
                        onValueChange={(value) =>
                          handleSelectorValueChange(fieldConfig.field, String(value))
                        }
                        placeholder={fieldConfig.defaultSelector}
                      />
                    </Field.Root>
                  ))}
                </div>
              </section>
            </div>

            <div className="settings-actions">
              <Button
                type="button"
                className="button button-subtle"
                disabled={isSavingSettings}
                onClick={() => setIsSettingsOpen(false)}>
                关闭
              </Button>

              <Button
                type="button"
                className="button button-primary"
                disabled={isSavingSettings}
                onClick={handleSaveSettings}>
                {isSavingSettings ? '保存中...' : '保存设置'}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default App;
