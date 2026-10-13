const fs=require('node:fs');
let code=fs.readFileSync('audit-prelaunch-browser.cjs','utf8');
const marker="'checklist/hormone-symptom-checklist-for-women-female-hormone-imbalance-test/index.html'];";
const additions=['About.html','Consultation.html','Pricing.html','Product.html?p=hrt&g=women','Symptom Check.html','blog-categories/hormones/index.html','providers/jessica-kikla/index.html'];
code=code.replace(marker,marker.slice(0,-2)+','+additions.map(JSON.stringify).join(',')+'];').replaceAll('http://localhost:8011','http://localhost:8013').replaceAll('scraps/prelaunch/accessibility-performance.json','scraps/prelaunch-2026-10-12/accessibility-performance.json');
fs.writeFileSync('scraps/prelaunch-2026-10-12/browser-scan.cjs',code);
