import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CONTENT_DATE, PRIVACY_DATE, titles, platformNotes, extraFaq, extraPages, demos, pageDemos, related, linkNames } from './content.mjs';
import { nav as renderNav, footer as renderFooter, renderHome, favicon } from './ui.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
const configPath=path.join(root,'landing/site-url.txt');
const raw=(process.env.SITE_URL|| (fs.existsSync(configPath)?fs.readFileSync(configPath,'utf8'):'')).trim().replace(/\/+$/,'');
if(raw && !/^https:\/\/[a-z\d.-]+(?::\d+)?$/i.test(raw))throw Error('SITE_URL must be an HTTPS origin, without path');
const SITE_URL=raw;
// This is the analytics-only Railway collector; it must NEVER poll Telegram.
// Explicitly setting SITE_ANALYTICS_ENDPOINT='' disables the optional counter.
const DEFAULT_ANALYTICS_ENDPOINT=SITE_URL==='https://pavelbots.tuqo.app'
  ? 'https://pavel-chatbots-orders-production.up.railway.app/event' : '';
const ANALYTICS_ENDPOINT=(process.env.SITE_ANALYTICS_ENDPOINT ?? DEFAULT_ANALYTICS_ENDPOINT).trim();
if(ANALYTICS_ENDPOINT) {
  const parsed=new URL(ANALYTICS_ENDPOINT);
  if(parsed.protocol!=='https:' || parsed.username || parsed.password || parsed.search || parsed.hash || !parsed.pathname.endsWith('/event')) {
    throw new Error('SITE_ANALYTICS_ENDPOINT must be a public HTTPS /event endpoint without credentials');
  }
}
const bot=ANALYTICS_ENDPOINT?'https://t.me/pavel_chatbots_bot?start=site':'https://t.me/pavel_chatbots_bot';
// 'legacy' (по умолчанию) сохраняет прежний ?start=site, который уже понимает бот.
// 'v1' добавляет источник и страницу. Включать ТОЛЬКО после поддержки формата в боте.
const START_PARAMS=(process.env.SITE_START_PARAMS ?? 'legacy').trim();
if(!['legacy','v1'].includes(START_PARAMS))throw Error('SITE_START_PARAMS must be legacy or v1');
// Запасной канал связи. Пусто = выключен. Включать после решения владельца и правки политики.
const CONTACT_EMAIL=(process.env.SITE_CONTACT_EMAIL ?? '').trim();
if(CONTACT_EMAIL && !/^[^\s@<>"'?&]+@[^\s@<>"'?&]+\.[a-z]{2,}$/i.test(CONTACT_EMAIL))throw Error('Invalid SITE_CONTACT_EMAIL');
const emailFallback=CONTACT_EMAIL?`<p class="notice">Не открывается Telegram? Напишите на <a href="mailto:${CONTACT_EMAIL}?subject=%D0%97%D0%B0%D1%8F%D0%B2%D0%BA%D0%B0%20%D0%BD%D0%B0%20%D1%87%D0%B0%D1%82-%D0%B1%D0%BE%D1%82%D0%B0">${CONTACT_EMAIL}</a> — можно вставить туда скопированное ТЗ.</p>`:'';
const write=(relative,text)=>{const p=path.join(dist,relative);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text,'utf8');};
const esc=(s)=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const abs=(url)=>SITE_URL+url;
const services=[
{slug:'telegram',name:'Telegram',title:'Разработка Telegram-ботов для бизнеса на заказ',description:'Telegram-боты для заявок, записи, консультаций, анкет и автоматизации работы с клиентами. Разрабатываем под вашу задачу, удалённо по России.',use:['Сбор заявок через кнопки и пошаговые опросы','Онлайн-запись, напоминания и ответы на частые вопросы','Интеграция с таблицами, CRM и внутренними процессами — по ТЗ'],how:'Клиент открывает бота по ссылке, выбирает услугу, отвечает на вопросы. Владелец получает структурированное обращение и может продолжить диалог.',fit:'сфере услуг, мастерам, студиям, образовательным проектам и небольшим компаниям',faq:[['Можно ли подключить оплату?','Возможность оплаты и способ подключения обсудим после выбора сценария и проверки требований платёжного сервиса.'],['Нужен ли мне собственный сервер?','Не обязательно. Подберём размещение под требования и бюджет проекта.']]},
{slug:'max',name:'MAX',title:'Разработка чат-ботов для MAX под задачи бизнеса',description:'Чат-боты для мессенджера MAX: приём обращений, ответы на вопросы, запись и оформление заявок с учётом доступных возможностей платформы.',use:['Меню услуг и первичный опрос клиента','Ответы на типовые вопросы и передача обращений человеку','Сбор технического задания на разработку или оказание услуги'],how:'Проектируем диалог и нужные кнопки, проверяем актуальные условия доступа к API MAX, затем реализуем и тестируем сценарии.',fit:'организациям и специалистам, которые работают с аудиторией MAX',faq:[['Можно ли сделать такого же бота, как в Telegram?','Не все возможности платформ совпадают. Проверим доступные функции MAX и предложим подходящий сценарий.'],['Нужен ли доступ к API MAX?','Для разработки реального бота обычно требуется доступ к инструментам платформы. Подскажем действия после оценки задачи.']]},
{slug:'vk',name:'ВКонтакте',title:'Создание чат-ботов ВКонтакте для сообщений сообщества',description:'Боты ВКонтакте для сообществ: приветствие, меню, ответы, заявки и автоматизация диалогов с клиентами.',use:['Ответы на вопросы в сообщениях сообщества','Навигация по услугам и запись на консультацию','Опросы, подбор предложения и передача заявки менеджеру'],how:'Настраиваем путь клиента внутри сообщений сообщества с учётом прав доступа, правил VK и выбранных интеграций.',fit:'магазинам, сообществам, локальным сервисам, студиям и экспертам',faq:[['Нужно ли сообщество ВКонтакте?','Для сценариев через сообщения сообщества требуется подходящее сообщество и права на его настройку.'],['Можно ли получать заявки владельцу?','Да, предусмотрим передачу обращений выбранным способом, если нужная интеграция доступна.']]},
{slug:'whatsapp',name:'WhatsApp',title:'WhatsApp-боты и автоматизация диалогов с клиентами',description:'Помощь в проектировании WhatsApp-ботов: ответы клиентам, маршрутизация сообщений и оформление заявок через официальные возможности платформы.',use:['Автоматические ответы на типовые обращения','Сбор параметров заказа и передача оператору','Уведомления и интеграции в пределах правил платформы'],how:'Сначала проверяем доступность официального WhatsApp Business Platform API и условия поставщика. Затем оцениваем интеграцию, стоимость сообщений и запускаем согласованный сценарий.',fit:'бизнесу с регулярными обращениями в WhatsApp',faq:[['Можно ли подключить обычный личный WhatsApp?','Для надёжной коммерческой автоматизации рекомендуем использовать официальные решения WhatsApp Business Platform.'],['Есть ли дополнительные расходы?','У WhatsApp Business Platform и провайдера могут быть отдельные платежи за сообщения и сервис. Они не входят автоматически в стоимость разработки.']]},
{slug:'ai-bots',name:'ИИ-боты',title:'ИИ-чат-боты для консультаций и поддержки клиентов',description:'Разработка ИИ-ботов для FAQ, первичной консультации и помощи с выбором услуг. Сценарии с передачей сложных вопросов человеку.',use:['Ответы на вопросы из подготовленной базы знаний','Помощь с выбором услуги и сбор первичных требований','Передача нестандартных вопросов владельцу или оператору'],how:'Определяем, на какие темы бот может отвечать, готовим источники знаний, настраиваем проверки и переход к человеку. Модель и стоимость API обсуждаем заранее.',fit:'сервисным компаниям, онлайн-проектам, консультантам и командам поддержки',faq:[['Может ли ИИ-бот отвечать без ошибок?','Нет, генеративный ИИ иногда ошибается. Поэтому нужны ограничения, база знаний и возможность обратиться к человеку.'],['ИИ-модель будет бесплатной?','Для части задач доступны бесплатные лимиты и локальные варианты, но стоимость и ограничения зависят от поставщика и нагрузки.']]}
];
const taskPages=[
  {
    "slug": "bot-dlya-zapisi",
    "title": "Чат-бот для записи клиентов — Telegram, MAX и ВКонтакте",
    "description": "Разработка чат-бота для записи клиентов: выбор услуги, удобного времени, подтверждение и уведомления. Индивидуальные сценарии для студий, мастеров и сервисов.",
    "lead": "Когда клиент хочет записаться, ему важно быстро понять, какие услуги доступны, и оставить заявку без ожидания ответа администратора. Бот может провести посетителя по понятным шагам, а владелец — получить готовые сведения о записи.",
    "examples": [
      "Студия красоты: клиент выбирает услугу, специалиста и оставляет удобное время; администратор подтверждает запись.",
      "Репетитор или консультант: бот уточняет формат занятия, цель обращения и желаемые дни.",
      "Сервисная компания: клиент выбирает вид услуги, адрес района и предпочтительное время визита."
    ],
    "steps": [
      "Согласуем перечень услуг, длительность, расписание и правила отмены.",
      "Выбираем сценарий: заявка на запись с подтверждением администратором или автоматическое бронирование свободных слотов.",
      "Определяем источник расписания — календарь, CRM, таблица или другая система; проверяем доступность её API.",
      "Настраиваем уведомления, тестируем конфликтующие слоты, отмены и передачу обращения сотруднику."
    ],
    "limits": "Важно: бот не должен обещать свободное время, если не подключён к актуальному расписанию. Автоматическая запись, напоминания и синхронизация с CRM доступны только после проверки интеграций и правил платформы.",
    "faq": [
      [
        "Может ли бот сам выбирать свободное время?",
        "Да, если есть актуальный источник расписания и доступная интеграция. Иначе бот соберёт пожелания, а администратор подтвердит запись."
      ],
      [
        "Можно ли перенести или отменить запись?",
        "Это можно предусмотреть в сценарии, если понятны правила изменения и способ хранения записей."
      ],
      [
        "Подойдёт ли решение для одного мастера?",
        "Да. Простой сценарий для индивидуального специалиста может ограничиваться выбором услуги, временем и отправкой заявки."
      ]
    ]
  },
  {
    "slug": "bot-dlya-zayavok",
    "title": "Чат-бот для приёма заявок по шагам",
    "description": "Чат-бот для сбора и обработки заявок в Telegram, MAX и ВКонтакте. Пошаговый опрос, передача менеджеру, уведомления и интеграции по ТЗ.",
    "lead": "Когда обращения приходят в разное время, однотипные вопросы отнимают время, а важные детали теряются в длинной переписке. Бот может собрать нужные сведения в одном диалоге и передать менеджеру структурированную заявку.",
    "examples": [
      "Ремонт и услуги: клиент выбирает тип работы, указывает примерный объём и загружает фото, если платформа поддерживает вложения.",
      "Обучение: бот выясняет предмет, уровень подготовки, формат занятий и контактный способ связи.",
      "Интернет-магазин: клиент выбирает категорию товара, уточняет наличие и оставляет запрос на консультацию."
    ],
    "steps": [
      "Выписываем вопросы, которые менеджер обычно задаёт каждому клиенту.",
      "Разрабатываем короткий сценарий без лишних шагов; определяем обязательные и необязательные поля.",
      "Настраиваем получение заявок владельцем и, при необходимости, их передачу в таблицу или CRM.",
      "Проверяем неполные заявки, ошибочные ответы, повторные обращения и способ связи с живым человеком."
    ],
    "limits": "Важно: сбор заявки не равен готовой продаже. Чтобы не собирать лишние персональные данные, заранее решаем, какая информация действительно необходима и кто получает доступ к обращениям.",
    "faq": [
      [
        "Могу ли я получать уведомления о новых заявках?",
        "Да, можно предусмотреть уведомления ответственному человеку в доступном канале. Формат и скорость доставки проверяются при тестировании."
      ],
      [
        "Можно ли отправлять заявки в CRM?",
        "Если у выбранной CRM есть подходящий API или другой поддерживаемый способ интеграции, рассмотрим автоматическую передачу."
      ],
      [
        "Обязательно ли просить номер телефона?",
        "Нет. Поля выбираем по задаче и принципу минимального сбора данных. Клиент может оставить другой удобный способ связи."
      ]
    ]
  }
];
const homeFaq=[
['Сколько стоит разработка чат-бота?','Стоимость зависит от платформы, логики диалога, количества экранов, интеграций и использования ИИ. После короткого описания задачи предложим объём работ и оценку.'],
['Чем бот для записи отличается от бота для приёма заявок?','Бот для записи помогает выбрать услугу и время; при подключении к расписанию он может учитывать свободные слоты. Бот для заявок собирает вопросы и требования клиента и передаёт обращение ответственному человеку. Оба сценария можно совместить.'],
['Для каких мессенджеров вы создаёте ботов?','Рассматриваю задачи для Telegram, MAX, ВКонтакте и WhatsApp. Возможности и условия доступа к API отличаются; их проверяем до старта.'],
['Какую платформу выбрать для клиентов в России?','Ориентируйтесь на то, где ваши клиенты реально могут написать. На ноябрь 2026 года работа Telegram в России ограничивается, а доступ к WhatsApp ограничен, поэтому для российской аудитории стоит рассмотреть MAX и ВКонтакте. Ботов в MAX по справке платформы создают самозанятые, юрлица и ИП — резиденты РФ.'],
['Можно ли заказать ИИ-бота для ответов клиентам?','Да. Можно обсудить бота с базой знаний, типовыми ответами и передачей нестандартных обращений человеку.'],
['Что нужно, чтобы оценить бота?','Достаточно описать, чем вы занимаетесь, какие вопросы сейчас задаёте клиентам, куда должны приходить заявки и с какими сервисами нужна связь. Техническое задание заранее не требуется.'],
['С чего начать, если бюджет и объём пока непонятны?','Начните с одной самой частой задачи, например приёма заявок. Её проще описать и проверить, а остальные сценарии можно обсудить отдельно.'],
['Работаете ли вы с заказчиками из других городов?','Да. Обсуждение, постановка задачи, разработка и проверка могут проходить дистанционно по России.'],
['Как отправить заявку на разработку?','Откройте Telegram-бота @pavel_chatbots_bot. В нём можно описать задачу и передать исходные требования.'],
['А если клиент не захочет общаться с ботом?','Бот не должен запирать клиента в меню. В сценарии заранее предусматриваем, когда и как диалог переходит к человеку.'],
['Заменит ли бот администратора?','Нет. Бот берёт на себя повторяющиеся вопросы и сбор сведений. Подтверждения, нестандартные случаи и решения остаются за человеком.'],
['Сколько времени займёт разработка?','Срок зависит от числа сценариев, интеграций и того, как быстро согласуются тексты и доступы. Называем его после уточнения задачи, до начала работ.'],
['Нужна ли мне подписка или отдельный хостинг?','Зависит от решения. Для размещения и внешних API могут понадобиться отдельные услуги. Возможные регулярные расходы согласуем заранее.']
];
const demoCard=(key)=>{const d=demos[key];return `<figure class="demo"><figcaption><span class="demo-badge">Демонстрация, не кейс клиента</span><h3>${esc(d.title)}</h3></figcaption><ol class="demo-chat">${d.chat.map(([who,text])=>`<li class="msg ${who==='b'?'from-bot':'from-client'}"><span class="who">${who==='b'?'Бот':'Клиент'}: </span>${esc(text)}</li>`).join('')}</ol><div class="demo-result"><b>${esc(d.resultTitle)}</b><dl>${d.result.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div></figure>`;};
const demoDisclaimer='Диалоги, услуги и ответы придуманы для иллюстрации. Это не снимки действующего бота и не результаты работы для клиентов. Состав вашего бота зависит от платформы и доступных интеграций.';
const demoBlock=(slug)=>pageDemos[slug]?`<h2>Как может выглядеть диалог</h2>${demoCard(pageDemos[slug])}<p class="tiny">${demoDisclaimer}</p>`:'';
const relatedBlock=(slug)=>related[slug]?`<h2>Смотрите также</h2><ul>${related[slug].map(s=>`<li><a href="/${s}/">${esc(linkNames[s])}</a></li>`).join('')}</ul>`:'';
const withBrand=(t)=>(t+' | Pavel Bot Studio').length<=70?t+' | Pavel Bot Studio':t;
const options=(list,selected)=>list.map(x=>`<option${x===selected?' selected':''}>${x}</option>`).join('');
const chips=(name,legend,num,list,selected)=>`<fieldset class="chips"><legend><b aria-hidden="true">${num}</b>${legend}</legend><div>${list.map(x=>`<label><input type="radio" name="${name}" value="${x}"${x===selected?' checked':''}><span>${x}</span></label>`).join('')}</div></fieldset>`;
function briefForm(platform='Пока не определился',goal='Приём заявок'){return `<div class="form-card"><form data-brief>${chips('platform','Где нужен бот?',1,['Telegram','MAX','ВКонтакте','WhatsApp','Пока не определился'],platform)}${chips('goal','Какая задача?',2,['Приём заявок','Запись клиентов','Ответы на вопросы','ИИ-помощник','Автоматизация бизнес-процессов','Другая задача'],goal)}<label class="field"><span><b aria-hidden="true">3</b>Расскажите о бизнесе и идее (по желанию)</span><textarea name="task" maxlength="900" rows="4" placeholder="Например: у меня студия, хочу, чтобы бот отвечал на вопросы и записывал клиентов"></textarea></label><p class="preview-label">Ваше ТЗ — так оно скопируется</p><div class="output" data-output></div><div class="form-actions"><a class="btn" data-bot-open href="${bot}" target="_blank" rel="noopener noreferrer">Скопировать и открыть Telegram</a><button type="button" class="btn secondary" data-copy>Скопировать ТЗ</button></div><p class="form-status" data-form-status role="status"></p><p class="tiny">Форма ничего не отправляет автоматически: вставьте скопированный текст в диалог с ботом. Не указывайте здесь персональные данные ваших клиентов.</p>${emailFallback}</form></div>`;}
const briefSection=(platform,goal)=>`<section class="section tint" id="brief"><div class="container form-layout"><div class="brief-copy"><p class="kicker">Без технического языка</p><h2>Подготовьте заявку за минуту</h2><p>Выберите платформу и задачу, опишите идею своими словами. Текст останется в браузере, пока вы сами его не отправите.</p><h3>Что поможет оценить работу</h3><ul class="plain"><li>чем занимается ваш бизнес;</li><li>что должен делать бот;</li><li>куда должны приходить заявки;</li><li>с какими сервисами нужна связь.</li></ul></div>${briefForm(platform,goal)}</div></section>`;
const note=(slug)=>platformNotes[slug]?`<p class="notice">${platformNotes[slug]}</p>`:'';
const serviceNav=services.map(s=>`<a href="/${s.slug}/">${esc(s.name)}</a>`).join('');
const nav=renderNav(bot);
const solutionLinks=[['/bot-dlya-zapisi/','Бот для записи'],['/bot-dlya-zayavok/','Бот для заявок'],...extraPages.map(p=>[`/${p.slug}/`,esc(p.card)])];
const footerFor=(briefHref)=>renderFooter({bot,services,solutionLinks,briefHref});
function faqMarkup(faq){return `<div class="faq">${faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a).replace('@pavel_chatbots_bot',`<a href="${bot}" target="_blank" rel="noopener noreferrer">@pavel_chatbots_bot</a>`)}</p></details>`).join('')}</div>`;}
const schemaFaq=(items)=>({ '@type':'FAQPage',mainEntity:items.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});
function structured({faq=[],slug='',title,description,crumb='',service=false}) {
  const url=SITE_URL?abs('/'+(slug?slug+'/':'')):'#'+(slug||'home');
  const id=(h)=>SITE_URL?abs('/#'+h):'#'+h;
  const graph=[
    {'@type':'Person','@id':id('person'),name:'Павел',description:'Частный разработчик чат-ботов для бизнеса',url:SITE_URL?abs('/'):undefined},
    {'@type':'WebSite','@id':id('website'),url:SITE_URL?abs('/'):undefined,name:'Pavel Bot Studio',inLanguage:'ru-RU',publisher:{'@id':id('person')}},
    {'@type':'WebPage','@id':url+'#webpage',url:SITE_URL?url:undefined,name:title,description,inLanguage:'ru-RU',isPartOf:{'@id':id('website')}}
  ];
  if(service)graph.push({'@type':'Service','@id':url+'#service',name:title,description,serviceType:'Разработка чат-ботов для бизнеса',areaServed:[{'@type':'Country',name:'Россия'},{'@type':'City',name:'Краснодар'}],provider:{'@id':id('person')},availableChannel:{'@type':'ServiceChannel',serviceUrl:bot}});
  if(slug&&SITE_URL)graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Главная',item:abs('/')},{'@type':'ListItem',position:2,name:crumb||title,item:url}]});
  if(faq.length)graph.push(schemaFaq(faq));
  return `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`;
}
// Версия в адресе: после обновления вернувшийся посетитель не получит новую разметку со старыми стилями из кэша.
const asset=(file)=>`/${file}?v=${crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'landing',file))).digest('hex').slice(0,10)}`;
function shell({title,description,body,slug='',faq=[],crumb='',service=true,notFound=false}) {
  const footer=footerFor(body.includes('id="brief"')?'#brief':'/#brief');
  const demoScript=body.includes('data-sim')?`<script defer src="${asset('demo.js')}"></script>`:'';
  const url=abs('/'+(slug?slug+'/':''));
  const canonical=SITE_URL&&!notFound?`<link rel="canonical" href="${esc(url)}"><meta property="og:url" content="${esc(url)}">`:'';
  const social=SITE_URL?`<meta property="og:image" content="${abs('/og.png')}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Pavel Bot Studio — разработка чат-ботов для бизнеса"><meta name="twitter:card" content="summary_large_image">`:'';
  const analytics=ANALYTICS_ENDPOINT?`<script>window.PAVEL_ANALYTICS_ENDPOINT=${JSON.stringify(ANALYTICS_ENDPOINT).replace(/</g,"\\u003c")}</script><script defer src="/analytics.js"></script>`:'';
  const head=`<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="yandex-verification" content="57833afd1e8f909f"><meta name="google-site-verification" content="mSBEJydp2Je3q9DBACxDokrL8gQo7iM_daa-HLTNPdI"><meta name="robots" content="${notFound?'noindex,follow':'index,follow,max-image-preview:large'}"><meta name="theme-color" content="#f6f3ec"><meta property="og:type" content="website"><meta property="og:locale" content="ru_RU"><meta property="og:site_name" content="Pavel Bot Studio"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">${canonical}${social}<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/fonts/pbs-display-700.woff" as="font" type="font/woff" crossorigin><link rel="stylesheet" href="${asset('styles.css')}">${notFound?'':structured({faq,slug,title,description,crumb,service})}`;
  // script.js идёт первым: он определяет источник перехода, который использует analytics.js.
  return `<!doctype html><html lang="ru"><head>${head}</head><body data-start-params="${START_PARAMS}"${ANALYTICS_ENDPOINT?' data-analytics="on"':''}><a class="skip" href="#main">Перейти к содержимому</a>${nav}<main id="main">${body}</main>${footer}<script defer src="${asset('script.js')}"></script>${demoScript}${analytics}</body></html>`;
}
const home=renderHome({bot,services,demoCard,demoDisclaimer,faqMarkup,homeFaq,briefForm,esc});
write('index.html',shell({title:titles[''],description:'Создание чат-ботов для бизнеса: Telegram, MAX, ВКонтакте, WhatsApp и ИИ-помощники. Заявки, запись клиентов, FAQ, автоматизация. Краснодар и вся Россия. Обсудите задачу онлайн.',body:home,faq:homeFaq}));
const platformOf={telegram:'Telegram',max:'MAX',vk:'ВКонтакте',whatsapp:'WhatsApp'};
for(const s of services){const pageFaq=[[s.slug==='ai-bots'?'Как заказать ИИ-бота?':'Как заказать бота для '+s.name+'?','Откройте Telegram-бота для заявок, выберите нужную платформу и опишите задачу. После уточнений обсудим сценарий и стоимость.'],...s.faq,...(extraFaq[s.slug]||[])];const body=`<section class="article-header"><div class="container"><div class="breadcrumbs"><a href="/">Главная</a> / ${esc(s.name)}</div><span class="kicker">Чат-боты для бизнеса</span><h1>${esc(s.title)}</h1><p class="lede">${esc(s.description)}</p><div class="actions"><a href="${bot}" target="_blank" rel="noopener noreferrer" class="btn">Обсудить разработку ↗</a><a href="#brief" class="btn secondary">Подготовить ТЗ ↓</a></div>${note(s.slug)}</div></section><div class="container article-wrap"><article class="prose"><h2>${s.slug==='ai-bots'?'Какие задачи решает ИИ-бот':'Какие задачи решает бот в '+esc(s.name)}</h2><p>Бот полезен, когда обращения клиентов повторяются, заявки теряются в переписке или сотрудникам приходится задавать одни и те же вопросы. Сценарий строим исходя из реального процесса, а не набора модных функций.</p><ul>${s.use.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h2>Как это будет работать</h2><p>${esc(s.how)}</p><h2>Кому подходит решение</h2><p>В первую очередь — ${esc(s.fit)}. Объём автоматизации зависит от количества сценариев, доступного API и необходимых интеграций.</p><h2>Что нужно для старта</h2><p>Опишите, что должен делать бот, какие вопросы задавать, кому отправлять заявки и нужна ли связь с другими сервисами. Стоимость и сроки определим после уточнения задачи; расходы на внешние сервисы согласуем отдельно.</p><h2>Что влияет на стоимость</h2><ul><li>количество сценариев и экранов диалога;</li><li>интеграции с таблицами, CRM, оплатой и другими сервисами;</li><li>использование ИИ и подготовка базы знаний;</li><li>размещение, поддержка и платные внешние API — обсуждаются отдельно.</li></ul>${demoBlock(s.slug)}<h2>Частые вопросы</h2>${faqMarkup(pageFaq)}${relatedBlock(s.slug)}<p style="margin-top:34px"><a href="${bot}" class="btn" target="_blank" rel="noopener noreferrer">${s.slug==='ai-bots'?'Заказать ИИ-бота':'Заказать бота в '+esc(s.name)} ↗</a></p></article><aside class="sidecard"><span class="kicker">Начать просто</span><h3>Есть идея? Опишите её боту.</h3><p>Действующий Telegram-бот поможет оформить заявку на разработку. Необязательно знать API или писать техническое задание самостоятельно.</p><a class="btn" href="${bot}" target="_blank" rel="noopener noreferrer">Открыть бота ↗</a><p class="tiny" style="margin-top:14px">Работаем удалённо по России.</p></aside></div>${briefSection(platformOf[s.slug],s.slug==='ai-bots'?'ИИ-помощник':'Приём заявок')}`;write(`${s.slug}/index.html`,shell({title:withBrand(titles[s.slug]),description:s.description,body,faq:pageFaq,slug:s.slug,crumb:s.name}));}

for(const p of [...taskPages,...extraPages]){
  const crumb=p.crumb||(p.slug==="bot-dlya-zapisi"?"Запись клиентов":"Приём заявок");
  const content = '<section class="article-header"><div class="container"><div class="breadcrumbs"><a href="/">Главная</a> / '+esc(crumb)+'</div><span class="kicker">Автоматизация для бизнеса</span><h1>'+esc(p.title)+'</h1><p class="lede">'+esc(p.lead)+'</p><div class="actions"><a class="btn" href="'+bot+'" target="_blank" rel="noopener noreferrer">Обсудить бота ↗</a><a class="btn secondary" href="#brief">Подготовить ТЗ ↓</a></div></div></section>'
  +'<div class="container article-wrap"><article class="prose">'
  +'<h2>'+esc(p.h2examples||'Где пригодится такой бот')+'</h2><ul>'+p.examples.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>'
  +demoBlock(p.slug)
  +'<h2>Как создаём сценарий</h2><ol>'+p.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>'
  +'<h2>Что важно учесть перед разработкой</h2><p>'+esc(p.limits)+'</p>'
  +'<h2>Какую платформу выбрать</h2><p>Выбор зависит от того, где ваши клиенты реально могут написать. Для аудитории в России сначала сравните <a href="/max/">MAX</a> и <a href="/vk/">ВКонтакте</a>. Работа <a href="/telegram/">Telegram</a> в России ограничивается, поэтому его стоит выбирать, только проверив, доступен ли он вашим клиентам.</p>'
  +'<h2>Частые вопросы</h2>'+faqMarkup(p.faq)+relatedBlock(p.slug)
  +'<p style="margin-top:34px"><a class="btn" href="'+bot+'" target="_blank" rel="noopener noreferrer">Обсудить задачу в Telegram ↗</a></p></article>'
  +'<aside class="sidecard"><span class="kicker">Без сложного ТЗ</span><h3>Начнём с вашей задачи</h3><p>Напишите, как вы сейчас принимаете обращения или записи. Поможем выбрать сценарий и оценим объём работ после уточнений.</p><a class="btn" href="#brief">Подготовить описание ↓</a><p class="tiny" style="margin-top:14px">Стоимость, API и регулярные расходы обсуждаем заранее.</p></aside></div>'
  +briefSection(p.platform||'Пока не определился',p.goal||(p.slug==='bot-dlya-zapisi'?'Запись клиентов':'Приём заявок'));
  write(p.slug+'/index.html',shell({title:withBrand(titles[p.slug]||p.title),description:p.description,body:content,slug:p.slug,faq:p.faq,crumb}));
}

const privacy=fs.readFileSync(path.join(root,'landing/privacy.html'),'utf8');
write('privacy/index.html',shell({title:'Политика обработки персональных данных | Pavel Bot Studio',description:'Политика обработки персональных данных посетителей сайта и Telegram-бота Pavel Bot Studio.',body:privacy,slug:'privacy',crumb:'Конфиденциальность',service:false}));
fs.copyFileSync(path.join(root,'landing/styles.css'),path.join(dist,'styles.css'));
fs.copyFileSync(path.join(root,'landing/script.js'),path.join(dist,'script.js'));
if(ANALYTICS_ENDPOINT)fs.copyFileSync(path.join(root,'landing/analytics.js'),path.join(dist,'analytics.js'));
write('favicon.svg',favicon);
fs.copyFileSync(path.join(root,'landing/demo.js'),path.join(dist,'demo.js'));
fs.mkdirSync(path.join(dist,'fonts'),{recursive:true});
for(const f of ['pbs-display-700.woff','LICENSE-Inter.txt'])fs.copyFileSync(path.join(root,'landing/fonts',f),path.join(dist,'fonts',f));
const paths=['/',...services.map(s=>`/${s.slug}/`),...[...taskPages,...extraPages].map(p=>`/${p.slug}/`),'/privacy/'];
fs.copyFileSync(path.join(root,'landing/og.png'),path.join(dist,'og.png'));
write('robots.txt',`User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Yandex\nAllow: /\nClean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&yclid&gclid /\n\nUser-agent: bingbot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n${SITE_URL?'\nSitemap: '+abs('/sitemap.xml')+'\n':''}`);
if(SITE_URL)write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${esc(abs(p))}</loc><lastmod>${p==='/privacy/'?PRIVACY_DATE:CONTENT_DATE}</lastmod></url>`).join('')}</urlset>`);
if(SITE_URL){const indexNowKey=crypto.createHash('sha256').update('pavel-bot-studio|'+SITE_URL).digest('hex').slice(0,32);write(indexNowKey+'.txt',indexNowKey);write('indexnow-info.txt',`IndexNow key: ${indexNowKey}\nKey URL: ${SITE_URL}/${indexNowKey}.txt\nURL list: ${paths.map(p=>abs(p)).join(' ')}\n`);}
write('llms.txt',`# Pavel Bot Studio\n\n> Разработка чат-ботов для малого бизнеса и специалистов в России.\n\n## Услуги\n- Telegram-боты: заявки, запись клиентов, поддержка. ${SITE_URL?abs('/telegram/'):''}\n- MAX-боты: сценарии для клиентов, консультации, первичный опрос. ${SITE_URL?abs('/max/'):''}\n- VK-боты: сообщения сообщества, заявки, FAQ. ${SITE_URL?abs('/vk/'):''}\n- WhatsApp-боты: автоматизация на официальных API с учётом условий платформы. ${SITE_URL?abs('/whatsapp/'):''}\n- ИИ-боты: база знаний, поддержка, передача сложных вопросов человеку. ${SITE_URL?abs('/ai-bots/'):''}\n\n## Решения по задачам\n- Бот для записи клиентов: ${SITE_URL?abs('/bot-dlya-zapisi/'):''}\n- Бот для приёма заявок: ${SITE_URL?abs('/bot-dlya-zayavok/'):''}\n${extraPages.map(p=>`- ${p.card}: ${SITE_URL?abs('/'+p.slug+'/'):''}`).join('\n')}\n\n## Доступность платформ (на ${CONTENT_DATE})\n- Работа Telegram в России ограничивается; доступность у клиентов может отличаться.\n- Доступ к WhatsApp в России ограничен.\n- Ботов в MAX по справке платформы создают самозанятые, юрлица и ИП — резиденты РФ.\n\n## Факты\n- География: Краснодар, дистанционно по России.\n- Цена: индивидуально после уточнения задачи; фиксированного опубликованного прайса нет.\n- Реальная демонстрация и подача заявки: ${bot}\n- Примеры диалогов на сайте являются демонстрациями, а не клиентскими кейсами: ${SITE_URL?abs('/#examples'):''}\n- Не заявляются гарантированные продажи, индексация или наличие любых интеграций без проверки API.\n${SITE_URL?'\n## Сайт\n'+SITE_URL+'\n':''}`);
write('404.html',shell({title:'Страница не найдена | Pavel Bot Studio',description:'Страница не найдена. Вернитесь к услугам по разработке чат-ботов.',notFound:true,body:`<section class="section" style="min-height:55vh"><div class="container"><span class="kicker">404</span><h1>Такой страницы нет</h1><p>Возможно, адрес изменился. Вернитесь к услугам или напишите боту.</p><a href="/" class="btn">На главную ↗</a></div></section>`}));
const revisionFiles=['landing/privacy.html','landing/build.mjs','landing/styles.css','landing/script.js','landing/analytics.js','landing/site-url.txt','landing/content.mjs','landing/og.png','package.json','landing/ui.mjs','landing/demo.js','landing/fonts/pbs-display-700.woff'];
const revision=crypto.createHash('sha256');
for(const file of revisionFiles){revision.update(file+'\0');revision.update(fs.readFileSync(path.join(root,file)));revision.update('\0');}
write('deploy-revision.txt',revision.digest('hex')+'\n');
console.log(`Built ${fs.readdirSync(dist).length} root artifacts for ${SITE_URL||'domain pending'}`);
