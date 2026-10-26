// Vercel serves only this allowlisted publish directory, never project archives or exports.
const fs = require('node:fs');
const path = require('node:path');
const publicPages = require('./public-pages.cjs');
const root = __dirname;
require('./integrate-chatbot.cjs')(root);
const output = path.resolve(root,'dist');
if (output !== path.join(root,'dist') || path.dirname(output) !== root) throw Error('Unsafe publish directory');
fs.mkdirSync(output,{recursive:true});
const files = new Set([...publicPages(),'robots.txt','sitemap.xml']);
for (const file of [...files]) {
  if(!file.endsWith('.html'))continue;
  for (const match of fs.readFileSync(file,'utf8').matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))(?:\?[^"#]*)?"/g)) {
    if(!/^[a-z]+:/i.test(match[1]))files.add(match[1].replace(/^\//,''));
  }
}
function collect(dir, extensions) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const file=path.join(dir,entry.name).replaceAll('\\','/');
    if(entry.isDirectory())collect(file,extensions);
    else if(extensions.test(file))files.add(file);
  }
}
collect('assets',/\.(?:js|css|txt|woff2)$/);
collect('uploads',/\.(?:webp|svg|woff2?|ttf|jpe?g|avif)$/i);
// Preserve original brand PNG and any other PNG actually referenced by published content.
const publicText=[...files].filter(f=>/\.(?:html|js|css)$/.test(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const match of publicText.matchAll(/uploads\/[\w /.,%()+-]+\.png/g)) if(fs.existsSync(match[0]))files.add(match[0]);
// Remove only stale files inside the verified publish directory; source files are never moved/deleted.
function removeStale(dir) {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const target=path.resolve(dir,entry.name);
    if(!target.startsWith(output+path.sep))throw Error('Unsafe output path');
    if(entry.isDirectory())removeStale(target);
    else if(!files.has(path.relative(output,target).replaceAll('\\','/')))fs.unlinkSync(target);
  }
}
removeStale(output);
for(const file of files) {
  if(/^(?:source-content|scraps|node_modules|chatbot|\.tools|\.git|\.codex|\.vercel)(?:\/|$)/i.test(file)||file.includes('..'))throw Error('Private/unsafe publish path: '+file);
  const target=path.resolve(output,file);
  if(!target.startsWith(output+path.sep))throw Error('Unsafe copy path');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(path.join(root,file),target);
}
fs.mkdirSync('scraps/portal-ui',{recursive:true});
fs.writeFileSync('scraps/portal-ui/publish-manifest.json',JSON.stringify({output:'dist',files:[...files].sort(),bytes:[...files].reduce((n,f)=>n+fs.statSync(f).size,0)},null,2));
console.log('Prepared '+files.size+' public files in dist; private archives and workflow exports excluded.');
