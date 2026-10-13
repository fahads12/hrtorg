const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const captureArticle = require('./article-audit-capture.cjs');
const articles = require('./source-content/restored-data.json').articles;
const out = path.join(__dirname, 'scraps/inner-audit/articles');
const routes = ['Article.html', ...articles.map(a => a.route)];
const results = [];
const links = new Set();
fs.mkdirSync(out, { recursive: true });
const slug = route => route === 'Article.html' ? 'article-alias' : route.split('/')[1];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  await Promise.all([1440, 768, 390].map(async width => {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    let errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    fs.mkdirSync(path.join(out, String(width)), { recursive: true });
    for (const [i, route] of routes.entries()) {
      errors = [];
      const response = await page.goto('http://localhost:8000/' + route, { waitUntil: 'domcontentloaded' });
      await page.locator('.article-page .art-content').waitFor();
      await page.evaluate(async () => {
        await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,5000))]);
        [...document.images].forEach(img=>{img.loading='eager'});
        await Promise.race([Promise.all([...document.images].map(img => img.decode().catch(() => {}))),new Promise(resolve=>setTimeout(resolve,5000))]);
      });
      const metrics = await page.evaluate(() => {
        const rect = element => { const r = element.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; };
        const article = document.querySelector('.art-content');
        return {
          title: document.title,
          h1s: document.querySelectorAll('h1').length,
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          content: rect(article),
          image: document.querySelector('.article-source-image') ? rect(document.querySelector('.article-source-image')) : null,
          brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
          brokenContents: [...document.querySelectorAll('.art-tldr a, .art-rail a')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash),
          overflow: [...document.querySelectorAll('.article-page *')].filter(el => {const r=el.getBoundingClientRect(); return r.width && (r.right > innerWidth+2 || r.left < -2)}).map(el => el.tagName+'.'+el.className).slice(0,20),
          internalLinks: [...document.querySelectorAll('.article-page a[href]')].filter(a => a.origin === location.origin).map(a => a.href),
          headingCount: article.querySelectorAll('h2,h3,h4').length,
          paragraphCount: article.querySelectorAll('p').length,
          listCount: article.querySelectorAll('ul,ol').length
        };
      });
      metrics.internalLinks.forEach(href => links.add(href));
      delete metrics.internalLinks;
      const file = `${width}/${slug(route)}.png`;
      await captureArticle(page, path.join(out,file));
      results.push({route,width,status:response.status(),errors:[...errors],screenshot:file,...metrics});
      if (i % 20 === 0) console.log(`${width}: ${i+1}/${routes.length}`);
      fs.writeFileSync(path.join(out,'results-partial.json'),JSON.stringify(results,null,2));
    }
    await page.close();
  }));
  const context = await browser.newContext();
  const uniqueRoutes = [...new Set([...links].map(href => new URL(href).pathname))];
  const linkResults=[];
  let next=0;
  await Promise.all(Array.from({length:8},async()=>{
    while(next<uniqueRoutes.length){const route=uniqueRoutes[next++];const response=await context.request.get('http://localhost:8000'+route);linkResults.push({route,status:response.status()});}
  }));
  fs.writeFileSync(path.join(out,'link-results.json'),JSON.stringify(linkResults,null,2));
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
  const failures = results.filter(r=>r.status!==200||r.h1s!==1||r.documentWidth>r.viewport+2||r.errors.length||r.brokenImages.length||r.brokenContents.length||r.overflow.length);
  fs.writeFileSync(path.join(out,'failures.json'),JSON.stringify(failures,null,2));
  console.log(JSON.stringify({visits:results.length,failures:failures.length,localDestinations:linkResults.length,brokenDestinations:linkResults.filter(r=>r.status!==200)},null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
