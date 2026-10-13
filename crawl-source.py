"""Read-only public HRT.org crawl; no form submissions, cart actions, or checkout requests."""
from pathlib import Path
import sys, json, re, time, urllib.request, urllib.parse, concurrent.futures, xml.etree.ElementTree as ET
ROOT=Path(__file__).parent
sys.path.insert(0,str(ROOT/'.tools'))
from bs4 import BeautifulSoup
OUT=ROOT/'source-content'; OUT.mkdir(exist_ok=True)
RAW=OUT/'html'; RAW.mkdir(exist_ok=True)
def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'HRT-Content-Migration/1.0 (read-only website redesign)'})
    with urllib.request.urlopen(req,timeout=35) as response:
        return response.read().decode('utf-8',errors='replace'), response.url, response.status
def canonical(url):
    parsed=urllib.parse.urlparse(url)
    if parsed.hostname not in ('hrt.org','www.hrt.org'): return None
    if parsed.query or re.search(r'\.(png|jpe?g|webp|svg|pdf|css|js|zip)$',parsed.path,re.I):return None
    if any(x in parsed.path for x in ['/checkout','/cart','/order-confirmation','/paypal-checkout']):return None
    return 'https://hrt.org'+parsed.path.rstrip('/')
def read(url):
    slug=urllib.parse.urlparse(url).path.strip('/') or 'home'
    name=slug.replace('/','__')
    try:
        html,final,status=fetch(url)
        (RAW/(name+'.html')).write_text(html,encoding='utf-8')
        soup=BeautifulSoup(html,'html.parser')
        links=[{'text':a.get_text(' ',strip=True),'href':urllib.parse.urljoin(final,a['href'])} for a in soup.select('a[href]')]
        images=[{'src':urllib.parse.urljoin(final,i.get('src','')),'alt':i.get('alt',''),'srcset':i.get('srcset','')} for i in soup.select('img[src]')]
        forms=[{'action':f.get('action',''),'method':f.get('method',''),'name':f.get('data-name',f.get('name','')),'fields':[{'name':i.get('name',''),'type':i.get('type',i.name),'label':i.get('placeholder','')} for i in f.select('input,textarea,select')]} for f in soup.select('form')]
        embeds=[dict(i.attrs) for i in soup.select('iframe')]
        for element in soup.select('script,style,noscript,svg'):element.decompose()
        text=soup.get_text('\n',strip=True)
        (OUT/(name+'.txt')).write_text(text,encoding='utf-8')
        description=soup.select_one('meta[name="description"]')
        return {'url':url,'finalUrl':final,'status':status,'slug':slug,'file':name,'title':soup.title.get_text() if soup.title else slug,'description':description.get('content','') if description else '', 'headings':[{'tag':h.name,'text':h.get_text(' ',strip=True),'class':h.get('class',[])} for h in soup.select('h1,h2,h3')], 'links':links,'images':images,'forms':forms,'embeds':embeds,'text':text}
    except Exception as error:return {'url':url,'slug':slug,'file':name,'error':str(error)}
robots,_,_=fetch('https://hrt.org/robots.txt');(OUT/'robots.txt').write_text(robots)
sitemap,_,_=fetch('https://hrt.org/sitemap.xml');(OUT/'sitemap.xml').write_text(sitemap)
urls={canonical(el.text) for el in ET.fromstring(sitemap).iter() if el.tag.endswith('loc')};urls.discard(None)
seen=set();pages=[]
while urls:
    batch=sorted(urls-seen)
    if not batch:break
    seen.update(batch);urls=set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(read,batch):
            pages.append(result)
            print(result.get('status','ERROR'),result['url'],flush=True)
            for link in result.get('links',[]):
                nxt=canonical(link['href'])
                if nxt and nxt not in seen:urls.add(nxt)
    (OUT/'crawl.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
    if len(seen)>1000:raise RuntimeError('Unexpected URL volume: inspect before continuing.')
print('TOTAL',len(pages),'ERRORS',sum('error' in p for p in pages),flush=True)
