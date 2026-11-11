# 本地预览

PowerShell 无需 Node/npm 即可启动：

```powershell
cd "D:\个人网站"
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

打开 `http://localhost:8080/index.html`，后台打开 `http://localhost:8080/admin.html`。按 Ctrl+C 停止。
