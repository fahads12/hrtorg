import json,urllib.request,urllib.error,urllib.parse,concurrent.futures,time,re,ssl
from pathlib import Path
root=Path('scraps/prelaunch')
records=json.loads((root/'external-links.json').read_text(encoding='utf-8'))
records=[r for r in records if urllib.parse.urlsplit(r['url']).hostname not in ['store.hrt.org','portal.hrt.org']]
class RedirectRecorder(urllib.request.HTTPRedirectHandler):
 def __init__(self):self.history=[]
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  self.history.append({'from':req.full_url,'status':code,'to':newurl})
  return super().redirect_request(req,fp,code,msg,headers,newurl)
def check(url):
 redirects=RedirectRecorder();opener=urllib.request.build_opener(redirects);started=time.monotonic()
 row={'requestURL':url,'method':'GET'}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36','Accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'})
  with opener.open(req,timeout=18)as response:
   body=response.read(65536).decode('utf-8','replace');title=re.search(r'<title\b[^>]*>([\s\S]*?)</title>',body,re.I)
   row.update(status=response.status,finalURL=response.geturl(),contentType=response.headers.get('Content-Type'),title=re.sub(r'\s+',' ',title.group(1)).strip()if title else None)
 except urllib.error.HTTPError as e:row.update(status=e.code,finalURL=e.geturl(),error=str(e))
 except Exception as e:row.update(status=None,error=type(e).__name__+': '+str(e))
 row.update(redirects=redirects.history,elapsed=round(time.monotonic()-started,2));return row
unique=list(dict.fromkeys(urllib.parse.urldefrag(r['url'])[0]for r in records))
with concurrent.futures.ThreadPoolExecutor(max_workers=7)as pool:results=dict(zip(unique,pool.map(check,unique)))
report={'checkedOn':'2026-10-12','method':'Read-only Python urllib GET, default certificate verification, at most 64 KiB per destination; no POST or form interactions.','scope':'All external references except portal/store handled by main-services agent.','uniqueRequests':len(unique),'rows':[]}
for original in records:
 row={**original,**results[urllib.parse.urldefrag(original['url'])[0]]};row['classification']='reachable' if row.get('status')==200 else 'access-blocked-or-rate-limited'if row.get('status')in [401,403,429] else 'unreachable-in-this-check'
 if row.get('status')==200 and row['redirects']:row['classification']='redirected-reachable'
 report['rows'].append(row)
(root/'external-reference-check.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
for row in report['rows']:print(json.dumps({k:row.get(k)for k in ['url','status','finalURL','classification','error','title']},ensure_ascii=True))
