const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');

// Chrome's long bitmap capture wraps at 16,384px on this machine.
// Short capture regions keep every article section and the footer intact.
module.exports=async function captureArticle(page,file){
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  if(height<=16000)return page.screenshot({path:file,fullPage:true});
  const width=page.viewportSize().width;
  const client=await page.context().newCDPSession(page);
  const dir=path.join(path.dirname(file),'tiles');
  fs.mkdirSync(dir,{recursive:true});
  const tiles=[];
  for(let y=0;y<height;y+=7000){
    const shot=await client.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,fromSurface:true,clip:{x:0,y,width,height:Math.min(7000,height-y),scale:1}});
    const tile=path.join(dir,path.basename(file,'.png')+'-'+y+'.png');
    fs.writeFileSync(tile,Buffer.from(shot.data,'base64'));
    tiles.push(tile);
  }
  await client.detach();
  execFileSync('C:/Users/Fahad/anaconda3/python.exe',['-c',"import sys;sys.path.insert(0,'.tools');from PIL import Image;images=[Image.open(p).convert('RGB') for p in sys.argv[2:]];canvas=Image.new('RGB',(images[0].width,sum(i.height for i in images)));y=0\nfor i in images:\n canvas.paste(i,(0,y));y+=i.height\ncanvas.save(sys.argv[1])",file,...tiles],{cwd:__dirname});
};

