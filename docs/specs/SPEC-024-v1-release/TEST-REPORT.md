# SPEC-024 测试报告

- 结论：Pass
- 日期：2026-11-12
- 执行人：AI agent
- 分支：`chore/SPEC-024-v1-release` → `main`
- 被测 SHA：`5b71911`（main 最终提交，即 v1.0.0 指向的提交）
- 环境：Windows 10/11，Git Bash，Node v22（本地）；CI 为 GitHub Actions ubuntu-latest + Node 20
- SPEC：同目录 SPEC.md

| 用例 / 验收 ID | 实际命令或操作 | 预期 | 实际 | 状态 | 证据 |
|---|---|---|---|---|---|
| TC-001 / AC-001 | `node scripts/check-links.mjs public` | 全部通过，退出码 0 | `文件数：4｜站内引用：12` `结果：全部通过，未发现缺失资源。` 退出码 0 | Pass | 终端输出 |
| TC-002 / AC-002 | 复制 `public` 为 `.tmp-linkcheck`，`mv assets/ip-nomi.jpg assets/ip-nomi-renamed.jpg` 后 `node scripts/check-links.mjs .tmp-linkcheck` | 退出码 1 并定位引用 | `结果：1 处引用找不到目标文件` `index.html -> ./assets/ip-nomi.jpg (应为 assets\ip-nomi.jpg)` 退出码 1 | Pass | 终端输出 |
| TC-003 / AC-003 | 检查 `style.css` 中 `data:` URI 内的 `url(%23n)` | 不误报片段引用 | 首轮确实误报一次 `style.css -> %23n`；脚本改为「先解码再判断」后不再出现，引用总数由 13 降为 12 | Pass（含 1 次修复） | 终端输出 |
| TC-004 / AC-004 | `grep -nE "on:|push:|pull_request|workflow_dispatch|check-links" .github/workflows/link-check.yml` | 三处触发齐全并调用脚本 | 第 3-7 行为 `push[main]` / `pull_request` / `workflow_dispatch`；第 25 行 `run: node scripts/check-links.mjs public` | Pass | 工作流文件 |
| TC-005 / AC-005 | `grep -nE "name: |uses: " .github/workflows/deploy-pages.yml` | 检查步骤在上传与部署之前 | 第 32 行 `Check site assets`，第 35 行 `Upload static site`，第 40 行 `Deploy to GitHub Pages` | Pass | 工作流文件 |
| TC-006 / AC-006 | 通读 `docs/process/daily-update.md`，核对其中命令与路径 | 命令可执行、路径存在 | `scripts/serve.ps1`、`scripts/check-links.mjs`、`public/` 均存在；已删除误写的 `scripts/serve.mjs`（该文件不存在） | Pass | 文档 |
| TC-007 / AC-007 | `git rev-parse v1.0.0`、`git ls-remote`（经 api.github.com 核对） | 本地与远端一致 | 本地标签对象 `fea2bd6` → 指向提交 `5b71911`；远端 `refs/tags/v1.0.0` = `fea2bd6`；远端 main = `5b71911`，与本地一致 | Pass | API 返回 `refs/tags/v1.0.0 | tag fea2bd6`、`指向提交 5b71911 | 标签 v1.0.0` |
| TC-008 / AC-005 | 推送后查询 Actions 运行记录 | 两个工作流均成功 | `Check site assets` success(`5b71911`)、`Deploy to GitHub Pages` success(`5b71911`) | Pass | Actions API |
| TC-009（回归） | 线上抽查 `/`、`/admin.html`、`/style.css`、`/app.js`、`/admin.js`、`/assets/ip-nomi.jpg` | 全部 200 | 六项均 HTTP 200 | Pass | curl 输出 |

## 缺陷与回归

- DEF-024-01（已修复）：脚本对 CSS `data:image/svg+xml` 内嵌的 `url(%23n)` 误报为缺失文件 `#n`。原因是先做跳过判断、后做百分号解码。改为解码后再判断片段引用，TC-001/TC-003 重跑通过。
- DEF-024-02（已修复）：速查文档初稿写了并不存在的 `scripts/serve.mjs`。改为项目实际的 `scripts/serve.ps1` 并核对启动端口 8080。
- 未执行：未在本地实跑 GitHub Actions（依赖远端）；工作流语法以 YAML 结构人工核对，首次推送后由 Actions 实际运行结果确认。
- 不适用：浏览器层视觉回归 —— 本轮未改动任何页面样式或结构。

## 合并与备份记录

- 合并 SHA：`0007e2a`（代码与守卫）、`5b71911`（测试报告）
- 远端：https://github.com/ying062/NOMI-personal-site.git
- 远端 main = `5b71911`，与本地一致（经 api.github.com 核对）
- 发布标签：`v1.0.0`（附注标签，对象 `fea2bd6` → 提交 `5b71911`），已推送
- Actions：`Check site assets` 与 `Deploy to GitHub Pages` 在 `5b71911` 上均 success
- 线上回归：前台首页、`/admin.html`、CSS、两份 JS、头图均 200
- 过程异常：推送期间本机代理到 github.com 的隧道多次返回 `CONNECT tunnel failed, response 502`，直连亦不可用；重试后推送成功，SHA 已核对一致。属网络环境问题，与仓库内容无关。
