# 日常更新流程（速查）

给自己看的操作清单。改完内容到线上生效，一共 5 步。

## 0. 先明确：改哪个目录

| 目录 | 作用 | 是否上线 |
| --- | --- | --- |
| `public/` | **唯一上线源**，GitHub Pages 发布的就是它 | 是 |
| `src/` | 历史遗留镜像，内容与 `public/` 相同 | 否，但为了不出现两份不同代码，改完 `public/` 要同步过来 |

只改 `public/` 就够了。资源（图片等）放 `public/assets/`，HTML 里用相对路径引用，例如 `./assets/ip-nomi.jpg`。

## 1. 本地预览

双击 `public/index.html` 可以直接看，但留言、登录这类要请求接口的功能请用本地服务（否则会被浏览器的本地文件限制挡住）：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

然后打开 `http://localhost:8080/index.html`，后台是 `http://localhost:8080/admin.html`，`Ctrl + C` 停止。

## 2. 改完先自查资源引用

```bash
node scripts/check-links.mjs public
```

输出「全部通过」才算干净。改过图片文件名、删过文件时尤其要跑 —— 这条命令也挂在 CI 里，缺失资源会导致部署直接失败，线上停留在上一版。

## 3. 提交（不直接在 main 上改）

```bash
git switch -c feat/xxx        # 或 fix/ chore/ docs/
git add -A
git commit -m "feat: 一句话说明改了什么"
git switch main
git merge --no-ff feat/xxx -m "merge: feat/xxx"
```

## 4. 推送并等部署

```bash
git push origin main
```

推送后 GitHub Actions 会自动跑两件事：资源检查 → 发布到 Pages。大约 1 分钟。

看进度：https://github.com/ying062/NOMI-personal-site/actions

## 5. 强刷确认

打开线上地址，**按 `Ctrl + F5`**（Mac 是 `Cmd + Shift + R`）。

Pages 的 HTML 缓存是 `max-age=600`，普通刷新可能十分钟内还是旧页面 —— 这不是没发布成功，别急着回滚。

- 前台：https://ying062.github.io/NOMI-personal-site/
- 后台：https://ying062.github.io/NOMI-personal-site/admin.html

---

## 常见问题

**页面没变化**
先 `Ctrl + F5`。还不行就去 Actions 看最近一次运行是成功还是失败。

**Actions 报 `check-links` 失败**
说明某个 `src`/`href`/CSS `url()` 指向的文件不存在，日志里会列出「哪个文件 → 哪个引用 → 期望路径」。按提示补文件或改引用即可。

**改了 JS 但行为没变**
注意别再往 HTML 里写内联脚本（SPEC-023 的教训：内联副本和外部文件各自演化，语法一错整段脚本都不执行）。统一用 `<script src="./admin.js"></script>`。

**留言/登录要连数据库**
后台走 Supabase，前端用的是 publishable key（可以公开），**service_role key 绝对不能写进前端或提交到 Git**。

**想换回 EdgeOne**
`docs/process/edgeone-deployment.md` 有完整记录。前提是先有已备案域名，中国站没有备案域名无法公开访问。

## 发布记录

| 版本 | 提交 | 说明 |
| --- | --- | --- |
| v1.0.0 | 见 `git show v1.0.0` | 首个公开版本：前台 + Supabase 后台，GitHub Pages 托管 |
