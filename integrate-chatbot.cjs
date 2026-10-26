// Add the existing HRT AI Guide without rewriting any page content.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
module.exports = function integrateChatbot(root = __dirname) {
  const excluded = new Set(['node_modules', 'scraps', 'source-content', 'uploads', 'dist', 'assets', 'chatbot']);
  const version = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'assets/hrt-chatbot.js'))).digest('hex').slice(0,12);
  const tag = `<script src="/assets/hrt-chatbot.js?v=${version}" defer data-hrt-chatbot></script>`;
  let updated = 0;
  function visit(dir) {
    for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
      if (item.name.startsWith('.') || excluded.has(item.name)) continue;
      const file = path.join(dir, item.name);
      if (item.isDirectory()) visit(file);
      else if (item.name.endsWith('.html')) {
        const before = fs.readFileSync(file, 'utf8');
        if (!/<\/body>/i.test(before)) continue;
        const clean = before.replace(/<script\b[^>]*\bdata-hrt-chatbot(?:\s|=|>)[\s\S]*?<\/script>/gi, '');
        const after = clean.replace(/<\/body>/i, tag + '</body>');
        if (after !== before) { fs.writeFileSync(file, after); updated++; }
      }
    }
  }
  visit(root);
  return updated;
};
if (require.main === module) console.log(`HRT chatbot: updated ${module.exports()} pages.`);
