import {
  CHANMAMA_FEISHU_IMPORT_MESSAGE_TYPE,
  createChanmamaError,
  type ChanmamaFeishuImportMessage,
  type ChanmamaFeishuImportResponse,
} from '@/utils/chanmama';
import { importChanmamaDataToFeishu } from '@/utils/feishu';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: ChanmamaFeishuImportMessage, _sender, sendResponse) => {
    if (message?.type !== CHANMAMA_FEISHU_IMPORT_MESSAGE_TYPE) {
      return undefined;
    }

    void importChanmamaDataToFeishu(message.payload)
      .then((response) => {
        sendResponse(response);
      })
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: createChanmamaError(
            'background-feishu',
            'UNKNOWN',
            '写入飞书失败，请稍后重试。',
            [error instanceof Error ? error.message : 'Unknown background runtime error'],
          ),
        } satisfies ChanmamaFeishuImportResponse);
      });

    return true;
  });
});
