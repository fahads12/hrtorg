import json,collections,urllib.parse
from pathlib import Path
root=Path('scraps/prelaunch');raw=json.loads((root/'external-reference-check.json').read_text());browser=json.loads((root/'external-reference-browser-check.json').read_text());lookup={r['url']:r for r in browser['results']}
for row in raw['rows']:
 followup=lookup.get(row['requestURL']);row['browserVerification']=followup
 if followup:
  row['verifiedStatus']=followup.get('status');row['verifiedFinalURL']=followup.get('finalURL')if followup.get('status') else None
 else:row['verifiedStatus']=row.get('status');row['verifiedFinalURL']=row.get('finalURL')
 title=(followup or row).get('title')or'';body=(followup or{}).get('bodyExcerpt')or''
 if 'content isn\'t available' in body:classification='page-content-unavailable'
 elif row['verifiedStatus'] in [401,403,429,203]or any(w in(title+' '+body).lower()for w in['recaptcha','checking your browser','performing security verification']):classification='access-blocked-or-verification-required'
 elif row['verifiedStatus']==200:classification='redirected-reachable'if row['redirects']or row['verifiedFinalURL']!=row['requestURL']else'reachable'
 else:classification='unreachable-in-both-clients'
 row['classification']=classification
 if '1.usa.gov/1Nxq0tj'in row['url']:row['sourceRelevanceConcern']='Short reference now ends at generic USA.gov homepage, not a menopause source.'
 if 'medmind.com'in row['url']:row['sourceRelevanceConcern']='Current title and page describe a broad AI healthcare-support platform; archived article describes a medication/pill tracker. Source-owner review required.'
 if '/picture-of-the-kidneys'in row['url']:row['sourceRelevanceConcern']='Old kidney anatomy/picture reference now resolves to a kidney-health guidance article. Check support for cited claim.'
 if 'umm.edu/'in row['url']:row['sourceRelevanceConcern']='Original osteoporosis reference redirects to generic /ummc/hl endpoint, which presents a verification challenge. Exact source availability unconfirmed.'
raw['browserFollowupCount']=len(browser['results']);raw['counts']=dict(collections.Counter(r['classification']for r in raw['rows']));raw['note']='HTTP status and page reachability do not certify the accuracy or continued relevance of a clinical citation. Access denial/challenges are not classified as dead links. No source clinical links were edited.'
(root/'external-reference-check.json').write_text(json.dumps(raw,indent=2))
lines=['# External reference and legacy-route audit','', 'Read-only verification on 12 October 2026: 38 external URL records (37 distinct requests) outside portal/store; 19 uncertain destinations checked independently in Chrome. Requests used no credentials, forms, POSTs, or writes. Clinical references were not altered.','', '## Status summary','']
lines += [f'- {label}: {count}'for label,count in raw['counts'].items()]
lines += ['', '## Unavailable or changed references requiring review','']
for row in raw['rows']:
 if row['classification']in['unreachable-in-both-clients','page-content-unavailable']or row.get('sourceRelevanceConcern'):
  lines += [f"- `{row['url']}`",f"  - Result: {row['classification']}; HTTP {row['verifiedStatus']or'none'}; destination `{row['verifiedFinalURL']or'unresolved'}`."]
  if row.get('sourceRelevanceConcern'):lines += ['  - '+row['sourceRelevanceConcern']]
  elif row.get('error'):lines += ['  - '+row['error']]
  routes=', '.join('`'+r+'`'for r in row['routes'])if len(row['routes'])<8 else f"Shared footer on {len(row['routes'])} routes (full list in JSON)."
  lines += ['  - Used on: '+routes]
lines += ['', '## Verification limitations','', '- NCBI Books displays a reCAPTCHA/browser check despite HTTP 200. Four PubMed destinations return 403 in Chrome (203 interstitial responses in urllib). This does not establish broken source records.', '- HealthCentral (old EndocrineWeb), Mayo Clinic, UMMS, and Honeybee support return access/security challenges. Keep them unverified rather than claiming successful content access.', '- CDC returns 403 to urllib but loads the proper current homepage with HTTP 200 in Chrome.', '- NIAMS returned DNS failure in both clients here. This is an observed environment result, not evidence that the institution/domain ceased operating.', '- Facebook responds with HTTP 200 but says its HRT page content is unavailable; public profile availability needs owner confirmation.', '- Successful references and redirect chains, including PMC, NHLBI, MedlinePlus, WomensHealth, Oregon State, WebMD, X and Google ads settings, are listed with exact source routes in `external-reference-check.json`. Google preferences ends in its blocked-cookies guidance; no settings were changed.', '', '## Legacy-route mappings', '', 'The source page index has ten original slugs without matching published directory files. Current Vercel configuration initially did not cover them. Suggested permanent mappings:', '']
for r in json.loads((root/'legacy-route-suggestions.json').read_text()):
 if not r['currentDirectoryAlias']:lines += [f"- `{r['source']}` → `{r['destination']}`"]
lines += ['', '`/lab-testing` already has an HTML directory alias; an HTTP permanent redirect to `/Lab Testing.html` is a cleaner canonical handoff. The encoded old heart-health category already has explicit redirect coverage. Parent audit agent owns deployment mapping implementation.', '', 'Evidence: `external-reference-check.json`, `external-reference-browser-check.json`, `legacy-route-suggestions.json`.']
(root/'EXTERNAL-REFERENCE-REPORT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8');print(json.dumps({'counts':raw['counts'],'browserFollowups':raw['browserFollowupCount']},indent=2))
