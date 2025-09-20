#!/usr/bin/env node
/* Echte i18n Schema-Validierung (TS-first) mit Ajv */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { loadTsModule } = require('./load-ts-module');

function toJsonSchemaFromExample(example) {
  // Erzeugt ein relativ permissives Schema basierend auf EN-Struktur
  if (example === null) return { type: 'null' };
  const t = typeof example;
  if (t === 'string') return { type: 'string' };
  if (t === 'number') return { type: 'number' };
  if (t === 'boolean') return { type: 'boolean' };
  if (Array.isArray(example)) {
    // Arrays können heterogen sein (z. B. Tabellenzeilen [string, number, number]).
    // Wir validieren daher nur, dass es ein Array ist, ohne Items weiter einzuschränken.
    return { type: 'array' };
  }
  if (t === 'object') {
    const props = {};
    for (const k of Object.keys(example)) {
      props[k] = toJsonSchemaFromExample(example[k]);
    }
    return { type: 'object', properties: props, additionalProperties: true };
  }
  return {}; // fallback
}

function applyFinanceCustomizations(schema) {
  try {
    // Helper zum sicheren Navigieren
    const get = (obj, pathArr) => pathArr.reduce((o, k) => (o && o[k] ? o[k] : undefined), obj);
    const financeRows = get(schema, ['properties','content','properties','finance','properties','capexOpex','properties','rows']);
    if (financeRows && financeRows.type === 'array') {
      // rows: [ label:string, ...numbers ]
      financeRows.items = {
        type: 'array',
        minItems: 2,
        items: [ { type: 'string' } ],
        additionalItems: { type: 'number' }
      };
    }
    const totalsRows = get(schema, ['properties','content','properties','financePlanDetailed','properties','totalsRows']);
    if (totalsRows && totalsRows.type === 'array') {
      totalsRows.items = {
        type: 'array',
        items: [ { type: 'string' }, { type: 'number' } ],
        additionalItems: false
      };
    }
    const revenueRows = get(schema, ['properties','content','properties','financePlanDetailed','properties','revenueRows']);
    if (revenueRows && revenueRows.type === 'array') {
      revenueRows.items = {
        type: 'array',
        items: [ { type: 'string' }, { type: 'number' } ],
        additionalItems: false
      };
    }
    const capexArr = get(schema, ['properties','content','properties','financePlanDetailed','properties','capexOpex','properties','CAPEX']);
    if (capexArr && capexArr.type === 'array') {
      capexArr.items = {
        type: 'array',
        items: [ { type: 'string' }, { type: 'number' } ],
        additionalItems: false
      };
    }
    const opexArr = get(schema, ['properties','content','properties','financePlanDetailed','properties','capexOpex','properties','OPEX']);
    if (opexArr && opexArr.type === 'array') {
      opexArr.items = {
        type: 'array',
        items: [ { type: 'string' }, { type: 'number' } ],
        additionalItems: false
      };
    }
    const ebitdaRows = get(schema, ['properties','content','properties','financePlanDetailed','properties','ebitdaByYear','properties','rows']);
    if (ebitdaRows && ebitdaRows.type === 'array') {
      ebitdaRows.items = {
        type: 'array',
        items: [ { type: 'number' }, { type: 'number' } ],
        additionalItems: false
      };
    }
  } catch (_) {
    // Falls Struktur anders ist, keine harte Fehlermeldung (Schema bleibt relaxed)
  }
}

function main() {
  // scripts/scripts/* -> project root is two levels up
  // Neue i18n-Struktur nutzt src/i18n/locales/{en,de}/bp.ts
  const projectRoot = path.join(__dirname, '..', '..');
  const root = path.join(projectRoot, 'src', 'i18n', 'locales');
  const enPath = path.join(root, 'en', 'bp.ts');
  const dePath = path.join(root, 'de', 'bp.ts');

  const enMod = loadTsModule(enPath);
  const deMod = loadTsModule(dePath);
  const enBp = (enMod && (enMod.default || enMod.bp || enMod)) ?? {};
  const deBp = (deMod && (deMod.default || deMod.bp || deMod)) ?? {};

  // JSON Schema aus EN ableiten
  const schema = toJsonSchemaFromExample(enBp);
  // Strengere Regeln für bekannte Tabellenpfade anwenden (tuple-ähnliche Arrays)
  applyFinanceCustomizations(schema);
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(deBp);
  if (!valid) {
    console.error('❌ i18n Schema-Validierung fehlgeschlagen (de vs. en-Schema):');
    for (const err of validate.errors || []) {
      console.error(` - ${err.instancePath || '(root)'} ${err.message}`);
    }
    process.exit(1);
  }
  console.log('✔ i18n Schema-Validierung OK (TS-first)');
}

try {
  main();
} catch (err) {
  console.error('[i18n:schema] Fehler:', err?.message || err);
  process.exit(1);
}
