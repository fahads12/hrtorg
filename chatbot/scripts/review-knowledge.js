// Validation only: new or changed business facts require deliberate editorial review.
// Never replace the reviewed set with a small hardcoded seed list.
import { readData } from '../server/ingest.js';
import { activateKnowledge } from '../server/knowledge.js';
const review=await readData('knowledge-review.json',{entries:[]});
const source=await readData('knowledge-sources.json',{documents:[]});
const result=activateKnowledge(review,source);
console.log(JSON.stringify({reviewed:review.entries.length,active:result.entries.length,rejected:result.rejected},null,2));
if(result.rejected.length)process.exitCode=1;
