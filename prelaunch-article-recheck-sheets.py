import sys,json
sys.path.insert(0,'.tools')
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
p=Path('scraps/prelaunch/articles/recheck')
f=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
data=json.loads((p/'results.json').read_text())['results']
for route in dict.fromkeys(r['route'] for r in data):
    rows=[r for r in data if r['route']==route]
    sheet=Image.new('RGB',(1440,1900),'#dce4ed');d=ImageDraw.Draw(sheet)
    for j,r in enumerate(rows):
        im=Image.open(p/r['screenshot']).convert('RGB');im.thumbnail((460,1810))
        sheet.paste(im,(j*480+(460-im.width)//2,70));d.text((j*480+10,10),str(r['index'])+' / '+str(r['width']),font=f,fill='black')
    sheet.save(p/f"overview-{rows[0]['index']:03}.jpg")
