import { createHash } from 'node:crypto';
const clean = value => String(value || '').replace(/[\u200b-\u200f\ufeff]/g,'').replace(/\s+/g,' ').trim();
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function evidenceFingerprint(entry, doc) {
  const blocks = (doc.blocks || []).map(clean);
  const evidenceBlocks = [...new Set((entry.evidence || []).flatMap(e => blocks.filter(b => b.includes(clean(e)))))].sort();
  return hash(evidenceBlocks);
}
export function activateKnowledge(review, source) {
  const entries=[], rejected=[], seen=new Set();
  for(const entry of review.entries || []) {
    const doc=(source.documents || []).find(d=>d.url === entry.url);
    let reason;
    if(!doc) reason='source-missing';
    else if(!entry.evidence?.length || !entry.evidence.every(e=>(doc.blocks || []).some(b=>clean(b).includes(clean(e))))) reason='evidence-changed';
    else if(entry.evidenceHash ? entry.evidenceHash !== evidenceFingerprint(entry,doc) : entry.sourceHash !== hash({blocks:doc.blocks,links:doc.links})) reason='review-required';
    else if((entry.verifiedLinks || []).some(link=>!doc.links?.some(l=>{try{return new URL(l.url,doc.url).href===link;}catch{return false;}}))) reason='published-link-changed';
    else if((entry.additionalEvidence || []).some(extra=>{const d=(source.documents||[]).find(s=>s.url===extra.url);return !d || !extra.evidence.every(q=>d.blocks.some(b=>clean(b).includes(clean(q)))) || extra.evidenceHash!==evidenceFingerprint(extra,d);}))reason='corroborating-source-changed';
    else if(seen.has(entry.id)) reason='duplicate-id';
    if(reason){rejected.push({id:entry.id,url:entry.url,reason});continue;}
    seen.add(entry.id);
    const fetchedAt=doc.fetchedAt || doc.syncedAt || source.syncedAt;
    const age=Date.now()-Date.parse(fetchedAt);
    const related=(entry.additionalEvidence||[]).map(e=>(source.documents||[]).find(d=>d.url===e.url));
    const failed=doc.lastFetchError||related.some(d=>d.lastFetchError);
    const stale=age>7*86400000||related.some(d=>Date.now()-Date.parse(d.fetchedAt||d.syncedAt)>7*86400000);
    entries.push({...entry,syncedAt:fetchedAt,verifiedAt:fetchedAt,freshness:failed?'unverified':stale?'stale':'verified',sourceStatus:failed?'Last successful source retained; latest fetch failed':'Reviewed published excerpt'});
  }
  return {entries,rejected};
}
const stop=new Set('a an the and or of to for from in on at by me i my you your we our it its this that they them there these those is are was were be been do does did can could would should will may have has had how what which where when why tell please about need want help know hrt website site information get give'.split(' '));
const groups=[
  ['portal','login','signin','password','account','log in','sign in','patient portal','reset password'],
  ['appointment','appointments','consultation','consultations','consult','booking','book','schedule','provider','doctor','physician'],
  ['insurance','insured','coverage','medicare','medicaid','hsa','fsa'],
  ['price','prices','pricing','cost','costs','fee','fees','charge','charges','much','payment','pay'],
  ['shipping','ship','ships','delivery','dispatch','postage','deliver','po box'],
  ['refund','refunds','return','returns','cancellation','cancel'],
  ['results','result','report','reports','turnaround'],
  ['eligibility','eligible','geography','states','state','country','countries','location','florida','california','maryland','new york'],
  ['hormone','hormones','hrt','trt','testosterone','estrogen','menopause','perimenopause'],
  ['peptide','peptides'],['hair','balding'],['sexual','libido','erectile'],['weight','semaglutide','glp1','glp-1'],
  ['testing','tests','test','kits','kit','lab','labs'],['support','contact','phone','email','human','team'],
  ['collection','collect','sample','samples','specimen','preparation','prepare','instructions'],
];
function normalized(text){return clean(text).toLowerCase().replace(/sign[ -]?in/g,'signin').replace(/log[ -]?in/g,'login').replace(/[^\p{L}\p{N}-]+/gu,' ').trim();}
function words(text){return [...new Set(normalized(text).split(/\s+/).filter(t=>t.length>1&&!stop.has(t)))];}
function concepts(text){const n=' '+normalized(text)+' ';return groups.map((g,i)=>g.some(t=>n.includes(' '+normalized(t)+' '))?i:-1).filter(i=>i>=0);}
export function rankKnowledge(entries,query,limit=5) {
  const terms=words(query), intents=concepts(query);
  if(!terms.length) return [];
  const primary=intents.filter(i=>i<8 || i===14 || i===15);
  return entries.map(k=>{
    const label=normalized(`${k.title} ${(k.tags||[]).join(' ')}`),body=normalized(k.text);
    const labelTerms=new Set(words(label)),bodyTerms=new Set(words(body));
    const docIntents=concepts(`${k.title} ${(k.tags||[]).join(' ')}`);
    const matches=terms.filter(t=>labelTerms.has(t)||bodyTerms.has(t));
    let score=terms.reduce((s,t)=>s+(labelTerms.has(t)?8:bodyTerms.has(t)?1:0),0);
    score+=intents.reduce((s,i)=>s+(docIntents.includes(i)?5:0),0);
    // Operational intent must have a matching topic; isolated words in medical copy are insufficient.
    if(primary.length && !primary.some(i=>docIntents.includes(i)))score=0;
    if(!matches.length&&!intents.some(i=>docIntents.includes(i)))score=0;
    if(k.freshness==='unverified')score*=.8;
    return {k,score};
  }).filter(x=>x.score>=4).sort((a,b)=>b.score-a.score||a.k.id.localeCompare(b.k.id)).slice(0,limit).map(x=>x.k);
}
export function rankServices(entries,query='') {
  const services=entries.filter(k=>k.type==='service');
  if(!query.trim() || /^(?:all |hrt )?(?:services|care|treatments)(?: for (?:men|women))?$/i.test(query.trim()))return services;
  if(/\b(?:services|treatments)\b/i.test(query)&&!/(?:hormone|peptide|sexual|hair|weight|lab|testing)/i.test(query))return services;
  // HRT is also the treatment abbreviation, not just the site's name.
  const q=/\bhrt\b/i.test(query)?query+' hormone':query;
  return rankKnowledge(services,q,6);
}
