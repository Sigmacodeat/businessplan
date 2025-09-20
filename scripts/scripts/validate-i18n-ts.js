#!/usr/bin/env node
/* TS-based i18n validation: compares EN (base) vs DE directly from TS objects */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const { loadTsModule } = require('./load-ts-module');
const { extractKeys, buildTypeMap, compareTypes } = require('./i18n-validator');

function main() {
  // scripts/scripts/* -> project root is two levels up
  const projectRoot = path.join(__dirname, '..', '..');
  const root = path.join(projectRoot, 'src', 'i18n', 'locales');
  const enPath = path.join(root, 'en', 'bp.ts');
  const dePath = path.join(root, 'de', 'bp.ts');

  // Load TS modules
  const enMod = loadTsModule(enPath);
  const deMod = loadTsModule(dePath);
  const enBp = (enMod && (enMod.default || enMod.bp || enMod)) ?? {};
  const deBp = (deMod && (deMod.default || deMod.bp || deMod)) ?? {};

  // Build base type map and compute keys
  const enTypeMap = buildTypeMap(enBp);
  const enKeys = extractKeys(enBp);
  const deKeys = extractKeys(deBp);
  const deKeySet = new Set(deKeys);
  const enKeySet = new Set(enKeys);

  // Missing keys in DE vs EN
  const missing = enKeys.filter((k) => {
    if (deKeySet.has(k)) return false;
    // tolerate array index differences
    const idxMatch = k.match(/^(.*)\.(\d+)$/);
    if (idxMatch) {
      const parent = idxMatch[1];
      if (deKeys.some((x) => new RegExp('^' + parent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.(?:\\d+)(?:$|\.)').test(x))) {
        return false;
      }
    }
    const regex = new RegExp('^' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.(?:\\d+)(?:$|\.)');
    if (deKeys.some((x) => regex.test(x))) return false;
    return true;
  });

  // Type mismatches
  const mismatches = compareTypes(enTypeMap, deBp);

  // Extra keys present in DE but not in EN (structural drift)
  // Hinweis: Wir ignorieren hierbei Array-Indizes (extractKeys normalisiert Arrays ohnehin auf Pfade ohne konkrete Indizes)
  // Wir prüfen zusätzliche Schlüssel in sensiblen Namensräumen (verhindert Schema-Drift):
  // - tables.*
  // - figures.*
  // - labels.*
  // - headings.*
  // - sections.*
  // - series.*
  const EXTRA_NAMESPACES = ['tables.', 'figures.', 'labels.', 'headings.', 'sections.', 'series.'];
  const extra = deKeys
    .filter((k) => !enKeySet.has(k))
    .filter((k) => EXTRA_NAMESPACES.some((p) => k.startsWith(p)));

  let hasIssues = false;
  if (missing.length > 0) {
    hasIssues = true;
    console.error(`❌ Fehlende Schlüssel in de (vs. en):`, missing);
  } else {
    console.log('✅ de: Keine fehlenden Schlüssel');
  }
  if (mismatches.length > 0) {
    hasIssues = true;
    console.error('❌ Struktur-/Typabweichungen in de (vs. en):');
    for (const m of mismatches) {
      console.error(`  - ${m.key}: erwartet=${m.expected}, tatsächlich=${m.actual}`);
    }
  } else {
    console.log('✅ de: Keine Struktur-/Typabweichungen');
  }

  if (extra.length > 0) {
    hasIssues = true;
    console.error('❌ Zusätzliche Schlüssel in de, die im Basisschema (en) nicht existieren:');
    for (const k of extra) console.error('  - ' + k);
  } else {
    console.log('✅ de: Keine zusätzlichen Schlüssel');
  }

  if (hasIssues) process.exit(1);
  console.log('✔ i18n TS-Validierung OK');
}

try {
  main();
} catch (err) {
  console.error('❌ i18n TS-Validierung fehlgeschlagen:', err?.message || err);
  process.exit(1);
}
