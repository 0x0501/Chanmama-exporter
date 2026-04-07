# WXT + React

This template should help get you started developing with React in WXT.

## 需求

实现只有在匹配特性域名（蝉妈妈），https://www.chanmama.com/bloggerRank/XpVfCbDDPbFh3jg9fN8IJGOfV1lOJOmo.html，需要在：https://www.chanmama.com/bloggerRank/xxxxxx这个路由插件才激活。我们需要获取页面中的这些数据（右边是它们在页面中对应的js selector）：

- 用户昵称 (string)：#seo-text > div > div.author-info > div.info-top.flex.align-items-center > div.mask-block > div > div > div.flex.align-items-center.author-info-group > div.flex-1 > div.flex.align-items-center.mb5 > div.fs16.c000.font-weight-600.ellipsis-1.cursor-pointer.link-hover
- 用户ID (string)：#seo-text > div > div.author-info > div.info-top.flex.align-items-center > div.mask-block > div > div > div.flex.align-items-center.author-info-group > div.flex-1 > div.flex.align-items-center.fs12 > div.ml6.fs12.font-weight-400.c333.ellipsis-1
- 粉丝数量 (string)：#seo-text > div > div.author-info > div.flex.mt20.align-items-start > div:nth-child(1) > div:nth-child(1) > div.flex.align-items-center > div.fans-num.fs16.font-weight-400.c333.lh100p
- 近30天销售额 (string)：#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.pl10.mb30.cl > div:nth-child(1) > div.flex.align-items-center.mt12.mb6 > div > span
- 主营类目(string)：#seo-text > div > div.author-info > div.flex.align-items-center.mt24 > div.el-tooltip.tag-info-box.mr12.flex.align-items-center.c666 > div > div > div > div:nth-child(1)
- 直播销量 (string)：#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(1) > div > div:nth-child(4) > div.flex.align-items-center.mt12.mb6 > div > span
- 直播销售额 (string)：#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(1) > div > div:nth-child(3) > div.flex.align-items-center.mt12.mb6 > div > span
- 短视频销量 (string)：#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(2) > div > div:nth-child(4) > div.flex.align-items-center.mt12.mb6 > div
- 短视频销售额 (string)：#app > div.festival-theme.author-detail-page > div.author-detail-content > div.author-details-wrapper.flex.justify-content-space-between > div.details-right > div > div > div:nth-child(1) > div > div.data-overview > div.section > div.flex.gap22.pl10.pr10.mb30 > div:nth-child(2) > div > div:nth-child(3) > div.flex.align-items-center.mt12.mb6 > div
- 视频画像 (string)：#seo-text > div > div.author-info > div.flex.mt20.align-items-start > div.info-block.live-data-block.mr16 > div.flex.align-items-center.flex-wrap.live-portrait-row > div
- 是否投流 (boolean)：#seo-text > div > div.author-info > div.flex.align-items-center.mt24 > div.creative-tag.mr12.flex.align-items-center.cursor-pointer > span


> 注意，“是否投流”这部分数据，如果没有获取到元素就是没有投流，设置为false

激活插件以后，用户可以点击插件图标进入到插件面板，点击面板中的导出按钮导出上面的数据到控制台，将这些信息汇总到一个Object内，打印Object即可。
