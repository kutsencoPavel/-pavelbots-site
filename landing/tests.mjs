import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve('.');
// Тесты не должны зависеть от настроек окружения хостинга.
const hostStartParams=process.env.SITE_START_PARAMS, hostEmail=process.env.SITE_CONTACT_EMAIL;
delete process.env.SITE_START_PARAMS; delete process.env.SITE_CONTACT_EMAIL;
execFileSync(process.execPath,['landing/build.mjs'],{cwd:root,stdio:'inherit',env:{...process.env,SITE_URL:''}});
const r=(p)=>fs.readFileSync(path.join(root,'dist',p),'utf8');
const pages=['index.html','telegram/index.html','max/index.html','vk/index.html','whatsapp/index.html','ai-bots/index.html','bot-dlya-zapisi/index.html','bot-dlya-zayavok/index.html','privacy/index.html'];
for(const p of pages){const html=r(p);assert.match(html,/<html lang="ru">/);assert.match(html,/<title>[^<]+<\/title>/);assert.match(html,/<meta name="description"/);assert.match(html,/<h1>/);assert.match(html,/application\/ld\+json/);assert.match(html,/pavel_chatbots_bot/);assert.doesNotMatch(html,/href="\s*#"/);}
assert.match(r('index.html'),/<meta name="yandex-verification" content="57833afd1e8f909f">/);
assert.match(r('index.html'),/<meta name="google-site-verification" content="mSBEJydp2Je3q9DBACxDokrL8gQo7iM_daa-HLTNPdI">/);
assert.match(r('deploy-revision.txt'),/^[a-f0-9]{64}\n$/);
assert.match(r('robots.txt'),/OAI-SearchBot/);
assert.match(r('robots.txt'),/Yandex/);
assert.match(r('llms.txt'),/MAX-боты/);
const configuredUrl=fs.readFileSync(path.join(root,'landing/site-url.txt'),'utf8').trim();
assert.equal(fs.existsSync(path.join(root,'dist/sitemap.xml')),Boolean(configuredUrl));
execFileSync(process.execPath,['landing/build.mjs'],{cwd:root,stdio:'inherit',env:{...process.env,SITE_URL:'https://example.tuqo.app'}});
assert.match(r('sitemap.xml'),/https:\/\/example\.tuqo\.app\/telegram\//);
assert.match(r('index.html'),/rel="canonical" href="https:\/\/example\.tuqo\.app\/"/);
assert.match(r('robots.txt'),/Sitemap: https:\/\/example.tuqo.app\/sitemap.xml/);
assert.match(r('sitemap.xml'),/\/bot-dlya-zapisi\//);
assert.match(r('sitemap.xml'),/\/bot-dlya-zayavok\//);
assert.match(r('index.html'),/href="\/bot-dlya-zapisi\/"/);
assert.match(r('index.html'),/href="\/bot-dlya-zayavok\/"/);
assert.match(r('bot-dlya-zapisi/index.html'),/актуальному расписанию/);
assert.match(r('bot-dlya-zayavok/index.html'),/[Пп]ошаговый опрос/);
assert.match(r('sitemap.xml'),/\/privacy\//);
console.log('PASS — '+(pages.length+6)+' checks: pages, copy, robots, AI, sitemap, canonical, privacy');

// Optional analytics: no tracker in default build; generated only with explicit HTTPS endpoint.
execFileSync(process.execPath,['landing/build.mjs'],{cwd:root,stdio:'inherit',env:{...process.env,SITE_URL:'https://example.tuqo.app',SITE_ANALYTICS_ENDPOINT:'https://stats.example.test/event'}});
assert.match(r('index.html'),/PAVEL_ANALYTICS_ENDPOINT/);
assert.match(r('index.html'),/start=site/);
assert.match(r('privacy/index.html'),/Техническая статистика/);
assert.match(r('analytics.js'),/telegram_click/);
assert.match(r('analytics.js'),/page_view/);

// The Railway analytics-only service is the default collector on the actual Tuqo domain.
const productionEnv={...process.env,SITE_URL:'https://pavelbots.tuqo.app'};
delete productionEnv.SITE_ANALYTICS_ENDPOINT;
execFileSync(process.execPath,['landing/build.mjs'],{cwd:root,stdio:'inherit',env:productionEnv});
assert.match(r('index.html'),/PAVEL_ANALYTICS_ENDPOINT/);
assert.match(r('index.html'),/pavel-chatbots-orders-production\.up\.railway\.app\/event/);
assert.match(r('index.html'),/start=site/);
assert.match(r('privacy/index.html'),/Права пользователей/);
assert.doesNotMatch(r('privacy/index.html'),/Черновая информационная страница/);

// Explicit empty env disables telemetry without changing the site's HTML or bot CTA.
execFileSync(process.execPath,['landing/build.mjs'],{cwd:root,stdio:'inherit',env:{...productionEnv,SITE_ANALYTICS_ENDPOINT:''}});
assert.doesNotMatch(r('index.html'),/PAVEL_ANALYTICS_ENDPOINT/);
assert.match(r('index.html'),/https:\/\/t\.me\/pavel_chatbots_bot/);
console.log('PASS — analytics-only Railway collector, privacy and explicit opt-out');

// SEO-целостность всех страниц на боевом адресе.
const build=(extra={})=>execFileSync(process.execPath,['landing/build.mjs'],{cwd:root,stdio:'pipe',env:{...productionEnv,...extra}});
build();
const locs=[...r('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc><lastmod>\d{4}-\d\d-\d\d<\/lastmod>/g)].map(m=>new URL(m[1]).pathname);
const htmlFiles=fs.readdirSync(path.join(root,'dist'),{recursive:true}).map(String).filter(f=>f.endsWith('index.html'));
assert.equal(locs.length,htmlFiles.length,'sitemap must list every page');
const titlesSeen=new Set(), descSeen=new Set();
const analyticsJs=fs.readFileSync(path.join(root,'landing/analytics.js'),'utf8');
const scriptJs=fs.readFileSync(path.join(root,'landing/script.js'),'utf8');
for(const pathname of locs){
  const html=r(pathname.slice(1)+'index.html');
  const title=html.match(/<title>([^<]+)<\/title>/)[1];
  const desc=html.match(/name="description" content="([^"]+)"/)[1];
  assert.ok(title.length<=70,'title too long: '+pathname);
  assert.ok(desc.length<=200,'description too long: '+pathname);
  assert.ok(!titlesSeen.has(title)&&!descSeen.has(desc),'duplicate meta: '+pathname);
  titlesSeen.add(title);descSeen.add(desc);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'one h1: '+pathname);
  assert.ok(html.includes('rel="canonical" href="https://pavelbots.tuqo.app'+pathname+'"'),'canonical: '+pathname);
  assert.match(html,/og:image" content="https:\/\/pavelbots\.tuqo\.app\/og\.png"/);
  const graph=JSON.parse(html.match(/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  for(const node of graph)if(node['@type']==='FAQPage')assert.ok(node.mainEntity.length>0,'empty FAQ: '+pathname);
  if(pathname!=='/')assert.ok(graph.some(n=>n['@type']==='BreadcrumbList'),'breadcrumbs: '+pathname);
  for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g))
    assert.ok(fs.existsSync(path.join(root,'dist',href.endsWith('/')?href+'index.html':href)),'broken link '+href+' on '+pathname);
  assert.ok(scriptJs.includes("'"+pathname+"':'"),'start-param page code missing: '+pathname);
  if(pathname!=='/privacy/')assert.ok(analyticsJs.includes("'"+pathname+"'"),'analytics allowlist: '+pathname);
}
assert.ok(fs.existsSync(path.join(root,'dist/og.png')));
// Демонстрации всегда помечены; цены не публикуются; ссылки на бота остаются прежними.
for(const pathname of locs){
  const html=r(pathname.slice(1)+'index.html');
  const demoCount=(html.match(/<figure class="demo">/g)||[]).length;
  assert.equal((html.match(/Демонстрация, не кейс клиента/g)||[]).length,demoCount,'unlabelled demo: '+pathname);
  if(demoCount)assert.match(html,/придуманы для иллюстрации/);
  if(pathname!=='/privacy/')assert.doesNotMatch(html,/₽|\d\s*руб/,'price published: '+pathname);
  for(const [,link] of html.matchAll(/href="(https:\/\/t\.me\/[^"]+)"/g))
    assert.ok(link==='https://t.me/pavel_chatbots_bot?start=site'||(pathname==='/privacy/'&&link==='https://t.me/pavel_chatbots_bot'),'bot link changed: '+pathname);
}
assert.equal((r('index.html').match(/<figure class="demo">/g)||[]).length,3);
assert.match(r('index.html'),/id="examples"/);
assert.match(r('index.html'),/name="yandex-verification" content="57833afd1e8f909f"/);
const notFound=r('404.html');
assert.match(notFound,/content="noindex,follow"/);
assert.doesNotMatch(notFound,/rel="canonical"|ld\+json/);
assert.match(r('index.html'),/data-start-params="legacy"/);
assert.doesNotMatch(r('index.html'),/mailto:/);
build({SITE_START_PARAMS:'v1',SITE_CONTACT_EMAIL:'owner@example.com'});
assert.match(r('index.html'),/data-start-params="v1"/);
assert.match(r('index.html'),/mailto:owner@example\.com/);
assert.throws(()=>build({SITE_START_PARAMS:'wrong'}));
assert.throws(()=>build({SITE_CONTACT_EMAIL:'a"><script>@x.com'}));
console.log('PASS — SEO integrity for '+locs.length+' pages, links, 404, feature flags');
// Оставляем dist с настройками хостинга: prebuild всё равно пересоберёт сайт.
if(hostStartParams!==undefined)process.env.SITE_START_PARAMS=hostStartParams;
if(hostEmail!==undefined)process.env.SITE_CONTACT_EMAIL=hostEmail;
