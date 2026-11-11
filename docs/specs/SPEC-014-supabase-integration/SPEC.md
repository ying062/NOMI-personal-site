# SPEC-014：Supabase 前台入库与后台

- 日期：2026-11-11
- 状态：In Progress
- 分支：feat/SPEC-014-supabase-integration
- 项目：https://znyaypduzphcbnvfjcah.supabase.co

## 目标

前台留言直接写入 Supabase messages，停止 Web3Forms；页面加载记录 page_views；admin.html 使用 Supabase Auth 登录后查看留言和 PV/UV。

## 交付

- supabase-schema.sql：表、约束和 RLS 初始脚本。
- public/admin.html：登录保护看板。
- 前台 app.js：留言入库和访问事件记录。
- publishable key 可在浏览器使用；service role 不进入前端。

## 验收

- AC-014-01：匿名访客可提交留言但不能读取留言列表。
- AC-014-02：管理员登录后可查看、标记已读和删除。
- AC-014-03：看板显示留言数、未读数、PV、UV 与日期趋势。
- AC-014-04：前台不调用 Web3Forms，不发送邮件。
- AC-014-05：未登录访问 admin 被阻止；RLS 脚本可在 SQL Editor 执行。

## 待配置

需在 Supabase SQL Editor 执行脚本；创建管理员 Auth 用户（邮箱 chenziying62@proton.me）；确认该邮箱在 JWT 中用于 RLS。
