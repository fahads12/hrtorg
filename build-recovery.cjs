const fs = require('fs');
const path = require('path');
module.exports = function () {
  const pages = JSON.parse(fs.readFileSync('source-content/recovery/recovered-pages.json', 'utf8'));
  const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  const written = [];
  const template = fs.readFileSync('Return Policy.html', 'utf8').replace(/<link rel="stylesheet" href="assessment\.css(?:\?[^\"]*)?">/g, '');
  const mainPattern = /(<main\b[^>]*\bid\s*=\s*["']main-content["'][^>]*>)[\s\S]*?<\/main>/g;
  if ([...template.matchAll(mainPattern)].length !== 1) throw new Error('Recovery template must contain exactly one main-content element.');
  function write(file, title, content) {
    const base = '../'.repeat(file.split('/').length - 1) || './';
    let html = template.replace(/<base href="[^"]*">/, `<base href="${base}">`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)} | HRT.org</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(title)} — information and care from HRT.org.">`)
      .replace(mainPattern, (_, openingTag) => `${openingTag}${content}</main>`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    written.push(file);
  }
  const hero = title => `<section class="source-hero"><div class="wrap"><span class="eyebrow">HRT.org / Health & care</span><h1>${escape(title)}</h1></div></section>`;
  for (const [key, p] of Object.entries(pages)) {
    if (!key.startsWith('hrt-products/')) continue;
    // The source repeats this exact side-effects block on the BioBoost page.
    // Keep one unchanged copy; do not edit its clinical wording.
    if (key === 'hrt-products/semaglutide-bioboost-injections') {
      const section=/<h2><strong>Side effects of Semaglutide \+ BioBoost Injections<\/strong><\/h2><p>[\s\S]*?<\/p>/g;
      const seen=new Set();
      p.body=p.body.replace(section, block => {if(seen.has(block))return '';seen.add(block);return block;});
    }
    write(p.route, p.title, hero(p.title) + `<section class="wrap source-reading"><article class="source-prose">${p.body}</article><div class="source-faqs">${p.faqs.map(f => `<details><summary>${escape(f.question)}</summary><div class="source-prose">${f.answer}</div></details>`).join('')}</div><aside class="source-cta"><div><h2>Discuss your treatment options.</h2><p>A prescribing provider can review suitability and current treatment costs.</p></div><a class="btn btn-primary" href="https://portal.hrt.org/app/symptoms-tracker">Get Started</a><a class="btn btn-ghost" href="https://store.hrt.org/">Visit the store</a></aside></section>`);
  }
  write('Return Policy.html', 'Return Policy', hero('Return Policy') + `<section class="wrap source-reading"><article class="source-prose">${pages['return-policy'].body}</article></section>`);
  return written;
};
