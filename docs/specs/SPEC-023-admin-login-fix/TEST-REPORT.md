# SPEC-023 测试报告

- 结论：Pass（静态项通过；端到端登录待管理员在浏览器确认）
- 日期：2026-11-12，执行人：WorkBuddy（本地执行），分支：fix/SPEC-023-admin-login，被测 SHA：本轮提交
- 环境：Windows 11，Git Bash，Node v22.22.2
- 限制：本地沙箱无法访问 `znyaypduzphcbnvfjcah.supabase.co`（fetch failed），Supabase 登录接口只能由浏览器侧验证
- SPEC：同目录 SPEC.md

| 用例 / 验收 ID | 实际命令或操作 | 预期 | 实际 | 状态 | 证据 |
|---|---|---|---|---|---|
| TC-023-01 / AC-023-01 | `node --check public/admin.js` | 退出码 0，无语法错误 | 无输出、退出码 0 | Pass | 修复前同一检查报 `SyntaxError: Unexpected token ';'` |
| TC-023-03 / AC-023-03 | `grep -o "<script[^>]*>" public/admin.html` | 仅外部引用 | 输出 `<script src="./admin.js">`，内联副本已移除（文件 5759B → 2096B） | Pass | `diff public/admin.js src/admin.js` 一致 |
| TC-023-03 追加 | 核对脚本依赖节点 | 全部存在 | `#login-form` `#login-status` `#dashboard` `#total` `#unread` `#pv` `#uv` `#trend` `#messages` `#search` `#status-filter` `#date-filter` `#logout` `#login` 均存在 | Pass | 逐个 grep 检查 |
| TC-023-02 / AC-023-02 | 打开线上 `/admin.html` 输入账号密码 | 输入不清空，进入看板或显示具体错误 | 待管理员验证 | Not Run | 依赖浏览器与真实账号 |
| TC-023-04 / AC-023-04 | 登录后输入搜索关键词、切换状态、选日期 | 列表即时过滤 | 待管理员验证 | Not Run | 逻辑改为绑定 `renderMessages`，不再重复拉数据 |

## 缺陷与回归

- DEF-023-01（已修复）：`admin.html` 内联脚本缺少 `render` 函数闭合 `}`，导致 `SyntaxError`、脚本整体不执行、登录按钮退化为原生提交并刷新页面。修复方式为重写 `admin.js` 并改为外部引用。
- DEF-023-02（已修复）：内联副本停留在 SPEC-017 之前，缺少筛选逻辑，与 `admin.js` 双版本并存。现统一为单一 `admin.js`。
- 回归检查：首页未改动；`admin.css` 未改动；Supabase 表结构与 RLS 未改动。

## 合并与备份记录

- 审查结论：静态检查通过，代码已发布；端到端登录由管理员复测后补记。
- origin：https://github.com/ying062/NOMI-personal-site.git，推送后核对 `git rev-parse main` 与远端一致。
- 发布标签：未打标签。
