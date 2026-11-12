# SPEC-022 测试报告

- 结论：Pass
- 日期：2026-11-12，执行人：WorkBuddy（本地执行），分支：chore/SPEC-022-github-pages，被测 SHA：a0ecae5
- 环境：Windows 11，Git Bash，curl 8.x；GitHub Actions `ubuntu-latest`
- 站点地址：https://ying062.github.io/NOMI-personal-site/
- SPEC：同目录 SPEC.md

| 用例 / 验收 ID | 实际命令或操作 | 预期 | 实际 | 状态 | 证据 |
|---|---|---|---|---|---|
| TC-022-01 / AC-022-01 | 推送 main 后查询 `GET /repos/ying062/NOMI-personal-site/actions/runs?per_page=1` | Pages 任务 success | run 43173287643 `completed / success`，SHA `a0ecae5` | Pass | https://github.com/ying062/NOMI-personal-site/actions/runs/43173287643 |
| TC-022-02 / AC-022-02 | `curl -L https://ying062.github.io/NOMI-personal-site/` | 200 且渲染首页 | 200，`text/html`，5994B，`<title>NOMI · 慢慢构建自己的世界</title>` | Pass | 本报告 |
| TC-022-03 / AC-022-03 | `curl` 请求 `/style.css`、`/app.js`、`/assets/ip-nomi.jpg`、`/assets/word-works/image1.jpeg`、`/assets/hanfu-lotus.jpg`、`/assets/new-1.jpg` | 全部 200 且类型正确 | 全部 200；CSS `text/css`、JS `application/javascript`、图片 `image/jpeg` | Pass | 本报告 |
| TC-022-04 / AC-022-04 | `curl` 请求 `/admin.html`、`/admin.js`、`/admin.css` | 200 且无 404 | 200 / 200 / 200 | Pass | 本报告 |

## 缺陷与回归

- DEF-022-01（已解决）：首次运行在 `Setup Pages` 步骤失败，原因是 GITHUB_TOKEN 无权自动开启 Pages。由仓库所有者在 Settings → Pages → Source 选择「GitHub Actions」后重跑，成功。
- 未执行项：Supabase 留言提交、PV/UV 统计、管理员登录属写入类操作，会污染生产数据，本轮只验证页面与静态资源可达，功能回归待用户在实际地址上确认。

## 合并与备份记录

- 审查结论：Pages 自动化发布链路打通，线上公开可访问。
- main 合并 SHA：见本轮合并提交（合并后补记）。
- origin：https://github.com/ying062/NOMI-personal-site.git，推送后 `git rev-parse main` 与 `git ls-remote origin refs/heads/main` 一致。
- 发布标签：未打标签（v1.0 标签待 Supabase 功能回归后打）。
