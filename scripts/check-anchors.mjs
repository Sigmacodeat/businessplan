#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(path.join(import.meta.url.replace('file://',''), '../../')).replace(/\/scripts$/, '');
const SRC = path.join(ROOT, 'src');

const CONFIG_PATH = path.join(SRC, 'app', 'chapters', 'chapters.config.ts');

/**
 * Very light parser to extract { slug, subchapters: [{id}] } from chapters.config.ts
 */
async function parseChaptersConfig() {
  const raw = await readFile(CONFIG_PATH, 'utf8');
  const items = [];
  // Split into objects by lines containing "{ id:" at top level; fallback to regex groups
  const objRegex = /\{\s*id:\s*(\d+)\s*,\s*slug:\s*'([^']+)'[\s\S]*?\}(?=\s*,\s*\{|\s*\]\s*;)/g;
  let m;
  while ((m = objRegex.exec(raw)) !== null) {
    const objBlock = m[0];
    const slug = m[2];
    const subIds = [];
    const subBlockMatch = objBlock.match(/subchapters\s*:\s*\[([\s\S]*?)\]/);
    if (subBlockMatch) {
      const list = subBlockMatch[1];
      const idRegex = /\bid:\s*'([^']+)'/g;
      let sm;
      while ((sm = idRegex.exec(list)) !== null) {
        subIds.push(sm[1]);
      }
    }
    items.push({ slug, subIds });
  }
  return items;
}

function extractAnchorsFromTSX(tsx) {
  const anchors = new Set();
  const push = (s) => { if (s) anchors.add(s); };
  // id="..." or id='...'
  const idRegex = /\bid\s*=\s*(["'])([^"']+)\1/g;
  let m1;
  while ((m1 = idRegex.exec(tsx)) !== null) {
    push(m1[2]);
  }
  // data-anchor="..."
  const daRegex = /\bdata-anchor\s*=\s*(["'])([^"']+)\1/g;
  let m2;
  while ((m2 = daRegex.exec(tsx)) !== null) {
    push(m2[2]);
  }
  return anchors;
}

async function check() {
  const chapters = await parseChaptersConfig();
  const results = [];
  for (const ch of chapters) {
    const file = path.join(SRC, 'app', 'chapters', ch.slug, 'page.tsx');
    const ok = existsSync(file);
    if (!ok) {
      results.push({ slug: ch.slug, missingFile: true, missing: ch.subIds, present: [] });
      continue;
    }
    const tsx = await readFile(file, 'utf8');
    const anchors = extractAnchorsFromTSX(tsx);
    const present = [];
    const missing = [];
    for (const id of ch.subIds) {
      // Allow variants: id, id-anchor
      if (anchors.has(id) || anchors.has(`${id}-anchor`)) present.push(id); else missing.push(id);
    }
    results.push({ slug: ch.slug, missingFile: false, missing, present, file });
  }

  // Print report
  let exitCode = 0;
  for (const r of results) {
    if (r.missingFile) {
      console.log(`Chapter ${r.slug}: PAGE FILE MISSING -> ${path.join('src','app','chapters',r.slug,'page.tsx')}`);
      exitCode = 1;
      continue;
    }
    if (r.missing.length === 0) {
      console.log(`Chapter ${r.slug}: OK (all ${r.present.length} subchapters anchored)`);
    } else {
      console.log(`Chapter ${r.slug}: MISSING ${r.missing.length} anchors -> ${r.missing.join(', ')} (file: ${path.relative(ROOT, r.file)})`);
      exitCode = 1;
    }
  }
  process.exit(exitCode);
}

check().catch((e) => {
  console.error(e);
  process.exit(2);
});
