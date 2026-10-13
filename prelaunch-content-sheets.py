import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root=Path('scraps/prelaunch-2026-10-12/content')
sheets=root/'sheets'
sheets.mkdir(exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
rows=json.loads((root/'report.json').read_text(encoding='utf-8'))
for width in [1440,768,390]:
    group=sorted((r for r in rows if r['width']==width),key=lambda r:r['route'])
    for start in range(0,len(group),6):
        canvas=Image.new('RGB',(1860,2050),'#dbe4ee')
        draw=ImageDraw.Draw(canvas)
        for j,row in enumerate(group[start:start+6]):
            draw.text((j*310+5,5),f"{start+j+1:02d} / {width}",fill='black',font=font)
            route=row['route'].replace('/index.html','')
            for line in range(3):
                draw.text((j*310+5,26+line*16),route[line*39:(line+1)*39],fill='black',font=font)
            if row.get('screenshot'):
                im=Image.open(row['screenshot']).convert('RGB')
                im.thumbnail((300,1960),Image.Resampling.LANCZOS)
                canvas.paste(im,(j*310+(310-im.width)//2,85))
        canvas.save(sheets/f'{width}-{start//6:02d}.jpg',quality=90)
print(len(list(sheets.glob('*.jpg'))),'review sheets')
