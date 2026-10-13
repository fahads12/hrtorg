const fs = require('node:fs');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const pages = require('../../portal-pages.json');
const rows = [];
for (const page of pages) {
  const document = parseHTML(fs.readFileSync('dist'+page.path+'index.html','utf8')).document;
  const forms = [...document.querySelectorAll('#portal-root form')];
  const enabled = forms.flatMap(form=>[...form.querySelectorAll('input,select,textarea,button[type="submit"]')])
    .filter(control=>!control.hasAttribute('disabled')&&!control.closest('fieldset[disabled]'));
  rows.push({path:page.path,forms:forms.length,enabledBeforeHydration:enabled.length});
}
fs.writeFileSync('scraps/portal-ui/static-form-guards.json',JSON.stringify(rows,null,2));
const failures = rows.filter(row=>row.enabledBeforeHydration);
console.log(JSON.stringify({forms:rows.reduce((count,row)=>count+row.forms,0),pages:rows.length,failures},null,2));
assert.equal(failures.length,0,'Static form controls must remain inert until event handlers attach.');
