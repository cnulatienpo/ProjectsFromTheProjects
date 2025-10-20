// server/report/index.js
// Tries to import compiled report modules and build a real report.
// Falls back to the simple heuristic analyzer if needed.

import { analyzeAttempt as fallbackAnalyze } from '../attempt/analyze.js';
import fs from 'fs';
import path from 'path';

const RPT_DIR = path.resolve('server', 'report');

function have(p) {
  return fs.existsSync(path.join(RPT_DIR, p));
}

async function loadReports() {
  const mod = {};
  try {
    if (have('reportPhrases.js')) mod.phrases = await import(path.join(RPT_DIR, 'reportPhrases.js'));
    if (have('reportTypes.js')) mod.types = await import(path.join(RPT_DIR, 'reportTypes.js'));
    if (have('reportEvolve.js')) mod.evolve = await import(path.join(RPT_DIR, 'reportEvolve.js'));
  } catch (e) {
    mod.__error = String(e);
  }
  return mod;
}

export async function buildReport(text, { minWords = 30 } = {}) {
  const raw = String(text || '');
  const reports = await loadReports();

  // If an explicit builder exists, use it
  const evolve = reports?.evolve;
  const explicitBuilder =
    evolve?.buildStyleReport ||
    evolve?.buildReport ||
    evolve?.default;

  if (typeof explicitBuilder === 'function') {
    try {
      const rep = await explicitBuilder(raw, { minWords, phrases: reports?.phrases, types: reports?.types });
      // Normalize a bit so the UI gets what it expects
      return {
        verdict: rep?.verdict || rep?.status || 'revise',
        counts:  rep?.counts || { words: (raw.trim() ? raw.trim().split(/\s+/).length : 0), minWords },
        rubric:  rep?.rubric || [],
        spans:   rep?.spans  || [],
        memo:    rep?.memo   || rep?.notes || [],
        badge:   rep?.badge  || null,
        level:   rep?.level  || null,
      };
    } catch (e) {
      // fall through to heuristic
    }
  }

  // Heuristic fallback (previous behavior)
  return fallbackAnalyze(raw, { minWords });
}
