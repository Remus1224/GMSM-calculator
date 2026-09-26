param(
    [int]$Port = 8765
)

$ErrorActionPreference = 'Stop'

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$rootPrefix = $repoRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$previewUrl = "http://127.0.0.1:$Port/beta/light-sanctum-pray/"

function Get-ContentType([string]$Path) {
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        '.html' { return 'text/html; charset=utf-8' }
        '.htm'  { return 'text/html; charset=utf-8' }
        '.js'   { return 'text/javascript; charset=utf-8' }
        '.css'  { return 'text/css; charset=utf-8' }
        '.json' { return 'application/json; charset=utf-8' }
        '.txt'  { return 'text/plain; charset=utf-8' }
        '.md'   { return 'text/plain; charset=utf-8' }
        '.svg'  { return 'image/svg+xml' }
        '.png'  { return 'image/png' }
        '.jpg'  { return 'image/jpeg' }
        '.jpeg' { return 'image/jpeg' }
        '.gif'  { return 'image/gif' }
        '.webp' { return 'image/webp' }
        '.ico'  { return 'image/x-icon' }
        '.wav'  { return 'audio/wav' }
        '.mp3'  { return 'audio/mpeg' }
        '.ogg'  { return 'audio/ogg' }
        '.m4a'  { return 'audio/mp4' }
        '.woff' { return 'font/woff' }
        '.woff2'{ return 'font/woff2' }
        default { return 'application/octet-stream' }
    }
}

function Send-Response(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [string]$ContentType,
    [byte[]]$Body,
    [bool]$SendBody
) {
    if ($null -eq $Body) { $Body = [byte[]]@() }
    $header = "HTTP/1.1 $StatusCode $StatusText`r`n" +
              "Content-Type: $ContentType`r`n" +
              "Content-Length: $($Body.Length)`r`n" +
              "Cache-Control: no-store, no-cache, must-revalidate, max-age=0`r`n" +
              "Pragma: no-cache`r`n" +
              "Expires: 0`r`n" +
              "Connection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if ($SendBody -and $Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
    $Stream.Flush()
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)

try {
    $listener.Start()
} catch {
    Write-Host ''
    Write-Host "無法啟動本機預覽伺服器，Port $Port 可能已被使用。" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor DarkRed
    exit 1
}

Write-Host ''
Write-Host 'GMSM Light Sanctum Beta 本機預覽已啟動' -ForegroundColor Green
Write-Host "Branch 測試網址：$previewUrl" -ForegroundColor Cyan
Write-Host "服務根目錄：$repoRoot"
Write-Host '請保持這個視窗開啟；測試完成後按 Ctrl+C 關閉。' -ForegroundColor Yellow
Write-Host ''

try {
    Start-Process $previewUrl
} catch {
    Write-Host "無法自動開啟瀏覽器，請手動開啟：$previewUrl" -ForegroundColor Yellow
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 8192, $true)
            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }

            do {
                $line = $reader.ReadLine()
            } while ($null -ne $line -and $line.Length -gt 0)

            $parts = $requestLine.Split(' ')
            if ($parts.Length -lt 2) {
                $body = [System.Text.Encoding]::UTF8.GetBytes('Bad Request')
                Send-Response $stream 400 'Bad Request' 'text/plain; charset=utf-8' $body $true
                continue
            }

            $method = $parts[0].ToUpperInvariant()
            $target = $parts[1]
            $sendBody = $method -ne 'HEAD'
            if ($method -ne 'GET' -and $method -ne 'HEAD') {
                $body = [System.Text.Encoding]::UTF8.GetBytes('Method Not Allowed')
                Send-Response $stream 405 'Method Not Allowed' 'text/plain; charset=utf-8' $body $sendBody
                continue
            }

            $pathOnly = ($target -split '\?', 2)[0]
            try {
                $decodedPath = [System.Uri]::UnescapeDataString($pathOnly)
            } catch {
                $decodedPath = $pathOnly
            }
            $relativePath = $decodedPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }

            $candidate = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $relativePath))
            $insideRoot = $candidate.Equals($repoRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
                          $candidate.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)
            if (-not $insideRoot) {
                $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
                Send-Response $stream 403 'Forbidden' 'text/plain; charset=utf-8' $body $sendBody
                continue
            }

            if ([System.IO.Directory]::Exists($candidate)) {
                $candidate = Join-Path $candidate 'index.html'
            }

            if (-not [System.IO.File]::Exists($candidate)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Not Found: $decodedPath")
                Send-Response $stream 404 'Not Found' 'text/plain; charset=utf-8' $body $sendBody
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($candidate)
            Send-Response $stream 200 'OK' (Get-ContentType $candidate) $bytes $sendBody
        } catch {
            try {
                if ($null -ne $stream -and $stream.CanWrite) {
                    $body = [System.Text.Encoding]::UTF8.GetBytes('Internal Server Error')
                    Send-Response $stream 500 'Internal Server Error' 'text/plain; charset=utf-8' $body $true
                }
            } catch {}
            Write-Host $_.Exception.Message -ForegroundColor DarkYellow
        } finally {
            if ($null -ne $client) { $client.Close() }
        }
    }
} finally {
    $listener.Stop()
}
