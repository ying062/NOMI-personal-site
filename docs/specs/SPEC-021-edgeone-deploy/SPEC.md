# SPEC-021：EdgeOne Pages 首次部署与 GitHub 同步

- 状态：Verified
- 日期：2026-11-12
- 分支：chore/SPEC-021-edgeone-deploy
- 对应版本：v1.0（候选）

## 目标与范围

把已完成的静态站点（`public/`）部署到腾讯云 EdgeOne Pages 生产环境，并确认 GitHub 远端备份与本地一致。本轮只做部署与记录，不改动站点代码、不改 Supabase 数据结构。

包含：CLI 部署一次生产版本、记录项目/部署标识与访问地址、验证首页与后台页面可访问、确认 `main` 与远端 SHA 一致、补充部署文档。
不包含：自定义域名绑定与 ICP 备案、CDN 缓存策略调优、CI 自动部署、V1.0 打标签。

## 需求与验收

| 需求 ID | 行为与规则 | 验收 ID / Given-When-Then | 用例 ID |
|---|---|---|---|
| REQ-021-01 | `public/` 目录部署为 EdgeOne Pages 项目 `nomi-personal-site` 生产版本 | AC-021-01 Given 已登录 EdgeOne CLI，When 执行部署命令，Then 返回 success 与 deploymentId | TC-021-01 |
| REQ-021-02 | 线上地址可公开打开首页、后台页与静态资源，不依赖临时 token | AC-021-02 Given 打开部署域名，When 不带任何 token 参数访问 `/`、`/admin.html`、`/style.css`，Then 均返回 200 | TC-021-02 |
| REQ-021-03 | GitHub 远端为最新备份 | AC-021-03 Given 本地 main 已合并，When 对比 `git rev-parse main` 与 `git ls-remote origin refs/heads/main`，Then SHA 相同 | TC-021-03 |
| REQ-021-04 | 部署信息与访问限制写入文档，供后续回退 | AC-021-04 Given 阅读 docs/process/edgeone-deployment.md，When 查看部署记录章节，Then 含项目 ID、部署 ID、控制台地址与回退方式 | TC-021-04 |

## 实现方案

- 部署方式：EdgeOne CLI 直传静态目录，不依赖构建命令。命令为 `edgeone makers deploy public -n nomi-personal-site -e production --skip-ai-gateway-sync`。
- 配置：仓库根 `edgeone.json` 保留 `outputDirectory: public`、`buildCommand: ""`，仅作为 GitHub 导入方式的说明，CLI 直传时以命令行目录参数为准。
- 凭据：CLI 登录态存放在用户目录 `~/.edgeone`，仓库内不落任何 token；`.gitignore` 增加 `.edgeone/`、`.tef_dist/`、`.env`。
- 访问控制：EdgeOne 新项目默认只给出带 `eo_token` 的预览链接（`*.edgeone.cool`），未公开时返回 401。公开访问需在控制台开启项目公开或绑定域名；中国大陆区域的自定义域名需 ICP 备案。
- 受影响文件：`.gitignore`、`docs/process/edgeone-deployment.md`、本轮 SPEC 与 TEST-REPORT。

## 开发任务

- [x] 关联 REQ-021-01：完成首次 CLI 部署
- [x] 关联 REQ-021-03：核对 GitHub 远端 SHA
- [ ] 关联 REQ-021-02：控制台开启公开访问后复验线上地址
- [x] 关联 REQ-021-04：补部署记录与回退说明

## 测试计划

| 用例 ID | 验收 ID | 前置条件与输入 | 操作或命令 | 预期结果 |
|---|---|---|---|---|
| TC-021-01 | AC-021-01 | 已 `edgeone login`，工作空间 makers-workspace | `edgeone makers deploy public -n nomi-personal-site -e production --json` | 输出 `status: success` 并给出 deploymentId |
| TC-021-02 | AC-021-02 | 部署完成并已公开 | `curl -o /dev/null -w "%{http_code}" https://<部署域名>/`、`/admin.html`、`/style.css`、`/assets/ip-nomi.jpg` | 全部 200 |
| TC-021-03 | AC-021-03 | 本地 main 干净 | `git rev-parse main` 与 `git ls-remote origin refs/heads/main` | 两个 SHA 相同 |
| TC-021-04 | AC-021-04 | 文档已更新 | 阅读 docs/process/edgeone-deployment.md | 含项目/部署 ID、控制台地址、回退步骤 |

## 风险与未决事项

- 公开访问依赖控制台操作，若用户未开启或不绑定域名，线上地址对访客仍是 401，属阻塞项，本轮不得宣称站点已上线。
- 中国大陆区域自定义域名需备案，未备案前只能用平台默认域名或预览链接。
- Supabase 生产 URL 与 Auth 配置未在本轮验证，留言、PV/UV、管理员登录需在实际公开地址上复测。

## 交付与回退

- 合并门槛：TC-021-01、TC-021-03、TC-021-04 通过；TC-021-02 通过后方可把站点标为已上线。
- 回退：站点代码用 `git revert`；部署回退在 EdgeOne 控制台「部署记录」选择上一版本重新发布；CLI 可重新执行 `edgeone makers deploy public -n nomi-personal-site -e production` 覆盖。

## 变更记录

- 2026-11-12：建立本轮 SPEC，记录首次 CLI 部署结果与公开访问受限问题。
