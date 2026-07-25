$ErrorActionPreference = 'Stop'
$encodedProjectPath = 'QzpcVXNlcnNcdHRuMjBcRGVza3RvcFzrsJTsnbTruIzsvZTrlKlcdG9zcyBtaW5pIGFwcFxiZXR0ZXIgdGhhbiB5ZXN0ZXJkYXk='
$projectPath = [Text.Encoding]::UTF8.GetString(
  [Convert]::FromBase64String($encodedProjectPath)
)

if (-not (Test-Path -LiteralPath $projectPath)) {
  Write-Host '[ERROR] Project folder was not found.' -ForegroundColor Red
  exit 1
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  Write-Host '[ERROR] Node.js and npm were not found.' -ForegroundColor Red
  Write-Host 'Install Node.js 24 and try again.'
  exit 1
}

Set-Location -LiteralPath $projectPath

if (-not (Test-Path -LiteralPath (Join-Path $projectPath 'node_modules'))) {
  Write-Host 'Installing packages for the first run...'
  & npm.cmd install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host ''
Write-Host 'AppsInToss Sandbox scheme:' -ForegroundColor Cyan
Write-Host 'intoss://betterthan' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Keep this window open while testing.'
Write-Host ''

& npm.cmd run dev
exit $LASTEXITCODE
