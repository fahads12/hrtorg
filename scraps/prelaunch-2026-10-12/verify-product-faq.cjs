const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {DOMParser}=require('linkedom');
class Parser{parseFromString(html){return new DOMParser().parseFromString('<!doctype html><html><body>'+html+'</body></html>','text/html')}}
const app=fs.readFileSync('product-app.jsx','utf8');
const source=app.slice(app.indexOf('function treatmentSections('),app.indexOf('function WhoSection('));
const {treatmentSections,treatmentContent}=vm.runInNewContext(source+';({treatmentSections,treatmentContent})',{DOMParser});
const services=require('../../source-content/restored-data.json').services;
const normalize=value=>String(value).replace(/[\u200b-\u200d\ufeff]/g,'').replace(/\s+/g,' ').trim();
const rows=[];
for(const[key,service]of Object.entries(services)){
 const result=treatmentContent(service);assert.equal(result.duplicates.length,1,key+' has one fully duplicate FAQ group');
 const removed=result.duplicates[0],document=new Parser().parseFromString(removed.html);
 const originalPairs=[...document.querySelectorAll('h3,h4')].map(h=>{const a=[];for(let n=h.nextElementSibling;n&&!/^H[1-6]$/.test(n.tagName);n=n.nextElementSibling)a.push(n.textContent);return{q:normalize(h.textContent),a:normalize(a.join(' '))}});
 for(const item of originalPairs)assert(result.items.some(saved=>normalize(saved.q)===item.q&&normalize(saved.a)===item.a),key+' retains exact Q&A');
 assert.equal(result.sections.length,result.allSections.length-1);
 for(const section of result.sections)assert.equal(section.html,result.allSections.find(p=>p.id===section.id).html,key+' retains other HTML');
 assert.equal(result.allSections.length,new Set(result.allSections.map(s=>s.id)).size);
 if(service.questions.length)assert.equal(JSON.stringify(result.items),JSON.stringify(service.questions),key+' retains original accordion array');
 rows.push({key,removedGroup:removed.title,preservedPairs:originalPairs.length,remainingSections:result.sections.length,topicAnchorRetained:removed.id,allContentChecksPass:true});
}
const fixture={body:'<h2>FAQ</h2><p>Unique safety information.</p><h3>Question?</h3><p>Answer.</p>',questions:[{q:'Question?',a:'Answer.'}]};
assert.equal(treatmentContent(fixture).duplicates.length,0,'Guard retains extra prose before questions');
fixture.body='<h2>FAQ</h2><h3>Question?</h3><p>Answer. <a href="/source">Source</a></p>';
assert.equal(treatmentContent(fixture).duplicates.length,0,'Guard retains rich links');
fixture.body='<h2>FAQ</h2><h3>Question?</h3><p>A different answer.</p>';
assert.equal(treatmentContent(fixture).duplicates.length,0,'Guard retains mismatched answers');
fs.writeFileSync('scraps/prelaunch-2026-10-12/product-faq-preservation.json',JSON.stringify({scope:'Pure source-parser tests for all11 canonical service bodies and3 preservation guard fixtures; browser verification recorded separately.',pairs:rows.reduce((n,r)=>n+r.preservedPairs,0),guardFixtures:3,rows},null,2));
console.log(JSON.stringify({services:rows.length,pairs:rows.reduce((n,r)=>n+r.preservedPairs,0),guardFixtures:3,pass:true}));
