// Визуальные элементы сайта: знак, иконки, шапка, подвал и главная страница.
// Все диалоги на странице вымышлены и помечены как демонстрации.

export const logoMark = '<svg class="logo" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="11" fill="#2f46e0"/><path d="M9 13a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9l-7 6v-6.3A4 4 0 0 1 9 22z" fill="#fff"/><path d="m14.5 17.5 3.8 3.8 7.2-7.2" fill="none" stroke="#121a2b" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="8" r="4.5" fill="#d6f36a"/></svg>';

export const favicon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#2f46e0"/><path d="M9 13a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9l-7 6v-6.3A4 4 0 0 1 9 22z" fill="#fff"/><path d="m14.5 17.5 3.8 3.8 7.2-7.2" fill="none" stroke="#121a2b" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="8" r="4.5" fill="#d6f36a"/></svg>';

const paths = {
  scissors: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.2 7.4 20 18M8.2 16.6 20 6"/>',
  car: '<path d="M4 16v-4l2-5h12l2 5v4"/><path d="M3 16h18M6 16v3M18 16v3M7.5 13h.01M16.5 13h.01"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17m-12 5 2 2 4-4"/>',
  inbox: '<path d="M4 13 6.5 5h11L20 13v6H4z"/><path d="M4 13h5a3 3 0 0 0 6 0h5"/>',
  move: '<path d="M4 8h13m-4-4 4 4-4 4M20 16H7m4 4-4-4 4-4"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20c1.5-4 4-5.5 7.5-5.5s6 1.5 7.5 5.5"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  shield: '<path d="M12 3 19.5 6v5.500c0 4.600-3 7.800-7.500 9.500-4.500-1.700-7.500-4.900-7.500-9.500V6z"/><path d="m8.5 12 2.500 2.500 4.500-4.500"/>',
  eye: '<path d="M2.5 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z"/><circle cx="12" cy="12" r="3"/>',
};
export const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;

export const nav = (bot) => `<header class="header" data-header><div class="container nav"><a class="brand" href="/" aria-label="Pavel Bot Studio, на главную">${logoMark}<span class="wordmark">Pavel Bot Studio</span></a><button type="button" class="mobile-menu" aria-label="Открыть меню" aria-expanded="false" aria-controls="mainmenu" data-menu><span class="burger" aria-hidden="true"></span>Меню</button><nav id="mainmenu" class="navlinks" aria-label="Основная навигация" data-nav><a href="/#solutions">Решения</a><a href="/#examples">Примеры</a><a href="/#platforms">Платформы</a><a href="/#workflow">Как работаем</a><a href="/#faq">Вопросы</a><a href="${bot}" class="btn small" target="_blank" rel="noopener noreferrer">Обсудить в Telegram</a></nav></div></header>`;

export function footer({ bot, services, solutionLinks, briefHref }) {
  const list = (items) => items.map(([href, text]) => `<li><a href="${href}">${text}</a></li>`).join('');
  return `<footer class="footer"><div class="container footgrid"><div class="footabout"><a class="brand" href="/">${logoMark}<span class="wordmark">Pavel Bot Studio</span></a><p>Разработка чат-ботов под задачи бизнеса. Краснодар и удалённо по России.</p><p>Объём, сроки и расходы обсуждаем до начала работ.</p></div><nav class="footcol" aria-label="Платформы"><h2>Платформы</h2><ul>${list(services.map((s) => [`/${s.slug}/`, s.name]))}</ul></nav><nav class="footcol" aria-label="Решения"><h2>Решения</h2><ul>${list(solutionLinks)}</ul></nav><nav class="footcol" aria-label="Связь и документы"><h2>Заказ</h2><ul><li><a href="${bot}" target="_blank" rel="noopener noreferrer">Telegram-бот для заявок</a></li>${list([['/#brief', 'Собрать ТЗ'], ['/#faq', 'Вопросы и ответы'], ['/privacy/', 'Конфиденциальность']])}</ul></nav></div></footer><div class="mobile-cta" data-mobile-cta><a class="btn secondary" href="${briefHref}">Собрать ТЗ</a><a class="btn" href="${bot}" target="_blank" rel="noopener noreferrer" aria-label="Заказать чат-бота в Telegram">В Telegram</a></div>`;
}

