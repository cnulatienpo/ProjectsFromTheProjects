#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

param(
  [string]$Pick = 'auto'
)

$safePattern = '(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|playwright-report/|coverage/|\.playwright/)'
$conflicted = git diff --name-only --diff-filter=U

if (-not $conflicted) {
  Write-Host '✅ No conflicts.'
  exit 0
}

foreach ($file in $conflicted) {
  if ($file -match $safePattern) {
    switch ($Pick) {
      '--theirs' { git checkout --theirs -- $file }
      Default   { git checkout --ours -- $file }
    }
    git add -- $file
    Write-Host "Resolved (safe): $file"
  }
  else {
    Write-Host "⚠️  Manual review needed: $file"
    Write-Host "   → Open the file and remove conflict markers: <<<<<<< ======= >>>>>>>"
  }
}

$left = git diff --name-only --diff-filter=U
if (-not $left) {
  Write-Host '🎉 Conflicts resolved for safe files. Stage & commit when done.'
}
