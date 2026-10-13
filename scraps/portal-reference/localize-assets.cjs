// Local visual assets only. The original portal JavaScript is never executed or published.
const fs = require('node:fs');
const path = require('node:path');
const origin = 'https://portal.hrt.org';
const out = path.resolve('uploads/portal');
async function main() {
  fs.mkdirSync(out, {recursive:true});
  let css = fs.readFileSync('source-content/portal-reference/main.css', 'utf8');
  const urls = new Set([...css.matchAll(/\/static\/media\/[a-zA-Z0-9_.-]+/g)].map(m => origin+m[0]));
  for (const name of ['login','signup','recover','symptoms']) {
    const data = JSON.parse(fs.readFileSync(`scraps/portal-reference/${name}.json`, 'utf8'));
    for (const image of data.images || []) if (image.src.startsWith(origin+'/static/media/')) urls.add(image.src);
  }
  const extra = process.argv.slice(2);
  for (const name of extra) urls.add(name.startsWith('https:') ? name : origin+'/static/media/'+name);
  const log = [];
  for (const url of urls) {
    const filename = new URL(url).pathname.split('/').pop();
    const target = path.join(out, filename);
    if (!fs.existsSync(target)) {
      const response = await fetch(url);
      if (!response.ok) throw Error(`${response.status}: ${url}`);
      fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
    }
    log.push({source:url, local:'/uploads/portal/'+filename, bytes:fs.statSync(target).size});
  }
  // The one external texture is decorative. Keep it local as well.
  const texture = 'https://www.transparenttextures.com/patterns/diagonal-striped-brick.png';
  if (css.includes(texture)) {
    const target=path.join(out,'diagonal-striped-brick.png');
    if (!fs.existsSync(target)) {
      const response = await fetch(texture);
      if(!response.ok) throw Error('Texture: '+response.status);
      fs.writeFileSync(target,Buffer.from(await response.arrayBuffer()));
    }
    css=css.replaceAll(texture,'/uploads/portal/diagonal-striped-brick.png');
  }
  css=css.replaceAll('/static/media/','/uploads/portal/');
  fs.writeFileSync('portal-reference.css', '/* Visual reference: public HRT portal stylesheet. Asset URLs are local; no portal services are connected. */\n'+css);
  fs.writeFileSync('scraps/portal-reference/local-assets.json',JSON.stringify(log,null,2));
  console.log(`Localized ${log.length} portal assets and reference CSS.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
