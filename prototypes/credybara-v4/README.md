# Credybara V4

当前交互原型，更新于 2026-10-28。

- [在线预览](https://bengbong.github.io/something-for-view/prototypes/credybara-v4/)
- [填写与产品选择](https://bengbong.github.io/something-for-view/prototypes/credybara-v4/flow.html)
- [机构页面](https://bengbong.github.io/something-for-view/prototypes/credybara-v4/lender.html)

## 内容

游客首页包含循环播放的 AI 对话流程动画。填写页支持访客开始、登录注册、邮件验证码交互、产品结果自动保存及恢复，并在继续对话时把可用产品保留在输入框上方。Credybara 侧的流程止于产品结果与机构交接，机构审批、签约和放款不作为本站可追踪进度。

这是静态交互原型：AI 回复、账户、邮件、机构响应和贷款流程均使用本地模拟，没有连接真实服务。验证码输入任意 6 位数字即可通过。可用产品按 7 天有效期模拟，仅在当前浏览器同一站点按用户名保留；保存字段不包含申请表身份、联系方式、授权或机构交接 token。展示数据不构成真实报价或审批结果。

## 本地运行

在本目录运行：

```sh
python3 -m http.server 8000
```

打开 `http://localhost:8000/`。无需安装依赖或执行构建。页面字体通过 Google Fonts 加载，离线时使用系统字体。

运行结果存储测试：

```sh
node --test tests/saved-products.test.cjs
```
