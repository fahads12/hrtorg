from PIL import Image,ImageDraw
from pathlib import Path
import json,math
root=Path(__file__).parent
rows=json.loads((root/'coverage.json').read_text(encoding='utf-8'))
for row in rows:
 if not row.get('screenshot'):continue
 file=root/row['screenshot']; im=Image.open(file).convert('RGB')
 scale=min(1,420/im.width); step=1200; n=math.ceil(im.height/step); cols=min(4,n); cellw=round(im.width*scale)+12; cellh=round(step*scale)+30
 canvas=Image.new('RGB',(cellw*cols,cellh*math.ceil(n/cols)), '#e8e9ec');d=ImageDraw.Draw(canvas)
 for i in range(n):
  piece=im.crop((0,i*step,im.width,min((i+1)*step,im.height)));piece=piece.resize((round(piece.width*scale),round(piece.height*scale)))
  x=i%cols*cellw;y=i//cols*cellh;d.text((x+4,y+5),f'{i+1}/{n} | {row["width"]}px',fill='black');canvas.paste(piece,(x,y+25))
 canvas.save(root/('sheet-'+file.stem+'.jpg'),quality=87)
print(len(rows))
