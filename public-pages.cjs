const fs = require('node:fs');
const path = require('node:path');
const excluded = new Set(['node_modules', '.tools', 'scraps', 'source-content', 'uploads', '.git', '.codex', '.vercel', 'dist', 'assets', 'chatbot']);
function publicPages(dir = '.') {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() && !excluded.has(entry.name) ? publicPages(file) : entry.isFile() && file.endsWith('.html') ? [file.replaceAll('\\', '/')] : [];
  }).sort();
}
module.exports = publicPages;
