Param(
  [int64]$SoftCap = 5MB,
  [int64]$HardCap = 10MB
)

Write-Host "Scanning working tree for large files…"
$block = $false
$warn  = $false

$files = (git ls-files) + (git ls-files --others --exclude-standard)
foreach ($f in $files) {
  if (-not (Test-Path $f -PathType Leaf)) { continue }
  $sz = (Get-Item $f).Length
  if ($sz -ge $HardCap) {
    Write-Host "BLOCK: $f ($( [math]::Round($sz/1MB,2) ) MB) exceeds hard cap (10 MB)" -ForegroundColor Red
    $block = $true
  } elseif ($sz -ge $SoftCap) {
    Write-Host "WARN:  $f ($( [math]::Round($sz/1MB,2) ) MB) over soft cap (5 MB)" -ForegroundColor Yellow
    $warn = $true
  }
}

if ($block) { Write-Error "❌ Block: reduce file sizes or use LFS."; exit 2 }
if ($warn)  { Write-Host "⚠️  Warn: consider shrinking or LFS." }
Write-Host "✅ Size check passed."

