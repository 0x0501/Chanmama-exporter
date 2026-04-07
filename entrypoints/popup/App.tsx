import { useEffect, useState } from 'react';
import './App.css';
import {
  CHANMAMA_EXPORT_MESSAGE_TYPE,
  type ChanmamaExportResponse,
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

function App() {
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [isSupportedPage, setIsSupportedPage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<PopupStatus>({
    tone: 'neutral',
    message: '正在检测当前页面是否为蝉妈妈达人详情页。',
  });

  useEffect(() => {
    async function loadActiveTab() {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const tabId = tab?.id ?? null;
        const url = tab?.url ?? '';
        const supported = isSupportedChanmamaBloggerUrl(url);

        setActiveTabId(tabId);
        setActiveUrl(url);
        setIsSupportedPage(supported);
        setStatus({
          tone: 'neutral',
          message: supported
            ? '已检测到蝉妈妈达人详情页，可以导出当前页面数据。'
            : '当前标签页不是支持的蝉妈妈达人详情页。',
        });
      } catch (error) {
        setStatus({
          tone: 'error',
          message: error instanceof Error ? error.message : '无法读取当前标签页信息。',
        });
      }
    }

    void loadActiveTab();
  }, []);

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
      message: '正在从当前页面采集数据并输出到页面控制台。',
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
        message: `导出成功，已在页面控制台打印 ${Object.keys(response.data).length} 个字段。`,
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
    <main className="panel">
      <section className="hero">
        <p className="eyebrow">Easy PR Extension</p>
        <h1>蝉妈妈达人页导出</h1>
        <p className="description">
          仅在 `https://www.chanmama.com/bloggerRank/*.html` 页面激活，点击下方按钮后会把采集结果打印到当前页面控制台。
        </p>
      </section>

      <section className="card">
        <div className="label-row">
          <span className="label">当前状态</span>
          <span className={`badge ${isSupportedPage ? 'badge-active' : 'badge-muted'}`}>
            {isSupportedPage ? '可导出' : '未匹配'}
          </span>
        </div>

        <p className={`status status-${status.tone}`}>{status.message}</p>

        <div className="url-box">
          <span className="label">当前 URL</span>
          <code>{activeUrl || '未读取到标签页地址'}</code>
        </div>

        <button
          type="button"
          className="export-button"
          disabled={!isSupportedPage || isExporting}
          onClick={handleExport}>
          {isExporting ? '导出中...' : '导出到控制台'}
        </button>
      </section>
    </main>
  );
}

export default App;