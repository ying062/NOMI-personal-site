# SPEC-013：V0.2 Supabase 数据后台

- 日期：2026-11-11
- 状态：Ready
- 分支：docs/SPEC-013-supabase-backoffice
- 依据：[Supabase Auth](https://supabase.com/docs/guides/auth)、[RLS](https://supabase.com/docs/guides/database/secure-data)

## 目标

取消前台留言邮件通知，建立登录保护的 Supabase 后台，保存并管理留言，统计 UV、PV 和按日期的访问趋势。前台仍可公开提交留言，但留言内容只能由认证管理员查看。

## 用户与权限

- 访客：匿名写入留言和访问事件；不能读取、修改或删除任何留言/统计。
- 管理员：Supabase Auth 登录后查看统计、查看留言、标记已读、删除留言。
- 服务角色密钥只放服务端/Edge Function secrets，绝不进入浏览器；前端只使用 publishable/anon key，并由 RLS 限权。
- 管理员账号不开放公开注册，由项目初始化时邀请或在后台创建。

## 数据模型草案

- messages：id、name、wechat、content、created_at、is_read、read_at、deleted_at（软删除可选；最终按删除审计策略确认）。
- page_views：id、visitor_id、path、created_at、user_agent 摘要（不保存不必要的完整指纹）。
- daily_stats：按日期聚合 pv、uv；可由查询或定时聚合生成，不接受前端直接写入聚合结果。
- admin_profiles：auth user id、role、created_at。

## 前台行为

提交成功以数据库真实写入为准，显示“留言已发送，谢谢你的分享”改为“留言已收到，谢谢你的分享”；失败保留输入并允许重试；不再调用 Web3Forms。每次页面加载记录一次 PV，并使用本地随机 visitor_id 计算 UV；需要在隐私说明中告知统计用途和保留策略。

## 后台页面

登录页 → 数据看板（今日/累计 PV、UV、留言总数、未读数、按日趋势）→ 留言列表（时间、昵称、微信号、内容摘要、已读状态）→ 留言详情（完整内容、标记已读、删除）。删除操作需确认；删除后不再出现在默认列表。

## 验收标准

- AC-013-01：未登录访问后台被重定向登录，不能通过前端改 URL 绕过。
- AC-013-02：访客可提交留言，管理员可在后台看到完整内容；访客不可读取列表。
- AC-013-03：管理员可查看、标记已读、删除，刷新后状态保持。
- AC-013-04：看板展示 PV、UV、留言数和日期趋势，统计结果与测试事件可核对。
- AC-013-05：前台不再请求 Web3Forms，浏览器和构建产物不包含收件邮箱。
- AC-013-06：RLS 覆盖所有业务表；服务角色密钥不进入前端。
- AC-013-07：异常有明确反馈：未登录、网络失败、重复提交、删除失败。

## 依赖与未决项

需要创建 Supabase 项目、配置 URL 与 publishable key、建立 SQL/RLS 迁移、确定管理员账号、访问统计匿名化和数据保留期限；真实部署域名和 Auth 邮件发送配置也待定。
