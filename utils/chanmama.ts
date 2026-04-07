export const CHANMAMA_BLOGGER_PATHNAME_PATTERN = /^\/bloggerRank\/[^/]+\.html$/;

export const CHANMAMA_BLOGGER_URL_PATTERN =
  /^https:\/\/www\.chanmama\.com\/bloggerRank\/[^/?#]+\.html(?:[?#].*)?$/;

export const CHANMAMA_EXPORT_MESSAGE_TYPE = 'chanmama:export';

export type ChanmamaExportMessage = {
  type: typeof CHANMAMA_EXPORT_MESSAGE_TYPE;
};

export type ChanmamaExportData = {
  用户昵称: string;
  用户ID: string;
  粉丝数量: string;
  近30天销售额: string;
  主营类目: string;
  直播销量: string;
  直播销售额: string;
  短视频销量: string;
  短视频销售额: string;
  视频画像: string;
  是否投流: boolean;
};

export type ChanmamaExportResponse =
  | {
      ok: true;
      data: ChanmamaExportData;
    }
  | {
      ok: false;
      error: string;
    };

export function isSupportedChanmamaBloggerUrl(url?: string | null): boolean {
  if (!url) {
    return false;
  }

  return CHANMAMA_BLOGGER_URL_PATTERN.test(url);
}
