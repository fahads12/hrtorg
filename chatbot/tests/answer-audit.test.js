import test from 'node:test';
import assert from 'node:assert/strict';
import { reloadData, knowledge, catalog } from '../server/catalog.js';
import { generateAnswer, needsCatalogLookup, retrievalContext, sourceForDisplay, validateAnswer } from '../server/ai.js';
import { isUrgent } from '../server/safety.js';

await reloadData();
test('personal emergency symptoms are not mistaken for general educational questions',()=>{
  assert.equal(isUrgent('What is causing my chest pain?'),true);
  assert.equal(isUrgent('Tell me about stroke because my dad collapsed'),true);
  assert.equal(isUrgent('What are the risks of HRT? I can’t breathe'),true);
  assert.equal(isUrgent('I had chest pain last year and it is happening again now'),true);
  assert.equal(isUrgent('What is a stroke?'),false);
});
test('appending a question cannot bypass citations for a commercial claim',()=>{
 const evidence={products:new Map(),sources:new Map()};
 assert.throws(()=>validateAnswer({message:'HRT consultations cost $50. Would you like to book?',productIds:[],sourceIds:[],followups:[],urgent:false},evidence,{requireEvidence:true}));
 assert.doesNotThrow(()=>validateAnswer({message:'Which kit or service do you mean?',productIds:[],sourceIds:[],followups:[],urgent:false},evidence,{requireEvidence:true}));
});
const answer = (message, sourceIds = []) => ({message,sourceIds,productIds:[],followups:[],urgent:false});
function scripted(outputs, inspect = () => {}) {
  let i = 0;
  return {responses:{stream(request) {
    inspect(request,i);
    const value=outputs[i++];
    if (!value) throw Error('Unexpected extra model request');
    return {on(){assert.fail('Unvalidated model deltas must not be streamed to visitors');},finalResponse:async()=>({status:'completed',output:[],output_text:JSON.stringify(value)})};
  }}};
}
test('audit: follow-up retrieval resolves source IDs and product references against current records',()=>{
  const source=knowledge[0], product=catalog.products[0];
  assert.ok(source && product);
  const c=retrievalContext({sourceIds:[source.id,'removed-source'],displayed:[product.id,'999-not-real'],lastTopic:'HRT services'},'What about that one?');
  assert.equal(c.followup,true); assert.match(c.query,/HRT services/);
  assert.ok(c.sources.some(s=>s.id===source.id));assert.ok(c.sources.every(s=>s.id!=='removed-source'));
  assert.deepEqual(c.displayed,[{id:product.id,name:product.name,url:product.url}]);
});
test('audit: explicit product pricing requires lookup but clinical and service-price questions do not',()=>{
  for(const q of ['How much is a cortisol test?','What is the price of DHEA?','Find vitamin D products under $30'])assert.equal(needsCatalogLookup(q),true,q);
  assert.equal(needsCatalogLookup('Is there a cheaper one?',{displayed:['1']}),true);
  assert.equal(needsCatalogLookup('How much?',{displayed:['1'],sourceIds:['consultations']}),false,'A service follow-up must not shop for an old displayed product');
  for(const q of ['What does a consultation cost?','Does insurance cover HRT?','Should I take a thyroid test?','What is the HRT patient portal?'])assert.equal(needsCatalogLookup(q),false,q);
});
test('audit: invalid citation IDs are retried and invalid prose is never emitted',async()=>{
  const source=knowledge[0], events=[];
  const client=scripted([answer('Invented fact.',['not-a-real-source']),answer(source.text,[source.id])],(request,i)=>{
    if(i===1)assert.ok(request.input.some(x=>x.content?.includes?.('answerValidationError')));
  });
  const session={history:[],sourceIds:[source.id],lastTopic:'HRT services'};
  const result=await generateAnswer(session,'What about HRT services?',(type,value)=>events.push({type,value}),{client,skipVerify:true});
  assert.equal(result.sources[0].id,source.id);
  assert.ok(!events.some(e=>JSON.stringify(e).includes('Invented fact')));
  assert.deepEqual(events.filter(e=>e.type==='text').map(e=>e.value.text),[source.text]);
  assert.deepEqual(session.sourceIds,[source.id]);
});
test('audit: persistent invalid output fails closed without showing partial facts',async()=>{
  const events=[];
  const client=scripted([answer('Unsupported price.',['fake']),answer('Unsupported replacement.',['fake'])]);
  await assert.rejects(()=>generateAnswer({history:[]},'What does a consultation cost?',(type,data)=>events.push({type,data}),{client,skipVerify:true}),/Ungrounded/);
  assert.equal(events.filter(e=>e.type==='text').length,0);
});
test('audit: substantive operational claims require a citation, while an explicit unknown is allowed',()=>{
  const evidence={sources:new Map(),products:new Map()};
  assert.throws(()=>validateAnswer(answer('HRT accepts every insurance plan.'),evidence,{requireEvidence:true}),/verified citation/);
  assert.doesNotThrow(()=>validateAnswer(answer("I can't verify whether HRT accepts your insurance from the available sources."),evidence,{requireEvidence:true}));
});
test('audit: only approved verified navigation actions become rendered source links',()=>{
  const s={id:'portal',title:'Patient portal',url:'https://hrt.org',action:{title:'Open patient portal',url:'https://portal.hrt.org/'}};
  const displayed=sourceForDisplay(s);assert.equal(displayed.url,'https://portal.hrt.org/');assert.equal(displayed.sourceUrl,'https://hrt.org');
  for(const url of ['https://evil.test/login','javascript:alert(1)','https://secret@portal.hrt.org/'])assert.equal(sourceForDisplay({...s,displayUrl:url}).url,'https://hrt.org');
});
test('audit: emergency replies remove shopping context and stay in conversational history',async()=>{
  const session={history:[],displayed:['1'],lastSearch:{query:'supplements'},sourceIds:['any'],lastTopic:'supplements'};
  const r=await generateAnswer(session,'I have chest pain right now',()=>{}, {client:{responses:{stream(){assert.fail('Do not call model for emergency');}}},skipVerify:true});
  assert.equal(r.urgent,true);assert.deepEqual(session.displayed,[]);assert.equal(session.lastSearch,null);assert.deepEqual(session.sourceIds,[]);
  assert.equal(session.history.at(-1).content,r.message);
});
test('audit: educational and explicitly negated/remote symptoms do not force emergency-only responses',()=>{
  for(const q of ['What are the stroke risks of HRT?','I have no chest pain. What is a hormone test?','I had a stroke two years ago. Can I discuss HRT with a clinician?'])assert.equal(isUrgent(q),false,q);
  for(const q of ['I have no chest pain but I cannot breathe','I had chest pain ten minutes ago','My husband has slurred speech','What are stroke risks? I have sudden weakness right now.'])assert.equal(isUrgent(q),true,q);
});
