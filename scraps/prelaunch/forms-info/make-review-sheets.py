import json,sys,math
from pathlib import Path
sys.path.insert(0,'.tools')
from PIL import Image,ImageDraw,ImageFont
root=Path('scraps/prelaunch/forms-info')
rows=json.loads((root/'report.json').read_text(encoding='utf-8'))
out=root/'review-sheets';out.mkdir(exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
manifest=[]
for width in [1440,768,390]:
 selected=sorted([r for r in rows if r['width']==width and 'screenshot'in r],key=lambda r:r['route'])
 for group in range(math.ceil(len(selected)/6)):
  batch=selected[group*6:(group+1)*6]
  sheet=Image.new('RGB',(1200,2000),'#e3e8ef');draw=ImageDraw.Draw(sheet)
  names=[]
  for i,row in enumerate(batch):
   x=(i%3)*400;y=(i//3)*1000
   im=Image.open(row['screenshot']).convert('RGB');im.thumbnail((392,930))
   sheet.paste(im,(x+(400-im.width)//2,y+65))
   route=row['route'];label=route.replace('/index.html','').replace('hormone-symptom-checklist','hormone-checklist')
   draw.text((x+5,y+5),str(group*6+i+1)+'. '+label[:45],fill='black',font=font)
   draw.text((x+5,y+25),label[45:90]+' | '+str(width),fill='black',font=font)
   names.append(row['route'])
  filename=f'sheet-{width}-{group+1:02}.jpg';sheet.save(out/filename,quality=90)
  manifest.append({'file':str(out/filename),'width':width,'routes':names})
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
print(len(manifest),'review sheets')
