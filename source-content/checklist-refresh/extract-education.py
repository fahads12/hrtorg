import sys,json,re
from pathlib import Path
sys.path.insert(0,str(Path('.tools').resolve()))
from bs4 import BeautifulSoup
folder=Path('source-content/checklist-refresh')
slugs=[x['slug'] for x in json.loads((folder/'inventory.json').read_text(encoding='utf-8'))]
result={}
allowed={'h2','h3','p','ul','ol','li','a','strong','em','b','i','br','blockquote','table','thead','tbody','tr','th','td','caption','sup','sub'}
for slug in slugs:
    doc=BeautifulSoup((folder/(slug+'.html')).read_text(encoding='utf-8'),'html.parser')
    blocks=[]
    for original in doc.select('.w-richtext'):
        if original.find_parent(class_='w-richtext'): continue
        block=BeautifulSoup(str(original),'html.parser')
        for node in list(block.select('.w-embed, script, style, form, iframe, input, button, select, textarea, noscript, svg, figure, img')):
            if node.parent: node.decompose()
        for heading in block.find_all('h1'): heading.name='h2'
        for heading in block.find_all(['h4','h5','h6']): heading.name='h3'
        for tag in list(block.find_all(True)):
            if tag.name not in allowed: tag.unwrap(); continue
            tag.attrs={k:v for k,v in tag.attrs.items() if (tag.name=='a' and k=='href') or (tag.name in ['td','th'] and k in ['colspan','rowspan'])}
        for node in list(block.find_all(['p','h2','h3','li'])):
            if not re.sub(r'[\s\u200b\u200c\u200d\ufeff\xa0]','',node.get_text()):node.decompose()
        html=str(block).strip()
        if html: blocks.append(html)
    result[slug]={'sourceUrl':'https://hrt.org/checklist/'+slug,'html':'\n'.join(blocks),'blockCount':len(blocks),'text':BeautifulSoup('\n'.join(blocks),'html.parser').get_text('\n',strip=True)}
    print(slug,len(result[slug]['html']),result[slug]['text'][:180].replace('\n',' | '))
(folder/'education.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')
