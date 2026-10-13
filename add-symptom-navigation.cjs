const fs = require('node:fs');
const path = require('node:path');
for (const name of fs.readdirSync(__dirname).filter(name => name.endsWith('.jsx') && name !== 'symptom-check-app.jsx')) {
  const file = path.join(__dirname,name);
  let source = fs.readFileSync(file,'utf8');
  source = source.replace(/(<div className="nav-links">)(?!\s*<SymptomCheckMenu)/g, '$1\n          <SymptomCheckMenu />');
  fs.writeFileSync(file,source);
}
let html = fs.readFileSync(path.join(__dirname,'HRT Home.html'),'utf8');
html = html.replace(/<script type="text\/babel" src="premium-components\.jsx[^\"]*"><\/script>\s*/,'');
html = html.replace(/home-app\.jsx(?:\?v=[^\"]*)?/,'symptom-check-app.jsx');
html = html.replace(/<link rel="stylesheet" href="home-styles\.css[^\"]*" \/>\s*/,'');
html = html.replace('<title>HRT — Modern hormone & wellness care for women and men</title>','<title>Symptom Check | HRT.org</title>');
fs.writeFileSync(path.join(__dirname,'Symptom Check.html'),html);
for (const name of fs.readdirSync(__dirname).filter(name=>name.endsWith('.html'))) {
  const file=path.join(__dirname,name);
  const source=fs.readFileSync(file,'utf8');
  if(!source.includes('symptom-check.css'))fs.writeFileSync(file,source.replace('</head>','<link rel="stylesheet" href="symptom-check.css" />\n</head>'));
}
console.log('Added symptom navigation and assessment entry point.');
