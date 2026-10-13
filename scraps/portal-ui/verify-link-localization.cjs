const assert = require('node:assert/strict');
const fs = require('node:fs');
const {localizeURL, localizeText, localizeCareOptions} = require('../../localize-portal-links.cjs');
const cases = [
  ['https://portal.hrt.org', '/portal/'],
  ['https://portal.hrt.org/', '/portal/'],
  ['https://portal.hrt.org/app', '/portal/app/home/'],
  ['https://portal.hrt.org/app/dashboard/', '/portal/app/home/'],
  ['https://portal.hrt.org/app/symptoms-tracker?procedure=hair&amp;productId=42#start', '/portal/app/symptoms-tracker/?procedure=hair&amp;productId=42#start'],
  ['https://portal.hrt.org/register?procedure=hair', '/portal/register/?procedure=hair'],
  ['//portal.hrt.org/recover-password', '/portal/recover-password/'],
  ['https://store.hrt.org/', 'https://store.hrt.org/'],
  ['https://portal.hrt.org.evil.example/', 'https://portal.hrt.org.evil.example/'],
];
for (const [input, output] of cases) assert.equal(localizeURL(input), output);
const fixtures = [
  ['<a href="https://portal.hrt.org">Sign in</a>', '<a href="/portal/">Sign in</a>'],
  ["{href:'https://portal.hrt.org/app/symptoms-tracker'}", "{href:'/portal/app/symptoms-tracker/'}"],
  [String.raw`<a href=\"https://portal.hrt.org\">`, String.raw`<a href=\"/portal/\">`],
  ['<a href={"https://portal.hrt.org"}>', '<a href={"/portal/"}>'],
  ['<p>The address is https://portal.hrt.org for existing patients.</p>', '<p>The address is https://portal.hrt.org for existing patients.</p>'],
  ['<a href="https://store.hrt.org/">Shop</a>', '<a href="https://store.hrt.org/">Shop</a>'],
];
for (const [input, output] of fixtures) assert.equal(localizeText(input), output);
const tuple = "['Discuss symptoms, health history and next steps through the HRT.org patient portal.','https://portal.hrt.org/app/symptoms-tracker','Get started']";
assert.equal(localizeCareOptions(tuple), tuple.replace('https://portal.hrt.org/app/symptoms-tracker', '/portal/app/symptoms-tracker/'));
fs.writeFileSync('scraps/portal-ui/link-localization-tests.json', JSON.stringify({checks:cases.length+fixtures.length+1, passed:true},null,2));
console.log('Portal navigation localization: '+(cases.length+fixtures.length+1)+' checks passed.');
