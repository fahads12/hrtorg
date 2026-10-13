from pathlib import Path
import sys,json
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0,str(Path(__file__).parent/'.tools'))
from bs4 import BeautifulSoup
pages=json.loads(Path('source-content/crawl.json').read_text(encoding='utf8'))
for slug in sys.argv[1:]:
 p=next((p for p in pages if p['slug']==slug),None)
 if not p:continue
 print('\nPAGE',slug,'FINAL',p.get('finalUrl'),flush=True)
 s=BeautifulSoup(Path('source-content/html/'+p['file']+'.html').read_text(encoding='utf8'),'html.parser')
 for x in s.select('script,style,nav,footer,.navbar-container,.footer,.search-modal,.hide,.w-commerce-commercecartwrapper'):x.decompose()
 print('BLOCKS',[(x.name,x.get('class'),len(x.get_text())) for x in s.body.find_all(recursive=False)])
 print('RICH',[(x.get('class'),len(x.get_text())) for x in s.select('.w-richtext')])
 print('IMAGES',[(i.get('alt'),i.get('src')) for i in s.select('img[src]')][:10])
 print('ACTIONS',[(a.get_text(' ',strip=True),a.get('href')) for a in s.select('a[href]') if not a.get('href','').startswith('#')][:15])
 print('EMBEDS',p.get('embeds'),'FORMS',p.get('forms'))
 print(s.get_text('\n',strip=True)[:22000])
