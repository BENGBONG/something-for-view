# Credybara V4 · PC preview

- [在线预览](https://bengbong.github.io/something-for-view/prototypes/credybara-v4/)
- [填写页](https://bengbong.github.io/something-for-view/prototypes/credybara-v4/flow.html)

GitHub 预览固定为 1600 × 1000（16:10）的 PC 画布，窗口较小时整体等比缩放，不切换手机布局。内容在画布内部滚动；首页、填写、账户和机构页面使用相同的桌面尺寸。地址参数与页面导航保留。

原型源码位于 `app/`，PC 预览容器为根目录的 `pc-preview.js`、`pc-preview.css` 和 HTML 入口。本地设计版不受发布容器影响。

本项目是静态交互原型。AI 回复、账户、邮件、机构响应和贷款流程使用本地模拟，未连接真实服务。邮件验证码输入任意 6 位数字即可通过；产品结果在同一浏览器同一站点按用户名模拟保留 7 天。保存字段不包含申请表身份、联系方式、授权或机构交接 token。

本地运行：`python3 -m http.server 8000`，然后打开 `http://localhost:8000/`。

存储测试：`node --test app/tests/saved-products.test.cjs`。
