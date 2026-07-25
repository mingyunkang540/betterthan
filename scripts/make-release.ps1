param(
  [string]$IconUrl
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($IconUrl)) {
  Write-Host ''
  Write-Host 'Paste the AppsInToss console icon HTTPS URL.' -ForegroundColor Cyan
  $IconUrl = Read-Host 'Icon URL'
}

$parsedUrl = $null
if (-not [Uri]::TryCreate($IconUrl.Trim(), [UriKind]::Absolute, [ref]$parsedUrl) -or $parsedUrl.Scheme -ne 'https') {
  Write-Host ''
  Write-Host 'ERROR: Enter a valid icon URL beginning with https://' -ForegroundColor Red
  exit 1
}

Push-Location $projectRoot
try {
  $env:AIT_ICON_URL = $IconUrl.Trim()
  Write-Host ''
  Write-Host 'Validating and building the final release candidate.' -ForegroundColor Cyan
  & npm.cmd run release:build
  if ($LASTEXITCODE -ne 0) {
    throw "Release build failed with exit code $LASTEXITCODE"
  }

  $bundlePath = Join-Path $projectRoot 'betterthan.ait'
  if (-not (Test-Path -LiteralPath $bundlePath)) {
    throw 'Build succeeded, but betterthan.ait was not found.'
  }

  $bundle = Get-Item -LiteralPath $bundlePath
  $hash = Get-FileHash -LiteralPath $bundlePath -Algorithm SHA256
  Write-Host ''
  Write-Host 'Final release candidate created.' -ForegroundColor Green
  Write-Host "File: $($bundle.FullName)"
  Write-Host ('Size: {0:N2} MB' -f ($bundle.Length / 1MB))
  Write-Host "SHA256: $($hash.Hash)"
  Write-Host ''
  Write-Host 'Upload this file to AppsInToss Console, then run the Sandbox QR test.' -ForegroundColor Yellow
  Start-Process explorer.exe -ArgumentList "/select,`"$bundlePath`""
}
catch {
  Write-Host ''
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
finally {
  Pop-Location
}