// Интерактивная демонстрация первого экрана. Работает целиком в браузере.
const simulator = () => `<div class="sim" data-sim>
<div class="sim-top"><span class="demo-badge">Демонстрация</span><span class="sim-hint">Нажимайте ответы за клиента</span></div>
<div class="sim-tabs" role="group" aria-label="Выберите пример"><button type="button" data-sim-tab="salon" aria-pressed="true">Салон</button><button type="button" data-sim-tab="auto" aria-pressed="false">Автосервис</button><button type="button" data-sim-tab="tutor" aria-pressed="false">Занятия</button></div>
<div class="sim-body">
<div class="sim-chat"><div class="sim-log" data-sim-log role="log" aria-live="polite" aria-label="Диалог с ботом"><p class="msg from-bot">Здравствуйте! На какую услугу хотите записаться?</p></div><div class="sim-replies" data-sim-replies><noscript><p class="tiny">Чтобы пройти диалог, включите JavaScript. Готовые <a href="#examples">примеры диалогов</a> видны и без него.</p></noscript></div></div>
<div class="ticket"><div class="ticket-head"><b data-sim-title>Заявка для администратора</b><span class="status" data-sim-status>заполняется</span></div><dl data-sim-ticket><div><dt>Услуга</dt><dd>—</dd></div><div><dt>Когда</dt><dd>—</dd></div><div><dt>Связь</dt><dd>—</dd></div></dl></div>
</div>
<p class="sim-note">Услуги и ответы придуманы. Ничего не отправляется и не сохраняется.</p>
</div>`;

