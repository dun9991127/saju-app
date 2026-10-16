// 사용법: node build.js  → index.html(게시용) + dist-app/(설치형 웹앱 꾸러미) 생성
const fs=require('fs'); const d=__dirname;
require('./build-engine.js');
const eng=fs.readFileSync(d+'/build/engine.built.js','utf8');
const tpl=fs.readFileSync(d+'/src/template.html','utf8');
const s='<script>\n'+eng+'\n</script>\n<script>\n'+fs.readFileSync(d+'/src/texts.js','utf8')+'\n</script>\n<script>\n'+fs.readFileSync(d+'/src/app.js','utf8')+'\n</script>';
const page=tpl.replace('<!--SCRIPTS-->',()=>s);
fs.writeFileSync(d+'/index.html',page);
// 설치형 웹앱(PWA): 완전한 문서 + 매니페스트 + 오프라인 캐시
const head='<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#2f3b66">\n<meta name="description" content="생년월일시를 넣으면 사주 원국표, 쉬운 말 총론, 일간·주간·월간·연간 운세를 보여 주는 만세력 앱">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon-192.png">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="사주 명식">\n<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n';
const sw='<script>if("serviceWorker" in navigator){addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}</script>\n';
const parts=page.split('</style>');
const app=head+parts[0]+'</style>\n</head>\n<body>\n'+parts.slice(1).join('</style>')+'\n'+sw+'</body>\n</html>\n';
fs.writeFileSync(d+'/dist-app/index.html',app);
fs.writeFileSync(d+'/dist-app/manifest.webmanifest',JSON.stringify({name:'나의 사주 명식',short_name:'사주 명식',description:'사주 원국표와 일간·주간·월간·연간 운세',lang:'ko',start_url:'./',scope:'./',display:'standalone',background_color:'#eef0ec',theme_color:'#2f3b66',
 icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png'},{src:'icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},null,2));
const ver=Date.now().toString(36);
fs.writeFileSync(d+'/dist-app/sw.js',`const C='saju-${ver}';const F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));return}e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res}).catch(()=>caches.match('index.html'))))});
`);
