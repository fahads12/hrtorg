import json,sys,math
from pathlib import Path
sys.path.insert(0,'.tools')
from PIL import Image,ImageDraw,ImageFont
root=Path('scraps/prelaunch/forms-info')
out=root/'final-review';out.mkdir(exist_ok=True)
rows=json.loads((root/'final/report.json').read_text(encoding='utf-8'))['rows']
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
manifest=[]
def sheet(batch,name):
 canvas=Image.new('RGB',(1500,1800),'#e3e8ef');draw=ImageDraw.Draw(canvas)
 for i,(file,label) in enumerate(batch):
  x=i%3*500;y=i//3*900
  im=Image.open(file).convert('RGB');im.thumbnail((485,840));canvas.paste(im,(x+(500-im.width)//2,y+55))
  draw.text((x+5,y+5),label[:63],fill='black',font=font);draw.text((x+5,y+23),label[63:126],fill='black',font=font)
 file=out/(name+'.jpg');canvas.save(file,quality=93);manifest.append({'file':str(file),'sources':[str(x[0]) for x in batch]})
for width in [1440,768,390]:
 selected=sorted([r for r in rows if r['width']==width and r.get('screenshot')],key=lambda r:r['route'])
 for g in range(math.ceil(len(selected)/6)):
  sheet([(r['screenshot'],r['route'])for r in selected[g*6:(g+1)*6]],f'changed-{width}-{g+1}')
 files=sorted(Path('scraps/checklist-results').glob(f'*-{width}-result.png'))
 for g in range(math.ceil(len(files)/6)):
  sheet([(p,p.name)for p in files[g*6:(g+1)*6]],f'results-{width}-{g+1}')
 files=sorted(Path('scraps/checklist-localization/after').glob(f'*-{width}-question.png'))
 for g in range(math.ceil(len(files)/6)):
  sheet([(p,p.name)for p in files[g*6:(g+1)*6]],f'questions-{width}-{g+1}')
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
print(len(manifest),'review sheets')
