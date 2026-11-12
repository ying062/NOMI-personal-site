# SPEC-023：修复后台登录无响应

- 状态：In Progress
- 日期：2026-11-12
- 分支：fix/SPEC-023-admin-login
- 关联：SPEC-017（后台筛选）、SPEC-022（GitHub Pages 上线）

## 目标与范围

修复「输入账号密码点登录后输入框被清空、不进入后台」的故障。仅改后台脚本与后台页脚本引用方式，不改页面结构与 Supabase 数据。

## 缺陷描述

- 现象：打开 `admin.html`，填入管理员邮箱与密码，点击「登录」后页面刷新、输入框清空，不出现任何错误提示，也不进入看板。
- 根因：`admin.html` 内联的后台脚本存在语法错误 —— `load()` 中的 `render` 箭头函数缺少闭合 `}`，`try` 块被提前结束，整段脚本解析失败（`SyntaxError: Unexpected token ';'`）。脚本不执行，`#login-form` 的 `onsubmit` 未被绑定，按钮退回浏览器原生提交（`action="#"`），于是页面刷新、输入丢失。
- 次生问题：`public/admin.js` 与内联副本内容不一致，内联副本是 SPEC-017 之前的旧版本，缺少搜索/筛选渲染逻辑；两份代码各自演化导致同类故障难以发现。

## 需求与验收

| 需求 ID | 行为与规则 | 验收 ID / Given-When-Then | 用例 ID |
|---|---|---|---|
| REQ-023-01 | 后台脚本无语法错误，能正常绑定事件 | AC-023-01 Given 加载 `admin.js`，When 执行语法检查，Then 无语法错误 | TC-023-01 |
| REQ-023-02 | 登录表单提交被脚本接管，不再刷新页面 | AC-023-02 Given 输入账号密码并点击登录，When 提交表单，Then 输入框内容保留，状态区显示「正在登录…」或错误原因 | TC-023-02 |
| REQ-023-03 | 后台页只引用一份脚本，避免重复维护 | AC-023-03 Given 查看 `admin.html`，When 检查脚本标签，Then 仅有 `<script src="./admin.js">`，不含内联副本 | TC-023-03 |
| REQ-023-04 | 搜索、状态、日期筛选恢复可用（依赖 SPEC-017 逻辑） | AC-023-04 Given 已登录，When 在搜索框输入关键词，Then 列表即时过滤且不重新请求 | TC-023-04 |

## 实现方案

- 重写 `public/admin.js`：拆分 `renderMessages()`、`renderTrend()`、`load()`、登录提交逻辑；修正 `render` 未闭合导致的语法错误；筛选控件改为绑定 `renderMessages`，输入即时过滤，不再每次改动都重新拉数据。
- `escapeHtml()` 统一转义昵称、微信号与内容，避免把用户输入当 HTML 插入。
- 登录失败区分「未填完整」「接口返回错误」「网络异常」，错误信息显示在 `#login-status`，不再静默。
- `admin.html` 与 `src/admin.html` 删除内联脚本，改为 `<script src="./admin.js"></script>`；`src/admin.js` 与 `public/admin.js` 同步。
- 受影响文件：`public/admin.js`、`public/admin.html`、`src/admin.js`、`src/admin.html`、本轮 SPEC 与 TEST-REPORT。

## 开发任务

- [x] 关联 REQ-023-01/03：重写脚本、改为外部引用
- [x] 关联 REQ-023-04：恢复筛选逻辑
- [ ] 关联 REQ-023-02：发布后由管理员在浏览器实际登录验证

## 测试计划

| 用例 ID | 验收 ID | 前置条件与输入 | 操作或命令 | 预期结果 |
|---|---|---|---|---|
| TC-023-01 | AC-023-01 | 仓库根目录 | `node --check public/admin.js` | 无输出、退出码 0 |
| TC-023-03 | AC-023-03 | 同上 | `grep -o "<script[^>]*>" public/admin.html` | 只有 `<script src="./admin.js">` |
| TC-023-02 | AC-023-02 | 部署完成，管理员账号 | 打开线上 `/admin.html`，输入账号密码点登录 | 输入不被清空；成功进入看板，失败显示具体原因 |
| TC-023-04 | AC-023-04 | 已登录且有留言数据 | 在搜索框输入关键词、切换状态、选日期 | 列表按条件过滤 |

## 风险与未决事项

- Supabase 的 `auth/v1/token` 接口在本地沙箱不可达，端到端登录只能由管理员在浏览器验证；若仍失败，需按页面显示的 `error_description` 判断是账号密码、邮箱确认、还是 RLS 问题。
- 定时任务或浏览器缓存可能导致取到旧 `admin.js`，验证时可强制刷新。

## 交付与回退

- 合并门槛：TC-023-01、TC-023-03 通过，TC-023-02 由管理员确认。
- 回退：`git revert` 对应提交，Pages 会自动重新发布。

## 变更记录

- 2026-11-12：定位语法错误根因，重写后台脚本并改为外部引用。
