# Vercel 部署说明

项目是静态站点，Vercel 输出目录为 `public`，不需要构建命令。

1. 登录 Vercel，选择 Add New → Project。
2. 导入项目 Git 仓库。
3. Framework Preset 选择 Other。
4. Build Command 留空。
5. Output Directory 填 `public`。
6. 部署后用正式 HTTPS 地址测试前台、留言、PV/UV 和 `/admin.html`。
7. 将正式域名加入 Supabase 的站点 URL/允许回调配置（如果启用 Auth 邮件流程）。

不要上传 Supabase service role key；当前前端只使用 publishable key。
