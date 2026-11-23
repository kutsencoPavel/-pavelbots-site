import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const site=new URL((await fs.readFile(path.join(root,'landing/site-url.txt'),'utf8')).trim());
if(site.protocol!=='https:'||site.pathname!=='/'||site.search||site.hash)throw Error('Expected HTTPS site origin');
const dist=path.join(root,'dist');
const rev=(await fs.readFile(path.join(dist,'deploy-revision.txt'),'utf8')).trim();
if(!/^[a-f0-9]{64}$/.test(rev))throw Error('Invalid build revision');
const key=crypto.createHash('sha256').update('pavel-bot-studio|'+site.origin).digest('hex').slice(0,32);
if((await fs.readFile(path.join(dist,key+'.txt'),'utf8')).trim()!==key)throw Error('Missing local key');
const xml=await fs.readFile(path.join(dist,'sitemap.xml'),'utf8');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
if(!urls.length||urls.length>10000)throw Error('Invalid sitemap URL count');
for(const u of urls)if(new URL(u).origin!==site.origin)throw Error('Cross-domain URL rejected');
const payload={host:site.hostname,key,keyLocation:new URL('/'+key+'.txt',site).href,urlList:urls};
if(process.argv.includes('--dry-run')){
  console.log(JSON.stringify({site:site.origin,revision:rev,keyLocation:payload.keyLocation,urlCount:urls.length},null,2));
  process.exit(0);
}
const fetchText=async(url)=>{
  const r=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw Error('HTTP '+r.status);
  return (await r.text()).trim();
};
let published=false;
for(let i=1;i<=24;i++){
  try{
    const found=await fetchText(new URL('/deploy-revision.txt?v='+rev,site).href);
    if(found===rev){published=true;break;}
    console.log('Tuqo revision not current, check '+i+'/24');
  }catch(e){console.log('Tuqo check '+i+'/24: '+e.message);}
  if(i<24)await new Promise(r=>setTimeout(r,15000));
}
if(!published)throw Error('Tuqo has not deployed this revision; IndexNow not submitted');
const liveKey=await fetchText(new URL('/'+key+'.txt?v='+rev,site).href);
if(liveKey!==key)throw Error('Published IndexNow key mismatch');
let failures=0;
for(const endpoint of ['https://www.bing.com/indexnow','https://yandex.com/indexnow']){
  try{
    const response=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json; charset=utf-8'},
      body:JSON.stringify(payload),
      signal:AbortSignal.timeout(20000)
    });
    if(response.status!==200&&response.status!==202)throw Error('HTTP '+response.status);
    console.log(endpoint+' accepted HTTP '+response.status+' for '+urls.length+' URLs');
  }catch(e){failures++;console.error(endpoint+': '+e.message);}
}
if(failures)throw Error('IndexNow notification failed for '+failures+' service(s)');
console.log('Notifications accepted; indexing not guaranteed');
