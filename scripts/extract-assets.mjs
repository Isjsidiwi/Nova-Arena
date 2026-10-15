import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'game.html'), 'utf8');

const OUT = {
  portrait: 'portraits',
  icon: 'icons',
  cutin: 'cutins',
};

const found = { portrait: {}, icon: {}, cutin: {} };

for (const [key, folder] of Object.entries(OUT)) {
  const blockRe = new RegExp(key + ":\\{([^}]+)\\}", 'g');
  const block = blockRe.exec(html);
  if (!block) continue;
  const entryRe = /(\w+):'(data:image\/[a-z]+;base64,([^']+))'/g;
  let m;
  while ((m = entryRe.exec(block[1]))) {
    const [, id, , b64] = m;
    const dir = join(root, 'public', 'assets', folder);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${id}.webp`);
    writeFileSync(file, Buffer.from(b64, 'base64'));
    found[key][id] = id;
    console.log(`extracted ${folder}/${id}.webp (${Math.round(b64.length / 1024)} KB base64)`);
  }
}

const list = (obj) =>
  Object.keys(obj).length
    ? `{\n${Object.entries(obj)
        .map(([id]) => `    ${id}: 'assets/${OUT[Object.keys(found).find((k) => found[k] === obj)]}/${id}.webp',`)
        .join('\n')}\n  }`
    : '{}';

const js = `// Manifest aset. Ubah nilai di sini untuk mengganti gambar/suara tanpa menyentuh kode.
// null = pakai art SVG bawaan (hero/item) / SFX sintetis.
export const ASSETS = {
  portrait: ${list(found.portrait)},
  icon: ${list(found.icon)},
  cutin: ${list(found.cutin)},
  bg: {
    home: null,
    battle: null,
  },
  sfx: {
    tap: null,
    hit: null,
    ult: null,
    pull: null,
    win: null,
    lose: null,
  },
  bgm: null,
};
`;

mkdirSync(join(root, 'src', 'config'), { recursive: true });
writeFileSync(join(root, 'src', 'config', 'assets.js'), js);
console.log('wrote src/config/assets.js');
