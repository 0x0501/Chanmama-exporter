import { useEffect, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import './App.css';
import {
  CHANMAMA_DEFAULT_SELECTOR_SETTINGS,
  CHANMAMA_EXPORT_MESSAGE_TYPE,
  CHANMAMA_SELECTOR_SCHEMA,
  getChanmamaSelectorSettings,
  resetChanmamaSelectorSettings,
  setChanmamaSelectorSettings,
  type ChanmamaExportResponse,
  type ChanmamaSelectorReadMode,
  type ChanmamaSelectorSettings,
  isSupportedChanmamaBloggerUrl,
} from '@/utils/chanmama';

type PopupStatus =
  | {
      tone: 'neutral';
      message: string;
    }
  | {
      tone: 'success' | 'error';
      message: string;
    };

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

function App() {
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [isSupportedPage, setIsSupportedPage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [savedSelectorSettings, setSavedSelectorSettings] = useState<ChanmamaSelectorSettings>(
    CHANMAMA_DEFAULT_SELECTOR_SETTINGS,
  );
  const [selectorDraft, setSelectorDraft] = useState<ChanmamaSelectorSettings>(
    CHANMAMA_DEFAULT_SELECTOR_SETTINGS,
  );
  const [status, setStatus] = useState<PopupStatus>({
    tone: 'neutral',
    message: '正在识别当前标签页。',
  });

  const usesDefaultSelectors = areSelectorSettingsDefault(savedSelectorSettings);

  useEffect(() => {
    async function initializePopup() {
      try {
        const [tabs, selectorSettings] = await Promise.all([
          browser.tabs.query({ active: true, currentWindow: true }),
          getChanmamaSelectorSettings(),
        ]);
        const [tab] = tabs;
        const tabId = tab?.id ?? null;
        const url = tab?.url ?? '';
        const supported = isSupportedChanmamaBloggerUrl(url);

        setSavedSelectorSettings(selectorSettings);
        setSelectorDraft(selectorSettings);
        setActiveTabId(tabId);
        setActiveUrl(url);
        setIsSupportedPage(supported);
        setStatus({
          tone: 'neutral',
          message: supported
            ? '已检测到蝉妈妈达人详情页，可以直接导出字段。'
            : '当前标签页不是支持的达人详情页，请切换到目标页面后再试。',
        });
      } catch (error) {
        setStatus({
          tone: 'error',
          message: error instanceof Error ? error.message : '初始化失败，请稍后重试。',
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

  async function handleSettingsOpenChange(open: boolean) {
    setIsSettingsOpen(open);

    if (!open) {
      return;
    }

    try {
      const selectorSettings = await getChanmamaSelectorSettings();
      setSavedSelectorSettings(selectorSettings);
      setSelectorDraft(selectorSettings);
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : '无法读取字段配置。',
      });
    }
  }

  async function handleSaveSelectorSettings() {
    setIsSavingSettings(true);

    try {
      const savedSettings = await setChanmamaSelectorSettings(selectorDraft);
      setSavedSelectorSettings(savedSettings);
      setSelectorDraft(savedSettings);
      setIsSettingsOpen(false);
      setStatus({
        tone: 'success',
        message: '字段配置已保存，后续导出会使用新规则。',
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : '保存字段配置失败。',
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
      });
    } finally {
      setIsSavingSettings(false);
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

    setIsExporting(true);
    setStatus({
      tone: 'neutral',
      message: '正在采集当前页面字段，并写入页面控制台。',
    });

    try {
      const response = (await browser.tabs.sendMessage(activeTabId, {
        type: CHANMAMA_EXPORT_MESSAGE_TYPE,
      })) as ChanmamaExportResponse;

      if (!response?.ok) {
        setStatus({
          tone: 'error',
          message: response?.error ?? '导出失败，未收到有效响应。',
        });
        return;
      }

      setStatus({
        tone: 'success',
        message: `导出完成，页面控制台已输出 ${Object.keys(response.data).length} 个字段。`,
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : '导出失败，请稍后重试。',
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
            <div className="title-group">
              <p className="eyebrow">Chanmama Exporter</p>
              <h1>达人详情导出</h1>
              <p className="description">为当前页面提取结构化字段，并输出到浏览器控制台。</p>
            </div>

            <Dialog.Trigger className="button button-subtle button-compact">
              字段设置
            </Dialog.Trigger>
          </header>

          <section className={`status-panel status-panel-${status.tone}`}>
            <div className="status-panel-head">
              <div className="status-indicator">
                <span className="status-dot" aria-hidden="true" />
                <div className="status-copy-group">
                  <p className="status-title">{isSupportedPage ? '页面已就绪' : '等待匹配页面'}</p>
                  <p className="status-message">{status.message}</p>
                </div>
              </div>

              <span className={`chip ${isSupportedPage ? 'chip-success' : 'chip-muted'}`}>
                {isSupportedPage ? '可导出' : '未匹配'}
              </span>
            </div>
          </section>

          <section className="meta-panel" aria-label="导出信息">
            <div className="meta-row">
              <span className="meta-label">输出位置</span>
              <span className="meta-value">页面控制台</span>
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

          <p className="footnote">打开目标页面开发者工具的 Console 面板即可查看导出结果。</p>

          <Button
            type="button"
            className="button button-primary action-button"
            disabled={!isSupportedPage || isExporting}
            onClick={handleExport}>
            {isExporting ? '导出中...' : '导出到控制台'}
          </Button>
        </section>
      </main>

      <Dialog.Portal>
        <Dialog.Backdrop className="settings-backdrop" />
        <Dialog.Viewport className="settings-viewport">
          <Dialog.Popup className="settings-dialog">
            <header className="settings-header">
              <div className="settings-heading">
                <Dialog.Title className="settings-title">字段 Selector 设置</Dialog.Title>
                <Dialog.Description className="settings-description">
                  基于页面结构覆盖默认抓取规则。留空或非法值会自动回退到默认 selector。
                </Dialog.Description>
              </div>

              <span className="settings-summary">{CHANMAMA_SELECTOR_SCHEMA.length} 个字段</span>
            </header>

            <div className="settings-toolbar">
              <p className="settings-helper">配置会保存到浏览器本地存储，并在下次导出时自动生效。</p>

              <Button
                type="button"
                className="button button-ghost"
                disabled={isSavingSettings}
                onClick={handleResetSelectorSettings}>
                恢复默认
              </Button>
            </div>

            <div className="settings-form">
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
                onClick={handleSaveSelectorSettings}>
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
