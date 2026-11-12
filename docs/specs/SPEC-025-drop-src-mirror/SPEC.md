# SPEC-025：删除 src 镜像，确立单一源码目录

- 状态：Merged
- 日期：2026-11-12
- 分支：`chore/SPEC-025-drop-src-mirror`
- 关联：SPEC-023（内联脚本双份代码导致登录故障）、SPEC-024（日常更新速查）

## 目标与范围

用户问题：仓库里 `src/` 与 `public/` 存放两份完全相同的站点代码，`src/` 并不上线。两份各自演化是 SPEC-023 登录故障的直接成因（内联副本缺失闭合括号 + 缺搜索逻辑）。经用户确认，删除 `src/`，只保留 `public/` 作为唯一源码与上线源。

成功标准：

- `src/` 目录从工作区与仓库中移除，历史仍可从 Git 追溯
- 站点行为零变化（`public/` 未改动一个字节）
- 文档不再指示「改完 public 再同步 src」
- 资源检查与部署流水线仍通过

不包含：不改 `public/` 下任何文件；不动 Supabase；不调整 Pages 发布路径。

## 需求与验收

| 需求 ID | 行为与规则 | 验收 ID / Given-When-Then | 用例 ID |
|---|---|---|---|
| REQ-001 | 删除前确认 `src/` 无 `public/` 之外的内容 | AC-001 Given 两目录，When 递归 diff，Then 差异仅 README 措辞与 `public/assets`，无独有代码 | TC-001 |
| REQ-002 | 删除 `src/` 全部 7 个文件 | AC-002 Given 删除后，When `git status`，Then 7 个文件均为 `D` 且工作区无 `src/` | TC-002 |
| REQ-003 | `public/` 内容不得变动 | AC-003 Given 本轮提交，When `git diff --stat`，Then 无 `public/` 条目 | TC-003 |
| REQ-004 | 文档改为「单一源」口径 | AC-004 Given 文档，When 检索 `src/` 同步说明，Then 仅剩历史 SPEC 中的记录 | TC-004 |
| REQ-005 | 资源检查与线上发布不受影响 | AC-005 Given 删除后，When 跑检查并推送，Then 检查通过、Actions success、线上 200 | TC-005 |

## 实现方案

- `git rm -r src`：7 个文件（`index.html`、`admin.html`、`app.js`、`admin.js`、`style.css`、`admin.css`、`README.md`）退出索引，历史保留在提交 `94fd815` 及之前。
- `docs/process/daily-update.md`：目录表收敛为单行 `public/`，并说明删除原因，避免后来自行「再建一个 src」。
- `docs/README.md`：目录树删除 `src/`，`public/` 标注为唯一源码与上线目录；补 `process/daily-update.md`、`process/edgeone-deployment.md` 两个实际存在的文件；删掉「当前无网站代码」这句过期描述。
- 历史 SPEC（011/012/023/024）中提及 `src/` 的段落**保留原文**，它们记录的是当时事实，不改写。

## 开发任务

- [x] REQ-001 删除前完整性比对
- [x] REQ-002 删除目录
- [x] REQ-004 文档改口径
- [x] REQ-005 检查与发布复验

## 测试计划

| 用例 ID | 验收 ID | 前置条件与输入 | 操作或命令 | 预期结果 |
|---|---|---|---|---|
| TC-001 | AC-001 | 删除前 | `diff -r src public` | 仅 README 措辞差异 + `Only in public: assets` |
| TC-002 | AC-002 | 已删除 | `git status --short` / `ls src` | 7 个 `D` 记录，目录不存在 |
| TC-003 | AC-003 | 提交后 | `git diff --name-only HEAD~1 HEAD` | 无 `public/` 路径 |
| TC-004 | AC-004 | 已改文档 | 全库检索 `src/` | 仅命中历史 SPEC 与 `src=` 属性等无关文本 |
| TC-005 | AC-005 | 推送后 | `node scripts/check-links.mjs public` + Actions + curl | 检查通过、工作流 success、首页 200 |

## 风险与未决事项

- 若本地磁盘上 `src/` 有未提交的改动，`rm -rf` 会丢失。执行前已用 `diff -r` 确认与 `public/` 一致，且 `git status` 无 `src/` 下的未跟踪文件。
- 回退：`git revert` 本轮删除提交即可恢复目录。

## 交付与回退

- 合并门槛：TC-001~005 通过。
- 回退步骤：`git revert <删除提交>`；或从 `v1.0.0` 取回该批文件。

## 变更记录

- 2026-11-12 建立并执行；用户确认删除。
- 2026-11-12 推送阶段 github.com 传输中断，改经 GitHub REST API 提交；补 LF 行尾修正提交，最终远端树与本地一致（详见 TEST-REPORT 合并记录）。
