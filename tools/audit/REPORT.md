# Project Health Report
Generated: 2025-10-23T00:55:11.810Z

## Environment
Node: v22.17.0
npm: 9.8.1
root package.json type: module  | app present: true

## UI Build
PASS: app build ok

## Server
PASS: server responding on :3002

## Routes
PASS: /api/healthz 200
PASS: /api/reports/ping 200
PASS: /api/version 200
PASS: /api/debug/content 200

## Content Loaders
PASS: export getCatalog
PASS: export loadTweetrunk
PASS: export loadPractice

## Next Item
WARN: /api/next returned no id — seeding fallback item and retrying
FAIL: /api/next still no id

## Attempt Mode Coercion

## UI Wiring
PASS: attemptApi.js exports fetchNext
PASS: attemptApi.js exports submitAttempt
PASS: attemptApi.js exports skipItem
PASS: SigilRunner imports fetchNext/skipItem/submitAttempt
