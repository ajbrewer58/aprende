$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:3000/")
$listener.Start()
Write-Host "Server started on http://localhost:3000"
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = $ctx.Request.Url.LocalPath
    $method = $ctx.Request.HttpMethod

    # Handle POST /api/seed - save word data to file
    if ($method -eq "POST" -and $path -eq "/api/seed") {
        $reader = [System.IO.StreamReader]::new($ctx.Request.InputStream)
        $body = $reader.ReadToEnd()
        $reader.Close()
        $seedFile = Join-Path "C:\Users\Admin\spanish-vocab-app" "seed-data.json"
        [System.IO.File]::WriteAllText($seedFile, $body, [System.Text.Encoding]::UTF8)
        $ctx.Response.ContentType = "application/json"
        $ctx.Response.Headers.Add("Access-Control-Allow-Origin", "*")
        $responseBytes = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true,"file":"seed-data.json"}')
        $ctx.Response.OutputStream.Write($responseBytes, 0, $responseBytes.Length)
        Write-Host "Saved seed data to $seedFile ($($body.Length) bytes)"
        $ctx.Response.Close()
        continue
    }

    # Handle CORS preflight
    if ($method -eq "OPTIONS") {
        $ctx.Response.Headers.Add("Access-Control-Allow-Origin", "*")
        $ctx.Response.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        $ctx.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
        $ctx.Response.StatusCode = 204
        $ctx.Response.Close()
        continue
    }

    # Static file serving
    if ($path -eq "/") { $path = "/index.html" }
    $file = Join-Path "C:\Users\Admin\spanish-vocab-app" $path.TrimStart("/")
    if (Test-Path $file) {
        $bytes = [IO.File]::ReadAllBytes($file)
        $ext = [IO.Path]::GetExtension($file)
        $mime = switch($ext) {
            ".html" {"text/html; charset=utf-8"}
            ".css"  {"text/css; charset=utf-8"}
            ".js"   {"application/javascript; charset=utf-8"}
            ".json" {"application/json; charset=utf-8"}
            default {"application/octet-stream"}
        }
        $ctx.Response.ContentType = $mime
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $ctx.Response.StatusCode = 404
    }
    $ctx.Response.Close()
}
