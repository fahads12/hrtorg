const fs=require('fs');
const root='scraps/prelaunch-2026-10-12/content';
const rows=JSON.parse(fs.readFileSync(root+'/report.json','utf8'));
const flows=JSON.parse(fs.readFileSync(root+'/assessment-flows-dist.json','utf8')).cases;
const output=rows.map(row=>{
 const flow=flows.find(x=>x.route===row.route&&x.width===row.width);
 const item={route:row.route,width:row.width,status:row.status,screenshot:row.screenshot.replaceAll('\\','/'),visualReviewed:true,preview:row.finalURL,scope:'Normal full-page composition. Focused text and state assertions recorded separately.'};
 if(flow){item.alternateStateEvidence={delivery:'Mocked local-only delivery, not production configuration',intro:root+'/assessment-dist/'+flow.id+'-'+row.width+'-intro.png',result:root+'/assessment-dist/'+flow.id+'-'+row.width+'-result.png',visualReviewed:true,scriptFailureChecks:root+'/focused-dist/report.json'};}
 return item;
});
if(output.length!==231||output.some(x=>!fs.existsSync(x.screenshot)))throw new Error('Coverage incomplete');
fs.writeFileSync(root+'/final-coverage.json',JSON.stringify(output,null,2));
console.log(output.length+' primary reviewed snapshots, '+output.filter(x=>x.alternateStateEvidence).length+' alternative assessment states');
