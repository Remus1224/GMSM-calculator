param(
    [int]$Port = 8765
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$rootPrefix = $repoRoot.TrimEnd([char]'\') + [char]'\'
$previewUrl = 'http://127.0.0.1:' + $Port + '/beta/light-sanctum-pray/'

function Get-ContentType([string]$Path) {
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        '.html'  { return 'text/html; charset=utf-8' }
        '.htm'   { return 'text/html; charset=utf-8' }
        '.js'    { return 'text/javascript; charset=utf-8' }
        '.css'   { return 'text/css; charset=utf-8' }
        '.json'  { return 'application/json; charset=utf-8' }
        '.txt'   { return 'text/plain; charset=utf-8' }
        '.md'    { return 'text/plain; charset=utf-8' }
        '.svg'   { return 'image/svg+xml' }
        '.png'   { return 'image/png' }
        '.jpg'   { return 'image/jpeg' }
        '.jpeg'  { return 'image/jpeg' }
        '.gif'   { return 'image/gif' }
        '.webp'  { return 'image/webp' }
        '.ico'   { return 'image/x-icon' }
        '.wav'   { return 'audio/wav' }
        '.mp3'   { return 'audio/mpeg' }
        '.ogg'   { return 'audio/ogg' }
        '.m4a'   { return 'audio/mp4' }
        '.woff'  { return 'font/woff' }
        '.woff2' { return 'font/woff2' }
        default  { return 'application/octet-stream' }
    }
}

function Send-Response {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$StatusText,
        [string]$ContentType,
        [byte[]]$Body,
        [bool]$SendBody
    )

    if ($null -eq $Body) {
        $Body = [byte[]]@()
    }

    $header = 'HTTP/1.1 ' + $StatusCode + ' ' + $StatusText + "`r`n"
    $header += 'Content-Type: ' + $ContentType + "`r`n"
    $header += 'Content-Length: ' + $Body.Length + "`r`n"
    $header += "Cache-Control: no-store, no-cache, must-revalidate, max-age=0`r`n"
    $header += "Pragma: no-cache`r`n"
    $header += "Expires: 0`r`n"
    $header += "Connection: close`r`n`r`n"

    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)

    if ($SendBody -and $Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }

    $Stream.Flush()
}

$listener = New-Object System.Net.Sockets.TcpListener -ArgumentList @([System.Net.IPAddress]::Loopback, $Port)

try {
    $listener.Start()
} catch {
    Write-Host ''
    Write-Host ('Could not start local preview server. Port ' + $Port + ' may already be in use.') -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor DarkRed
    exit 1
}

Write-Host ''
Write-Host 'GMSM Light Sanctum Beta local preview started.' -ForegroundColor Green
Write-Host ('URL: ' + $previewUrl) -ForegroundColor Cyan
Write-Host ('Root: ' + $repoRoot)
Write-Host 'Keep this window open while testing. Press Ctrl+C to stop.' -ForegroundColor Yellow
Write-Host ''

try {
    Start-Process $previewUrl
} catch {
    Write-Host ('Open this URL manually: ' + $previewUrl) -ForegroundColor Yellow
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $null

        try {
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader -ArgumentList @($stream, [System.Text.Encoding]::ASCII, $false, 8192, $true)
            $requestLine = $reader.ReadLine()

            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                continue
            }

            do {
                $line = $reader.ReadLine()
            } while ($null -ne $line -and $line.Length -gt 0)

            $parts = $requestLine.Split(' ')
            if ($parts.Length -lt 2) {
                $body = [System.Text.Encoding]::UTF8.GetBytes('Bad Request')
                Send-Response -Stream $stream -StatusCode 400 -StatusText 'Bad Request' -ContentType 'text/plain; charset=utf-8' -Body $body -SendBody $true
                continue
            }

            $method = $parts[0].ToUpperInvariant()
            $target = $parts[1]
            $sendBody = $method -ne 'HEAD'

            if ($method -ne 'GET' -and $method -ne 'HEAD') {
                $body = [System.Text.Encoding]::UTF8.GetBytes('Method Not Allowed')
                Send-Response -Stream $stream -StatusCode 405 -StatusText 'Method Not Allowed' -ContentType 'text/plain; charset=utf-8' -Body $body -SendBody $sendBody
                continue
            }

            $questionIndex = $target.IndexOf('?')
            if ($questionIndex -ge 0) {
                $pathOnly = $target.Substring(0, $questionIndex)
            } else {
                $pathOnly = $target
            }

            try {
                $decodedPath = [System.Uri]::UnescapeDataString($pathOnly)
            } catch {
                $decodedPath = $pathOnly
            }

            $relativePath = $decodedPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            if ([string]::IsNullOrWhiteSpace($relativePath)) {
                $relativePath = 'index.html'
            }

            $candidate = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $relativePath))
            $insideRoot = $candidate.Equals($repoRoot, [System.StringComparison]::OrdinalIgnoreCase) -or $candidate.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)

            if (-not $insideRoot) {
                $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
                Send-Response -Stream $stream -StatusCode 403 -StatusText 'Forbidden' -ContentType 'text/plain; charset=utf-8' -Body $body -SendBody $sendBody
                continue
            }

            if ([System.IO.Directory]::Exists($candidate)) {
                $candidate = Join-Path $candidate 'index.html'
            }

            if (-not [System.IO.File]::Exists($candidate)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes('Not Found: ' + $decodedPath)
                Send-Response -Stream $stream -StatusCode 404 -StatusText 'Not Found' -ContentType 'text/plain; charset=utf-8' -Body $body -SendBody $sendBody
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($candidate)
            $contentType = Get-ContentType $candidate
            Send-Response -Stream $stream -StatusCode 200 -StatusText 'OK' -ContentType $contentType -Body $bytes -SendBody $sendBody
        } catch {
            Write-Host $_.Exception.Message -ForegroundColor DarkYellow
            try {
                if ($null -ne $stream -and $stream.CanWrite) {
                    $body = [System.Text.Encoding]::UTF8.GetBytes('Internal Server Error')
                    Send-Response -Stream $stream -StatusCode 500 -StatusText 'Internal Server Error' -ContentType 'text/plain; charset=utf-8' -Body $body -SendBody $true
                }
            } catch {}
        } finally {
            if ($null -ne $client) {
                $client.Close()
            }
        }
    }
} finally {
    $listener.Stop()
}