export function renderHome({ bot, services, demoCard, demoDisclaimer, faqMarkup, homeFaq, briefForm, esc }) {
  const solution = (href, ic, title, text) => `<a class="solution" href="${href}">${icon(ic)}<h3>${title}</h3><p>${text}</p><span class="more">Разобрать сценарий <i aria-hidden="true">→</i></span></a>`;
  const platform = (s, when, note, flag) => `<a class="platform" href="/${s}/"><h3>${when[0]}</h3><p>${when[1]}</p><p class="platform-note${flag ? ' warn' : ''}">${note}</p><span class="more">${when[2]} <i aria-hidden="true">→</i></span></a>`;
  return `<section class="hero"><div class="container hero-grid"><div class="hero-copy"><p class="eyebrow">Pavel Bot Studio · Краснодар и вся Россия</p><h1>Разработка <span class="nowrap">чат-ботов:</span> <span class="mark">из переписки&nbsp;— в готовую заявку</span></h1><p class="lede">Для салонов, мастеров, автосервисов и небольших компаний. Бот задаёт клиенту нужные вопросы в MAX, ВКонтакте, Telegram или WhatsApp, а вы получаете обращение, по которому понятно, что делать дальше.</p><div class="actions"><a href="${bot}" target="_blank" rel="noopener noreferrer" class="btn">Обсудить задачу в Telegram</a><a href="#brief" class="btn secondary">Собрать ТЗ за минуту</a></div><ul class="trustline"><li>Объём и стоимость согласуем до начала работ</li><li>Об ограничениях платформ говорим заранее</li><li>Общение напрямую с разработчиком</li></ul></div>${simulator()}</div></section>

<section class="section" id="benefits"><div class="container"><div class="section-intro"><p class="kicker">Бизнес-задачи</p><h2>Где теряется время и что может взять на себя бот</h2><p>Мы начинаем не с кнопок, а с того, что мешает работать с обращениями сейчас.</p></div><div class="compare" role="list">
<div class="pain" role="listitem"><p class="was"><span>Сейчас</span>Клиент пишет вечером, а ответ появляется только утром.</p><p class="will"><span>С ботом</span>Бот отвечает на согласованные вопросы и принимает пожелания в любое время, пока он и платформа работают.</p></div>
<div class="pain" role="listitem"><p class="was"><span>Сейчас</span>Чтобы понять запрос, нужно десять уточняющих сообщений.</p><p class="will"><span>С ботом</span>Вопросы задаются по порядку, а ответственный получает ответы одной заявкой.</p></div>
<div class="pain" role="listitem"><p class="was"><span>Сейчас</span>Сотрудник много раз отвечает про адрес, график и услуги.</p><p class="will"><span>С ботом</span>Меню и ответы по вашим текстам; нестандартный вопрос уходит человеку.</p></div>
<div class="pain" role="listitem"><p class="was"><span>Сейчас</span>Заявки лежат в разных чатах и легко теряются.</p><p class="will"><span>С ботом</span>Уведомления ответственному, а при наличии доступного API — передача в таблицу или CRM.</p></div>
</div></div></section>

<section class="section tint" id="solutions"><div class="container"><div class="section-intro"><p class="kicker">Решения</p><h2>Выберите задачу, похожую на вашу</h2><p>На каждой странице — пример диалога, порядок работы и честные ограничения.</p></div><div class="solutions">
${solution('/bot-dlya-salona-krasoty/', 'scissors', 'Салон красоты и мастер', 'Вопросы об услугах, выбор мастера и заявка на удобное время.')}
${solution('/bot-dlya-avtoservisa/', 'car', 'Автосервис и шиномонтаж', 'Автомобиль, проблема и время визита ещё до звонка.')}
${solution('/bot-dlya-zapisi/', 'calendar', 'Запись клиентов', 'Заявка с подтверждением или бронирование при подключённом расписании.')}
${solution('/bot-dlya-zayavok/', 'inbox', 'Приём заявок', 'Пошаговый опрос и передача обращения ответственному.')}
${solution('/ai-bots/', 'spark', 'ИИ-помощник', 'Ответы по согласованной базе знаний и передача сложных вопросов человеку.')}
${solution('/perenos-bota-v-max/', 'move', 'Перенос бота в MAX', 'Разбор сценариев действующего Telegram-бота и адаптация под MAX.')}
</div></div></section>

<section class="section" id="examples"><div class="container"><div class="section-intro"><p class="kicker">Демонстрационные сценарии</p><h2>Что видит клиент и что получаете вы</h2><p>${demoDisclaimer}</p></div><div class="demo-grid">${['salon', 'auto', 'faq'].map(demoCard).join('')}</div><div class="actions center"><a href="#brief" class="btn">Описать свой сценарий</a></div></div></section>

<section class="section tint" id="platforms"><div class="container"><div class="section-intro"><p class="kicker">MAX · ВКонтакте · Telegram · WhatsApp</p><h2>Бот там, где вам могут написать клиенты</h2><p>Возможности и доступность платформ различаются. Сведения о доступности — на ноябрь 2026 года.</p></div><div class="platforms">
${platform('max', ['MAX', 'Меню услуг, консультации, приём заявок и запись.', 'О ботах для MAX'], 'По справке MAX на 28.11.2026 бота регистрируют самозанятые, юрлица и ИП — резиденты РФ.', false)}
${platform('vk', ['ВКонтакте', 'Диалоги в сообщениях сообщества: ответы, меню, заявки.', 'О ботах ВКонтакте'], 'Нужно сообщество ВКонтакте и доступ к его настройкам.', false)}
${platform('telegram', ['Telegram', 'Анкеты, запись, поддержка и сценарии с кнопками.', 'О Telegram-ботах'], 'Работа Telegram в России ограничивается: проверьте, открывается ли он у ваших клиентов.', true)}
${platform('whatsapp', ['WhatsApp', 'Диалоги через официальные возможности платформы.', 'О WhatsApp-ботах'], 'Доступ в России ограничен. Имеет смысл, если ваши клиенты им действительно пользуются.', true)}
</div><p class="after"><a href="/ai-bots/">ИИ-боты и виртуальные консультанты <i aria-hidden="true">→</i></a></p></div></section>

<section class="section ink" id="advantages"><div class="container"><div class="section-intro"><p class="kicker">Почему с нами удобно</p><h2>Понятные договорённости вместо громких обещаний</h2></div><div class="values">
<div>${icon('user')}<h3>Напрямую с разработчиком</h3><p>Задачу обсуждаете с тем, кто проектирует и делает бота, без пересказов через менеджеров.</p></div>
<div>${icon('doc')}<h3>Объём до начала работ</h3><p>Согласуем сценарии, границы первой версии, стоимость разработки и возможные расходы на внешние сервисы.</p></div>
<div>${icon('eye')}<h3>Ограничения без сюрпризов</h3><p>Заранее проверяем, что позволяют платформа и API вашей CRM или расписания.</p></div>
<div>${icon('shield')}<h3>Только нужные данные</h3><p>Поля анкеты выбираем по задаче: бот не должен спрашивать у клиента лишнее.</p></div>
</div></div></section>

<section class="section" id="workflow"><div class="container"><div class="section-intro"><p class="kicker">Этапы сотрудничества</p><h2>Четыре шага от задачи до работающего бота</h2></div><ol class="steps">
<li><h3>Рассказываете задачу</h3><p>Выбираете платформу и описываете, как сейчас общаетесь с клиентами.</p><p class="out"><span>На выходе</span>понятное описание задачи</p></li>
<li><h3>Согласуем сценарий</h3><p>Уточняем диалоги, кнопки, интеграции и момент передачи человеку.</p><p class="out"><span>На выходе</span>согласованные объём и стоимость</p></li>
<li><h3>Разрабатываем и проверяем</h3><p>Собираем бота и проходим основные и ошибочные сценарии.</p><p class="out"><span>На выходе</span>версия, которую можно проверить</p></li>
<li><h3>Передаём результат</h3><p>Настраиваем запуск и договариваемся о дальнейшей поддержке.</p><p class="out"><span>На выходе</span>запуск на согласованных условиях</p></li>
</ol></div></section>

<section class="section tint" id="scope"><div class="container"><div class="section-intro"><p class="kicker">До начала работ</p><h2>Что согласуем заранее</h2></div><div class="scope-grid"><div><h3>Что делает бот</h3><p>Сценарии, вопросы клиенту и момент, когда диалог переходит к человеку.</p></div><div><h3>Что не входит</h3><p>Границы первой версии, чтобы объём не оставался на догадках.</p></div><div><h3>Что нужно от вас</h3><p>Тексты и услуги, доступы к нужным сервисам, профиль на платформе, если она этого требует.</p></div><div><h3>Какие будут расходы</h3><p>Стоимость разработки и отдельно возможные платежи за размещение и внешние сервисы.</p></div></div></div></section>

<section class="section" id="faq"><div class="container faq-layout"><div class="section-intro"><p class="kicker">Вопросы и возражения</p><h2>Что важно знать перед заказом</h2><p>Не нашли свой вопрос? Задайте его в боте для заявок.</p></div>${faqMarkup(homeFaq)}</div></section>

<section class="section tint" id="brief"><div class="container form-layout"><div class="brief-copy"><p class="kicker">Заявка</p><h2>Расскажите, какой бот вам нужен</h2><p>Три коротких шага: платформа, задача и несколько слов о бизнесе. Технические термины не нужны.</p><ol class="how-send"><li>Соберите ТЗ в этой форме.</li><li>Нажмите «Скопировать и открыть Telegram».</li><li>Вставьте текст в диалог с ботом и отправьте.</li></ol><p class="tiny">Всё, что вы напишете в форме, остаётся в браузере, пока вы сами это не отправите.</p><a href="${bot}" target="_blank" rel="noopener noreferrer" class="textlink">Сразу перейти в бот без формы <i aria-hidden="true">→</i></a></div>${briefForm()}</div></section>

<section class="section" id="krasnodar"><div class="container split"><div class="section-intro"><p class="kicker">География</p><h2>Чат-боты для бизнеса в Краснодаре и по всей России</h2><p>Для заказа бота приезжать никуда не нужно: задачу, сценарий и проверку можно пройти дистанционно, из Краснодара, другого города Краснодарского края или любого региона России.</p></div><ul class="plain"><li><a href="/bot-dlya-salona-krasoty/">Салонам, барбершопам и частным мастерам</a>: вопросы об услугах и заявки на запись.</li><li><a href="/bot-dlya-avtoservisa/">Автосервисам и шиномонтажу</a>: сведения об автомобиле и удобное время до звонка.</li><li><a href="/bot-dlya-zayavok/">Сервисным компаниям и специалистам</a>: приём обращений по шагам.</li><li><a href="/perenos-bota-v-max/">Тем, у кого уже есть бот в Telegram</a>: разбор сценариев для переноса в MAX.</li></ul></div></section>

<section class="section compact" id="demo"><div class="container"><div class="cta-band"><div><p class="kicker">Есть действующий пример</p><h2>Посмотрите демо-бота в Telegram</h2><p>Он помогает выбрать услугу, описать идею и оформить техническое задание.</p></div><a class="btn light" href="${bot}" target="_blank" rel="noopener noreferrer">Открыть демо-бота</a></div></div></section>

`;
}
