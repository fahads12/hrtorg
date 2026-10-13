import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path('scraps/prelaunch-2026-10-12/content')
rows=json.loads((root/'assessment-flows-dist.json').read_text())['cases']
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
mode=sys.argv[1] if len(sys.argv)>1 else 'result'
for width in ([390] if mode=='question' else [1440,768,390]):
    group=[r for r in rows if r['width']==width]
    for start in range(0,9,3):
        canvas=Image.new('RGB',(1500,2050),'#dbe4ee');draw=ImageDraw.Draw(canvas)
        for j,r in enumerate(group[start:start+3]):
            draw.text((j*500+10,10),f"{r['id']} / {width} / {mode}",fill='black',font=font)
            im=Image.open(root/'assessment-dist'/f"{r['id']}-{width}-{mode}.png").convert('RGB')
            im.thumbnail((490,1980),Image.Resampling.LANCZOS)
            canvas.paste(im,(j*500+(500-im.width)//2,40))
        canvas.save(root/'assessment-dist'/f'sheet-{mode}s-{width}-{start//3}.jpg',quality=94)
