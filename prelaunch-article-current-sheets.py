import sys,json,math
from pathlib import Path

from PIL import Image,ImageDraw,ImageFont
root=Path('scraps/prelaunch-2026-10-12/articles')
sheets=root/'sheets-final';sheets.mkdir(exist_ok=True)
try: font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',13)
except: font=ImageFont.load_default()
for width in [1440,768,390]:
 rows=json.loads((root/f'results-{width}.json').read_text(encoding='utf-8'))
 for start in range(0,len(rows),9):
  subset=rows[start:start+9]
  if len(subset)!=9 and len(rows)!=204:continue
  dest=sheets/f'{width}-{start//9:02}.jpg'
  if dest.exists():continue
  canvas=Image.new('RGB',(1890,1850),'#dbe4ee');draw=ImageDraw.Draw(canvas)
  for j,row in enumerate(subset):
   if not row.get('screenshot'):continue
   im=Image.open(root/row['screenshot']).convert('RGB');im.thumbnail((202,1765),Image.Resampling.LANCZOS)
   x=j*210+(210-im.width)//2
   draw.text((j*210+5,5),f"{row['index']:03} / {width}",fill='black',font=font)
   route=row['route'].replace('health/','').replace('/index.html','')
   for line in range(3):draw.text((j*210+5,24+line*15),route[line*27:(line+1)*27],fill='black',font=font)
   canvas.paste(im,(x,78))
  canvas.save(dest,quality=88)
print('Sheets',len(list(sheets.glob('*.jpg'))))



