import sys,json
from pathlib import Path
sys.path.insert(0,'.tools')
from PIL import Image,ImageDraw
root=Path('scraps/prelaunch/forms-info/handoffs')
report=json.loads((root/'report.json').read_text())
for idx,route in enumerate(dict.fromkeys(r['route']for r in report['rows'])):
 sheet=Image.new('RGB',(1500,1800),'#e3e8ef');draw=ImageDraw.Draw(sheet)
 for i,row in enumerate(r for r in report['rows']if r['route']==route):
  im=Image.open(row['screenshot']).convert('RGB');im.thumbnail((490,1750));sheet.paste(im,(i*500+(500-im.width)//2,40));draw.text((i*500+8,8),str(row['width']),fill='black')
 sheet.save(root/f'review-{idx+1}.jpg',quality=94)
