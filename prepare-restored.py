from pathlib import Path
import json,sys,re
ROOT=Path(__file__).parent
sys.path.insert(0,str(ROOT/'.tools'))
from bs4 import BeautifulSoup
from PIL import Image
out=ROOT/'uploads/generated';out.mkdir(exist_ok=True)
for name,source in [('wellness-editorial','exec-28045bf4-d5e9-4f93-ad8e-066f613f0c18.png'),('science-editorial','exec-33912088-84e6-470b-b164-54bd3b916074.png')]:
    original=Path('C:/Users/Fahad/.codex/generated_images/01a12832-143d-7b01-8670-4eadf4d6749c')/source
    if original.exists() and not (out/(name+'.webp')).exists():
        image=Image.open(original);image.thumbnail((1440,960));image.save(out/(name+'.webp'),'WEBP',quality=86)
pages=json.loads((ROOT/'source-content/page-content.json').read_text(encoding='utf8'))
category_membership={c['key']:c['articles'] for c in json.loads((ROOT/'source-content/category-membership.json').read_text(encoding='utf8'))['categories']}
def text(markup):return BeautifulSoup(markup,'html.parser').get_text(' ',strip=True)
def sections(markup):
    soup=BeautifulSoup(markup,'html.parser');result=[];current={'title':'Overview','html':''}
    for node in soup.contents:
        if getattr(node,'name',None) in ('h2','h3','h4'):
            if current['html'].strip():result.append(current)
            current={'title':node.get_text(' ',strip=True),'html':''}
        else:current['html']+=str(node)
    if current['html'].strip():result.append(current)
    return [s for s in result if text(s['html'])]
data={'services':{},'about':pages['about'],'articles':[],'categories':[], 'faq':[]}
for key,p in pages.items():
    if key.startswith(('men/','women/')):
        p['sections']=sections(p['body']);p['questions']=[{'q':s['title'],'a':text(s['html'])} for s in p['sections'] if '?' in s['title']]
        data['services'][key]=p
    if key.startswith('health/'):
        p['sections']=sections(p['body']);data['articles'].append(p)
    if key.startswith('blog-categories/') and '%20' not in key:
        links=category_membership[key]
        data['categories'].append({'key':key,'title':p['title'],'route':p['route'],'articles':links})
faq=BeautifulSoup((ROOT/'FAQ.html').read_text(encoding='utf8'),'html.parser')
for d in faq.select('.source-faqs details'):data['faq'].append({'q':d.summary.get_text(' ',strip=True),'a':d.select_one('.source-prose').get_text(' ',strip=True)})
data['about']['sections']=sections(data['about']['body'])
data['providers']=[p for k,p in pages.items() if k.startswith('providers/') and p['image']]
(ROOT/'source-content/restored-data.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf8')
print('Prepared full source content and two generated WebP assets.')
