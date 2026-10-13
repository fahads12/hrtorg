// Replace portal navigation only; archived sources and surrounding care copy stay intact.
const fs = require('node:fs');
const path = require('node:path');

function localizeURL(value) {
  if (!/^(?:https?:)?\/\/portal\.hrt\.org(?=\/|[?#]|$)/i.test(value)) return value;
  const local = value.replace(/^(?:https?:)?\/\/portal\.hrt\.org/i, '');
  const suffixAt = local.search(/[?#]/);
  let pathname = (suffixAt < 0 ? local : local.slice(0, suffixAt)).replace(/\/+$/, '');
  const suffix = suffixAt < 0 ? '' : local.slice(suffixAt);
  if (pathname === '/app' || pathname === '/app/dashboard') pathname = '/app/home';
  return '/portal' + pathname + '/' + suffix;
}

function localizeText(text) {
  // HTML, JSX, React properties, and escaped HTML stored in JSON. Do not replace prose.
  return text.replace(/(\bhref\s*(?:=|:)\s*\{?\s*(?:\\?["']))([^"'\\\s<>]+)((?:\\?["']))/g,
    (all, before, value, after) => before + localizeURL(value) + after);
}

function localizeCareOptions(text) {
  // The shared CareOptions renderer stores its href in a tuple rather than a named property.
  return text.replace(/(["']Discuss symptoms, health history and next steps through the HRT\.org patient portal\.["']\s*,\s*["'])(https:\/\/portal\.hrt\.org\/app\/symptoms-tracker)(["'])/g,
    (all, before, value, after) => before + localizeURL(value) + after);
}

function run(root = __dirname) {
  const excluded = new Set(['node_modules', 'source-content', 'scraps', 'uploads', '.git', '.tools', '.agents', '.codex', '.aws', 'dist', '.vercel', 'portal']);
  let examined = 0, changed = 0;
  const changedFiles = [];
  function walk(dir) {
    for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
      if (excluded.has(item.name)) continue;
      const file = path.join(dir, item.name);
      if (item.isDirectory()) { walk(file); continue; }
      const relative = path.relative(root, file).replaceAll('\\', '/');
      if (/^(?:assets\/)?portal-/.test(relative)) continue;
      const published = relative.endsWith('.html') || /^assets\/.*\.js$/.test(relative);
      const editable = dir === root && (relative.endsWith('.jsx') || relative === 'site-shell.json');
      if (!published && !editable) continue;
      examined++;
      const before = fs.readFileSync(file, 'utf8');
      let after = localizeText(before);
      if (/^(?:restored-components\.jsx|assets\/restored-components\.js)$/.test(relative)) after = localizeCareOptions(after);
      if (after !== before) { fs.writeFileSync(file, after); changed++; changedFiles.push(relative); }
    }
  }
  walk(root);
  console.log(`Localized portal navigation in ${changed} of ${examined} published/editable files.`);
  fs.mkdirSync(path.join(root, 'scraps/portal-ui'), {recursive:true});
  fs.writeFileSync(path.join(root, 'scraps/portal-ui/link-localization.json'), JSON.stringify({examined, changed, changedFiles}, null, 2));
  return {examined, changed, changedFiles};
}

module.exports = {localizeURL, localizeText, localizeCareOptions, run};
if (require.main === module) run();
