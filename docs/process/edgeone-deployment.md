# 部署说明（EdgeOne Pages / GitHub Pages）

当前线上发布方式为 GitHub Pages：推送 `main` 后由 `.github/workflows/deploy-pages.yml` 自动把 `public/` 发布到 https://ying062.github.io/NOMI-personal-site/ 。EdgeOne 的配置与结论保留在下方，作为取得备案域名后的备选。

## GitHub Pages（当前使用）

- 工作流：`.github/workflows/deploy-pages.yml`，`push` 到 `main` 或手动触发。
- 仓库设置：Settings → Pages → Source 必须为「GitHub Actions」。
- 发布目录：`public`，无构建步骤。
- 访问：https://ying062.github.io/NOMI-personal-site/ ，后台 https://ying062.github.io/NOMI-personal-site/admin.html 。
- 回退：`git revert` 对应提交；或在 Actions 中重跑上一条成功的运行。

## EdgeOne Pages（备选，暂不可公开访问）

本项目是纯静态前端，前端输出目录为 `public`，不需要构建命令。EdgeOne Pages 支持连接 GitHub 自动部署，也支持上传文件夹或 ZIP。

## GitHub 部署配置

- 仓库：`ying062/NOMI-personal-site`
- 根目录：`/`
- 框架预设：Other / Static
- 构建命令：留空
- 输出目录：`public`
- 安装命令：留空

部署完成后测试：

- `/index.html` 前台
- `/admin.html` 后台
- Supabase 留言入库
- PV / UV 统计
- 管理员登录、已读和删除

EdgeOne 官方说明：导入 GitHub 仓库时可自定义根目录、构建命令和输出目录；静态站点需要确保输出目录包含 `index.html` 和全部资源。

## CLI 直传部署记录（2026-11-12）

- 账号：腾讯云 100054986316，工作空间 makers-workspace（zone-3xaqkqlha1rg，Free）
- 项目：nomi-personal-site，Project ID `makers-qpo94orkmjpv`，区域 global（不含中国大陆节点），环境 production
- 本次部署：Deployment ID `dpty7g9vlc3j`
- 部署命令：

```bash
npx edgeone@latest login -s china --no-browser
npx edgeone@latest makers deploy public -n nomi-personal-site -e production --skip-ai-gateway-sync --json
```

- 控制台：https://console.cloud.tencent.com/edgeone/pages/project/makers-qpo94orkmjpv
- 已知限制：新项目默认只发放带 `eo_token` 的临时预览链接（`*.edgeone.cool`），未公开时访客访问返回 401。需在控制台开启项目公开访问或绑定域名；中国大陆区域自定义域名需 ICP 备案，未备案前不能用自有域名。
- 登录态存放在 `~/.edgeone`，不进入仓库；`.gitignore` 已忽略 `.edgeone/`、`.tef_dist/`、`.env`。
- 回退：控制台「部署记录」选择上一版本重新发布，或用同一命令重新直传当前 `public/`。
