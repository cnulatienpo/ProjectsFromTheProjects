#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Write-Host "🔎 Listing merge conflicts..."
$conflicted = git diff --name-only --diff-filter=U
$conflicted
Write-Host ""
Write-Host "Tip: run scripts/resolve-conflicts.ps1 --ours or --theirs for lockfiles and generated outputs."
