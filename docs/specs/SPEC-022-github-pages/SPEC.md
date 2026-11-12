# SPEC-022：改用 GitHub Pages 发布公开站点

- 状态：In Progress
- 日期：2026-11-12
- 分支：chore/SPEC-022-github-pages
- 关联：SPEC-021（EdgeOne 部署受阻，见其 TEST-REPORT）

## 目标与范围

在无自有域名、无 ICP 备案的前提下，让站点拥有一个稳定、公开、可分享的访问地址，并保持与 GitHub 仓库同步更新。做法是用 GitHub Actions 把 `public/` 目录发布到 GitHub Pages，推送 main 后自动重新发布。

包含：Pages 工作流、仓库 Pages 源配置说明、线上可访问性验证、文档记录。
不包含：自定义域名绑定、CDN 调优、把 Supabase 生产 URL 写入密钥管理以外的改动。

## 需求与验收

| 需求 ID | 行为与规则 | 验收 ID / Given-When-Then | 用例 ID |
|---|---|---|---|
| REQ-022-01 | 推送到 main 时自动把 `public/` 发布到 GitHub Pages | AC-022-01 Given 工作流已配置，When 推送到 main，Then Actions 中 Pages 部署任务成功 | TC-022-01 |
| REQ-022-02 | 线上地址公开可访问且不依赖登录 | AC-022-02 Given 无痕浏览器，When 访问 `https://ying062.github.io/NOMI-personal-site/`，Then 返回 200 且渲染首页 | TC-022-02 |
| REQ-022-03 | 首页引用的 CSS/JS/图片在子路径下正常加载 | AC-022-03 Given 站点部署在 `/NOMI-personal-site/` 子路径，When 请求 `style.css`、`app.js`、`assets/ip-nomi.jpg`，Then 均 200 | TC-022-03 |
| REQ-022-04 | 后台页面可访问且指向同一 Supabase 项目 | AC-022-04 Given 访问 `/admin.html`，When 页面加载，Then 显示登录框且无资源 404 | TC-022-04 |

## 实现方案

- 新增 `.github/workflows/deploy-pages.yml`：`actions/checkout@v4` → `actions/configure-pages@v5` → `actions/upload-pages-artifact@v3`（`path: public`）→ `actions/deploy-pages@v4`。
- 权限：`contents: read`、`pages: write`、`id-token: write`；并发组 `pages`，不取消进行中的发布。
- 触发：`push` 到 `main` 与手动 `workflow_dispatch`。
- 站点为纯静态，无构建步骤，直接上传 `public`。HTML 内资源引用为相对路径（`./style.css`），在 `/NOMI-personal-site/` 子路径下可用；Supabase 端点为绝对地址，不受子路径影响。
- 仓库自身需要把 Pages 的 Source 设为「GitHub Actions」，属仓库设置项，需账号所有者在网页端确认一次。
- 受影响文件：`.github/workflows/deploy-pages.yml`、本轮 SPEC 与 TEST-REPORT、部署文档。

## 开发任务

- [x] 关联 REQ-022-01：编写 Pages 工作流
- [ ] 关联 REQ-022-01：仓库 Pages Source 设为 GitHub Actions（需用户操作）
- [ ] 关联 REQ-022-02/03/04：首次发布后线上验证

## 测试计划

| 用例 ID | 验收 ID | 前置条件与输入 | 操作或命令 | 预期结果 |
|---|---|---|---|---|
| TC-022-01 | AC-022-01 | 工作流已合入 main，Pages Source 已设为 GitHub Actions | 推送 main 后在仓库 Actions 查看 `Deploy to GitHub Pages` | 任务 success，deploy 步骤输出 page_url |
| TC-022-02 | AC-022-02 | 发布完成 | `curl -o /dev/null -w "%{http_code}" https://ying062.github.io/NOMI-personal-site/` | 200，且正文含 `NOMI` |
| TC-022-03 | AC-022-03 | 同上 | `curl` 请求 `style.css`、`app.js`、`assets/ip-nomi.jpg` | 全部 200，Content-Type 正确 |
| TC-022-04 | AC-022-04 | 同上 | `curl` 请求 `admin.html` | 200，含登录表单节点 |

## 风险与未决事项

- GitHub Pages 在中国大陆访问速度不稳定，可能出现加载慢；若后续拿到备案域名，可迁移回 EdgeOne，站点代码无需改动。
- 仓库必须为公开仓库，Private 仓库发布 Pages 需付费方案（当前 `git ls-remote` 可匿名读取，判断为公开）。
- Supabase 的匿名写入策略沿用现状，本轮的公开地址会让更多人可提交留言，需保持 RLS 开启。

## 交付与回退

- 合并门槛：TC-022-01 至 TC-022-04 通过。
- 回退：删除或禁用工作流并在仓库设置中关闭 Pages；代码回退用 `git revert`。EdgeOne 侧项目可保留不删，作为后续绑定域名后的备选。

## 变更记录

- 2026-11-12：建立本轮 SPEC，起因是 EdgeOne 无域名无法公开访问。
