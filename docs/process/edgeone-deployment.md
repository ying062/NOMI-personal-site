# EdgeOne Pages 部署说明

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
