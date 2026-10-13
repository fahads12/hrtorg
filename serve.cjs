// Local-only preview. No directory listings or exposure of crawl records/dependencies.
const http=require('http'),fs=require('fs'),path=require('path');
const root=process.argv.includes('--dist')?path.join(__dirname,'dist'):__dirname;
const portFlag=process.argv.indexOf('--port');
const port=Number(portFlag>=0?process.argv[portFlag+1]:process.env.PORT||8000);
const redirects=require('./vercel.json').redirects.filter(r=>!r.source.includes(':'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
function notFound(res){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(root,'404.html')));}
http.createServer((req,res)=>{
 if(!['::1','127.0.0.1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)){res.writeHead(403).end();return;}
 res.setHeader('X-Robots-Tag','noindex');
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
 let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 // Encoded control characters are not valid public paths. In particular, a NUL
 // would make fs.readFile throw synchronously and terminate the preview server.
 if(/[\u0000-\u001f\u007f]/.test(route)){res.writeHead(400).end();return;}
 const redirect=redirects.find(r=>r.source===route.replace(/\/$/,''));
 if(redirect){const destination=new URL(redirect.destination,'http://localhost');const query=new URL(req.url,'http://localhost').searchParams;for(const [key,value] of query)if(!destination.searchParams.has(key))destination.searchParams.append(key,value);res.writeHead(redirect.permanent?308:307,{Location:redirect.destination.startsWith('https:')?destination.href:destination.pathname+destination.search}).end();return;}
 if(/^\/blog-categories\/(?:%20|\s)+heart-health\//i.test(route)){res.writeHead(308,{Location:'/blog-categories/heart-health/index.html'}).end();return;}
 let file=path.resolve(root,'.'+route);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 const relative=path.relative(root,file);if(/^(?:node_modules|source-content|scraps|dist|\.[^\\/]+)(?:[\\/]|$)/i.test(relative)){res.writeHead(404).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 const ext=path.extname(file);if(!mime[ext]){notFound(res);return;}
 fs.readFile(file,(err,data)=>{if(err){notFound(res);return;}res.writeHead(200,{'Content-Type':mime[ext],'Cache-Control':ext==='.html'?'no-store':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);});
}).listen(port,'::',()=>{
 console.log('HRT website: http://localhost:'+port+'/');
 console.log('HRT patient portal: http://localhost:'+port+'/portal/');
});
