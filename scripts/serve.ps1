$root = (Resolve-Path (Join-Path $PSScriptRoot '..\public')).Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()
Write-Host 'NOMI site running at http://localhost:8080/'
Write-Host 'Admin: http://localhost:8080/admin.html'
Write-Host 'Press Ctrl+C to stop.'
while ($listener.IsListening) {
  $context = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
  if ([string]::IsNullOrWhiteSpace($path)) { $path = 'index.html' }
  $file = Join-Path $root ($path -replace '/', '\\')
  if (Test-Path $file -PathType Leaf) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
    if ($ext -eq '.html') { $context.Response.ContentType = 'text/html; charset=utf-8' }
    elseif ($ext -eq '.css') { $context.Response.ContentType = 'text/css; charset=utf-8' }
    elseif ($ext -eq '.js') { $context.Response.ContentType = 'text/javascript; charset=utf-8' }
    elseif ($ext -eq '.jpg' -or $ext -eq '.jpeg') { $context.Response.ContentType = 'image/jpeg' }
    elseif ($ext -eq '.png') { $context.Response.ContentType = 'image/png' }
    else { $context.Response.ContentType = 'application/octet-stream' }
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $context.Response.StatusCode = 404
    $message = [Text.Encoding]::UTF8.GetBytes('Not found')
    $context.Response.OutputStream.Write($message, 0, $message.Length)
  }
  $context.Response.Close()
}
