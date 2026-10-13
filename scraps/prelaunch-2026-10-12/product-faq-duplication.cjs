const fs=require('node:fs'),vm=require('node:vm');
const {DOMParser}=require('linkedom');
// Execute only the local pure parser, with an HTML document wrapper matching browsers.
class Parser{parseFromString(html){return new DOMParser().parseFromString('<!doctype html><html><body>'+html+'</body></html>','text/html')}}
const app=fs.readFileSync('product-app.jsx','utf8');
const fn=app.slice(app.indexOf('function treatmentSections('),app.indexOf('function WhoSection('));
const parse=vm.runInNewContext(fn+';treatmentSections',{DOMParser:Parser});
const normalize=t=>t.replace(/[\u200b-\u200d\ufeff]/g,'').replace(/\s+/g,' ').trim();
const services=require('../../source-content/restored-data.json').services;
const rows=[];
for(const[key,service]of Object.entries(services)){
 const sections=parse(service.body);const faq=sections.find(section=>/faq/i.test(section.title));
 if(!faq){rows.push({key,faqSection:false});continue;}
 const doc=new Parser().parseFromString(faq.html);const headings=[...doc.querySelectorAll('h3,h4')];
 const pairs=headings.map(heading=>{const answer=[];for(let node=heading.nextElementSibling;node&&!/^H[1-6]$/.test(node.tagName);node=node.nextElementSibling)answer.push(node.textContent);const q=normalize(heading.textContent),a=normalize(answer.join(' '));const saved=service.questions.find(item=>normalize(item.q)===q);return{q,answerCharacters:a.length,matchingSavedQuestion:!!saved,answerExactlyMatchesAfterWhitespaceNormalization:!!saved&&normalize(saved.a)===a};});
 rows.push({key,faqSection:faq.title,faqHeadingCount:headings.length,savedAccordionQuestions:service.questions.length,fallbackExtraction:service.questions.length===0,faqOnlyQuestionAnswerElements:[...doc.body.children].every(node=>/^(?:H3|H4|P)$/.test(node.tagName)),pairs});
}
fs.writeFileSync('scraps/prelaunch-2026-10-12/product-faq-duplication.json',JSON.stringify({scope:'Exact visible-text comparison ignoring zero-width characters and whitespace only. No content changed.',rows},null,2));
console.log(JSON.stringify(rows,null,2));
