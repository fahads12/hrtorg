// Run after editing local scripts/styles to refresh HTML asset fingerprints.
const fs = require('node:fs');
const crypto = require('node:crypto');
for (const name of fs.readdirSync(__dirname).filter(name => name.endsWith('.html'))) {
  const path = require('node:path').join(__dirname, name);
  const html = fs.readFileSync(path, 'utf8').replace(
    /(src|href)="([^"?:]+\.(?:jsx|js|css))(?:\?v=[^"]*)?"/g,
    (match, attr, file) => {
      const asset = require('node:path').join(__dirname, file);
      if (!fs.existsSync(asset)) return match;
      const version = crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0, 12);
      return `${attr}="${file}?v=${version}"`;
    }
  );
  fs.writeFileSync(path, html);
}
console.log('Updated local asset fingerprints in all HTML pages.');
