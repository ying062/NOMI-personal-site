# SPEC-021 测试报告

- 结论：Blocked（部署与备份已通过，公开访问待控制台开启后复验）
- 日期：2026-11-12，执行人：WorkBuddy（本地执行），分支：chore/SPEC-021-edgeone-deploy，被测 SHA：560e675
- 环境：Windows 11，Git Bash，Node v22.22.2，npm 10.9.7，edgeone CLI 1.7.2
- 依赖：EdgeOne 工作空间 makers-workspace（zone-3xaqkqlha1rg，Free），腾讯云账号 100054986316
- SPEC：同目录 SPEC.md

| 用例 / 验收 ID | 实际命令或操作 | 预期 | 实际 | 状态 | 证据 |
|---|---|---|---|---|---|
| TC-021-01 / AC-021-01 | `npx edgeone@latest makers deploy public -n nomi-personal-site -e production --skip-ai-gateway-sync --json` | 返回 success 与 deploymentId | 返回 `status: success`，projectId `makers-qpo94orkmjpv`，deploymentId `dpty7g9vlc3j`，控制台 URL 正常 | Pass | 部署输出 JSON（本节记录） |
| TC-021-02 / AC-021-02 | `curl -o /dev/null -w "%{http_code}" https://nomi-personal-site-fotzncqx.edgeone.cool/`、`/index.html`、`/admin.html`、`/style.css`、`/assets/ip-nomi.jpg` | 全部 200 | 全部 401，响应体为 EdgeOne「401 UNAUTHORIZED：Please contact the site administrator to obtain a valid access link」 | Fail | 预览域名未公开，仅带 eo_token 的临时链接可用 |
| TC-021-02 补充 | 探测 `nomi-personal-site.edgeone.app`、`nomi-personal-site-fotzncqx.edgeone.app`、`nomi-personal-site.edgeone.cool` | 出现公开默认域名 | 均返回 404，说明尚无已绑定域名 | Blocked | 需控制台绑定域名或开启项目公开 |
| TC-021-03 / AC-021-03 | `git rev-parse main`、`git ls-remote origin refs/heads/main` | SHA 相同 | 均为 `560e6752851309b2a610ab06ad7ddac709f80cfe` | Pass | origin 为 https://github.com/ying062/NOMI-personal-site.git |
| TC-021-04 / AC-021-04 | 阅读 docs/process/edgeone-deployment.md | 含项目/部署 ID、控制台地址、回退步骤 | 本轮已补「CLI 部署记录」章节 | Pass | 同仓库文档 |

## 缺陷与回归

- DEF-021-01（阻塞）：EdgeOne 新项目默认只发放带 `eo_token` 的预览链接，未公开时访客访问返回 401。修复方式为在控制台开启公开访问或绑定域名；中国大陆区域自定义域名需 ICP 备案。
- 未执行项：Supabase 留言入库、PV/UV 统计、管理员登录均在公开地址上复测，本轮未做。

## 合并与备份记录

- 审查结论：部署与远端备份事实已核对；公开访问未通过，本轮不标记站点已上线。
- main 合并 SHA：待本轮合并后填写。
- origin：https://github.com/ying062/NOMI-personal-site.git，同步时间 2026-11-12，远端 main SHA `560e6752851309b2a610ab06ad7ddac709f80cfe`，与本地一致。
- 发布标签：未打标签。
