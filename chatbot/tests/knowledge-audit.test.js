import test from 'node:test';
import assert from 'node:assert/strict';
import { activateKnowledge, evidenceFingerprint, rankKnowledge, rankServices } from '../server/knowledge.js';
import {reloadData,searchKnowledge,knowledgeHealth} from '../server/catalog.js';
await reloadData();
const doc={url:'https://hrt.org/contact',blocks:['Contact support@hrt.org for assistance.'],links:[{url:'/contact'}],fetchedAt:new Date().toISOString()};
const entry={id:'contact',url:doc.url,type:'support',title:'Human support',text:'Contact support@hrt.org.',tags:['contact','support'],evidence:['support@hrt.org']};
entry.evidenceHash=evidenceFingerprint(entry,doc);
test('unrelated page additions do not silently erase reviewed facts',()=>{
  const source={documents:[{...doc,blocks:[...doc.blocks,'A newly added navigation heading.']}]};
  assert.equal(activateKnowledge({entries:[entry]},source).entries.length,1);
});
test('changing evidence context fails closed with a review reason',()=>{
  const result=activateKnowledge({entries:[entry]},{documents:[{...doc,blocks:['Do not contact support@hrt.org for assistance.']}]});
  assert.equal(result.entries.length,0);assert.equal(result.rejected[0].reason,'review-required');
});
test('missing sources and changed published destinations are visible in audit diagnostics',()=>{
  assert.equal(activateKnowledge({entries:[entry]},{documents:[]}).rejected[0].reason,'source-missing');
  const changed={...entry,verifiedLinks:['https://portal.hrt.org']};
  assert.equal(activateKnowledge({entries:[changed]},{documents:[doc]}).rejected[0].reason,'published-link-changed');
});
test('failed fetches retain source date and are explicitly unverified',()=>{
  const result=activateKnowledge({entries:[entry]},{documents:[{...doc,lastFetchError:'HTTP 503'}]}).entries[0];
  assert.equal(result.freshness,'unverified');assert.equal(result.verifiedAt,doc.fetchedAt);
});
const records=[
 {id:'sexual',type:'service',title:'Sexual health',tags:['sexual'],text:'Explore clinician guidance.'},
 {id:'portal',type:'navigation',title:'Patient portal sign in',tags:['login','password','account'],text:'Use the published patient portal.'},
 {id:'insurance',type:'policy',title:'Insurance and payment',tags:['insurance','coverage'],text:'Confirm published coverage with support.'},
 {id:'hormone',type:'service',title:'Hormone replacement therapy',tags:['hormone','menopause'],text:'For men and women.'}
];
test('login and insurance retrieve their own intent, not substring collisions',()=>{
 assert.equal(rankKnowledge(records,'How do I log in?')[0].id,'portal');
 assert.equal(rankKnowledge(records,'Do you accept insurance?')[0].id,'insurance');
 assert.deepEqual(rankKnowledge(records,'Can you write a poem about elephants?'),[]);
});
test('HRT service abbreviation resolves hormone care for women',()=>assert.equal(rankServices(records,'HRT for women')[0].id,'hormone'));
test('reviewed corpus routes operational questions to their actual evidence',()=>{
 const cases=[['How do I log in?','portal-navigation'],['Do you accept insurance?','insurance-coverage-conflict'],['Is a consultation free?','consultation-cost-conflict'],['Can I ship a kit to New York?','testing-shipping'],['What hormones are discussed for women?','service-hormone-women-details']];
 for(const [q,id] of cases)assert.ok(searchKnowledge(q,6).some(s=>s.id===id),q);
 assert.deepEqual(knowledgeHealth.rejected,[]);
});
