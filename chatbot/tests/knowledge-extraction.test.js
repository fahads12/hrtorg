import test from 'node:test';
import assert from 'node:assert/strict';
import { extractKnowledge } from '../server/ingest.js';

test('source extraction retains short login headings and insurance list items', () => {
  const login = extractKnowledge('<title>Login</title><main><form><h1>Login</h1><input name="password"><a href="#recover">Forgot your password?</a></form></main>', 'https://store.hrt.org/account/login');
  assert.ok(login.blocks.includes('Login'));
  assert.ok(login.links.some(link => link.url === '#recover'));
  const faq = extractKnowledge('<main><h1>FAQ</h1><ul><li>TRICARE</li><li>Original Medicare Part B</li></ul></main>', 'https://store.hrt.org/pages/easy-faqs');
  assert.ok(faq.blocks.includes('TRICARE'));
});

test('Webflow leaf-div facts survive without concatenated navigation or hidden form status', () => {
  const text = 'Results arrive within 5-7 business days of receipt.';
  const html = `<div><div>${text}</div><div>4342 Auburn Road<br>Victoria, Australia</div><div><a href="/a">Care</a><a href="/b">Products</a></div><div class="w-form-done">Your message has been sent.</div></div>`;
  const doc = extractKnowledge(html, 'https://hrt.org/lab-testing');
  assert.ok(doc.blocks.includes(text));
  assert.ok(doc.blocks.some(block => block.includes('Victoria, Australia')));
  assert.ok(!doc.blocks.some(block => block.includes('CareProducts') || block.includes('Your message has been sent')));
});

test('footer service-area evidence excludes following partner-site boilerplate', () => {
  const doc = extractKnowledge('<header><a href="https://portal.hrt.org/app/symptoms-tracker">Get Started</a></header><main><h1>HRT services</h1></main><footer>Copyright<br>Telehealth services currently available in Florida and California<br>Partner Sites: Other site</footer>', 'https://hrt.org');
  assert.ok(doc.blocks.includes('Telehealth services currently available in Florida and California'));
  assert.ok(!doc.blocks.some(block => block.includes('Partner Sites')));
  assert.ok(doc.links.some(link => link.url === 'https://portal.hrt.org/app/symptoms-tracker'));
});
