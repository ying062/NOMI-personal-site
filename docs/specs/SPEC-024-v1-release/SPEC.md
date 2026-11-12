# SPEC-024：v1.0 版本锚点与资源守卫

- 状态：Merged
- 日期：2026-11-12
- 分支：`chore/SPEC-024-v1-release`
- 对应版本：v1.0.0

## 目标与范围

用户问题：站点已在 GitHub Pages 上线、后台登录已修复，但缺少两样东西 —— ① 一个可回滚的版本锚点；② 一道自动防线，避免以后改文件名/删文件导致线上 404（SPEC-023 的内联脚本问题就是同类「改了 A 忘了 B」）。

成功标准：

- `v1.0.0` 标签打在验证通过的 main 提交上，并已推送到远端
- 每次推送（含 PR）自动校验 `public/` 下所有站内引用都能落地
- 部署流水线在资源检查失败时**不发布**，线上保留上一版
- 有一份可照着做的日常更新速查文档

不包含：不改任何页面视觉与交互，不动 Supabase 数据，不引入第三方依赖或构建工具。

## 需求与验收

| 需求 ID | 行为与规则 | 验收 ID / Given-When-Then | 用例 ID |
|---|---|---|---|
| REQ-001 | 提供离线可跑的站内资源检查脚本，扫描 HTML 的 `src`/`href`/`poster`/`srcset` 与 CSS 的 `url()`，跳过 http(s)、`mailto:`、`tel:`、`javascript:`、`data:`、`#片段` | AC-001 Given 现有站点，When 运行脚本，Then 全部通过且退出码 0 | TC-001 |
| REQ-002 | 引用目标不存在时必须报错并列出「来源文件 → 引用 → 期望路径」，退出码非 0 | AC-002 Given 删掉/改名任一被引用图片，When 运行脚本，Then 退出码 1 且定位到具体引用 | TC-002 |
| REQ-003 | 站内片段引用（如 CSS `url(%23n)`）不得误报 | AC-003 Given CSS 中的编码片段引用，When 运行脚本，Then 不产生告警 | TC-003 |
| REQ-004 | CI 在 push main、PR 与手动触发时执行同一检查 | AC-004 Given 工作流文件，When 查看触发条件与步骤，Then 均调用 `node scripts/check-links.mjs public` | TC-004 |
| REQ-005 | 发布流水线先检查后发布，检查失败即中止 | AC-005 Given `deploy-pages.yml`，When 阅读步骤顺序，Then 「Check site assets」位于上传与部署之前 | TC-005 |
| REQ-006 | 文档给出日常更新的完整路径：改哪个目录、本地预览、自查、提交、推送、强刷 | AC-006 Given 新读者，When 阅读 `docs/process/daily-update.md`，Then 能独立完成一次改版上线 | TC-006 |
| REQ-007 | `v1.0.0` 标签指向已验证提交并与远端一致 | AC-007 Given 本地与远端，When 对比标签指向的 SHA，Then 一致 | TC-007 |

## 实现方案

- `scripts/check-links.mjs`：纯 Node（≥18），零依赖，递归遍历目标目录，正则抽取引用，`fs.stat` 校验存在性；目录引用落到其 `index.html`。解码后再判断是否片段引用，避免 `%23n` 误报。未做网络请求，因此 CI 稳定、不受外网影响。
- `.github/workflows/link-check.yml`：`push`(main) + `pull_request` + `workflow_dispatch`，Node 20，单 job 跑脚本。
- `.github/workflows/deploy-pages.yml`：在 `configure-pages` 之后、`upload-pages-artifact` 之前插入「Check site assets」步骤 —— 失败则不上传，Pages 保留上一版。
- `docs/process/daily-update.md`：速查文档，明确 `public/` 是唯一上线源、`src/` 为镜像需同步；收录缓存 10 分钟需 `Ctrl + F5`、内联脚本教训、密钥红线、EdgeOne 回退路径。
- `.gitignore` 增加 `/.workbuddy/`（本地工作记录，不入库）。
- 标签：`git tag -a v1.0.0`，附注写明版本内容，随 main 推送。

## 开发任务

- [x] REQ-001/002/003 资源检查脚本（含编码片段处理）
- [x] REQ-004 独立检查工作流
- [x] REQ-005 发布流水线前置检查
- [x] REQ-006 日常更新速查文档
- [x] REQ-007 打标签并推送

## 测试计划

| 用例 ID | 验收 ID | 前置条件与输入 | 操作或命令 | 预期结果 |
|---|---|---|---|---|
| TC-001 | AC-001 | 当前 `public/` | `node scripts/check-links.mjs public` | 全部通过，退出码 0 |
| TC-002 | AC-002 | 复制 `public/` 到临时目录并改名 `assets/ip-nomi.jpg` | 对临时目录运行脚本 | 退出码 1，报出 `index.html -> ./assets/ip-nomi.jpg` |
| TC-003 | AC-003 | `style.css` 含 `url(%23n)` | 同 TC-001 | 不出现片段引用误报 |
| TC-004 | AC-004 | 工作流文件 | 检查 `on` 与 steps | 三处触发齐全，步骤调用脚本 |
| TC-005 | AC-005 | `deploy-pages.yml` | 检查步骤顺序 | 检查在上传/部署之前 |
| TC-006 | AC-006 | 文档 | 通读 | 命令可执行、路径存在 |
| TC-007 | AC-007 | 本地与远端 | `git rev-parse v1.0.0` 对比 `git ls-remote --tags` | SHA 一致 |

## 风险与未决事项

- 检查只验证「文件存在」，不验证内容正确性（例如图片损坏、JS 语法错误）。JS 语法可用 `node --check` 单独把关，属后续增强，不阻塞本轮。
- `src/` 与 `public/` 双份代码仍有不同步风险，本轮仅在文档中约束，未删除 `src/`（删除需用户确认）。

## 交付与回退

- 合并门槛：TC-001~007 全过，无阻塞缺陷。
- 回退：`git revert` 对应提交；若为新版本行为异常，`git checkout v1.0.0` 或平台回滚到上一版部署。

## 变更记录

- 2026-11-12 建立并实现；同日合并 main、推送标签。
