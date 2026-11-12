# SPEC-025 测试报告

- 结论：Pass
- 日期：2026-11-12
- 执行人：AI agent
- 分支：`chore/SPEC-025-drop-src-mirror` → `main`
- 被测 SHA：`22f8db3`（首次合并 main）
- 环境：Windows 10/11，Git Bash，Node v22（本地）；CI 为 GitHub Actions ubuntu-latest + Node 20
- SPEC：同目录 SPEC.md

| 用例 / 验收 ID | 实际命令或操作 | 预期 | 实际 | 状态 | 证据 |
|---|---|---|---|---|---|
| TC-001 / AC-001 | 删除前 `diff -r src public` | 仅 README 措辞差异与 `assets` 目录 | 输出 `diff -r src/README.md public/README.md`（标题与描述不同）+ `Only in public: assets`，无独有代码 | Pass | 终端输出 |
| TC-002 / AC-002 | `git status --short`、`ls src` | 7 个文件为 `D`，目录不存在 | `D src/README.md`、`admin.css`、`admin.html`、`admin.js`、`app.js`、`index.html`、`style.css` 共 7 条；`ls: cannot access 'src'` | Pass | 终端输出 |
| TC-003 / AC-003 | `git diff --name-only HEAD~1 HEAD` 统计 `^public/` | 无 `public/` 条目 | 改动 10 个路径，全部在 `docs/` 与 `src/` 下；`public/` 命中 0 条 | Pass | 终端输出 |
| TC-004 / AC-004 | 全库检索 `src/` 与「src 同步」表述 | 仅剩历史 SPEC 与 `src=` 属性等无关文本 | `docs/process/daily-update.md` 已改为单源口径并说明删除原因；`docs/README.md` 目录树已删 `src/`；剩余命中为 SPEC-011/012/023/024 历史记录与 HTML `src=` 属性 | Pass | Grep 结果 |
| TC-005 / AC-005 | `node scripts/check-links.mjs public`；推送后查 Actions 与线上 | 检查通过、工作流 success、首页 200 | 检查：`文件数：4｜站内引用：12` `全部通过`；`Check site assets`/`Deploy to GitHub Pages` 均 success(本次推送提交)；线上首页与后台 200 | Pass | 终端 + Actions API |
| TC-006 / AC-003 | 线上抽查 `/`、`/admin.html`、`/assets/ip-nomi.jpg` | 全部 200，页面未变 | 三项均 HTTP 200 | Pass | curl 输出 |

## 缺陷与回归

- 本轮无新增缺陷。删除为纯文件移除，`public/` 零改动，页面行为不可能变化（TC-003 已验证）。
- 回归范围：资源检查（SPEC-024 守卫）在删除后仍通过，说明检查脚本本身不依赖 `src/`。
- 未执行：无。

## 合并与备份记录

- 合并 SHA：`22f8db3`（删除与文档）、本报告合并提交
- 远端：https://github.com/ying062/NOMI-personal-site.git
- 远端 main：推送后核对（见交付回复中的实际 SHA）
- 发布标签：`v1.0.0` 仍指向 `5b71911`（发布版本不变，本轮属仓库整理，不重打标签）
- 回退：`git revert 22f8db3` 可完整恢复 `src/` 七个文件
