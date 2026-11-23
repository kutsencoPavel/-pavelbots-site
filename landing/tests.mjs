import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve('.');
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
assert(!r('sitemap.xml').includes('privacy'));
console.log('PASS — '+(pages.length+6)+' checks: pages, copy, robots, AI, sitemap, canonical, privacy');

// Optional analytics: no tracker in default build; generated only with explicit HTTPS endpoint.
execFileSync(process.execPath,['landing/build.mjs'],{cwd:root,stdio:'inherit',env:{...process.env,SITE_URL:'https://example.tuqo.app',SITE_ANALYTICS_ENDPOINT:'https://stats.example.test/event'}});
assert.match(r('index.html'),/PAVEL_ANALYTICS_ENDPOINT/);
assert.match(r('index.html'),/start=site/);
assert.match(r('privacy/index.html'),/агрегированной статистики/);
assert.match(r('analytics.js'),/telegram_click/);
assert.match(r('analytics.js'),/page_view/);

// Production URL activates the preconfigured collector without Tuqo environment edits.
execFileSync(process.execPath,['landing/build.mjs'],{cwd:root,stdio:'inherit',env:{...process.env,SITE_URL:'https://pavelbots.tuqo.app',SITE_ANALYTICS_ENDPOINT:''}});
assert.match(r('index.html'),/PAVEL_ANALYTICS_ENDPOINT/);
assert.match(r('index.html'),/pavel-chatbots-orders-production\.up\.railway\.app\/event/);
assert.match(r('index.html'),/start=site/);
console.log('PASS — production collector and site attribution enabled');
