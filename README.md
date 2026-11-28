# Pavel Bot Studio — коммерческий лендинг

Отдельный статический сайт по разработке ботов Telegram, MAX, VK, WhatsApp и ИИ-ботов. Не имеет общей базы данных или общего окружения с ботом; все CTA ведут в действующий `@pavel_chatbots_bot`.

## Локально

```bash
npm ci
npm test
SITE_URL=https://your-site.tuqo.app npm run build
```

Готовый сайт формируется в `dist/`. Простой просмотр: `python -m http.server 8000 --directory dist` (вход на `http://localhost:8000`). Сайт работает без Node.js на хостинге — Node нужен только для генерации статики.

## Tuqo на бесплатном тарифе

1. Создать сайт Tuqo и подключить GitHub через Git CD. Подключить этот отдельный репозиторий `kutsencoPavel/-pavelbots-site` (ветка `main`) в Git CD Tuqo. Репозиторий работающего Telegram-бота не подключать.
2. Git CD видит `package.json`, выполняет `npm ci && npm run build` и публикует `dist/`.
3. После получения адреса добавить `SITE_URL=https://имя.tuqo.app` в настройки окружения сборки, если такие переменные разрешены в выбранном способе публикации; иначе изменить `landing/site-url.txt` на точный адрес (build-скрипт читает этот файл). **Не оставлять примерный URL!**
4. Пересобрать, проверить `sitemap.xml`, `robots.txt`, ссылки и HTTPS. После этого добавить сайт в Яндекс Вебмастер, Google Search Console и Bing Webmaster Tools.
5. В бесплатном тарифе Tuqo доступны поддомен, 3 сайта/150MB, SSL и Git CD; собственный домен, число форм и бейдж зависят от тарифов и условий. Наш сайт отправляет лиды в Telegram, а не в формы Tuqo.

## Важное

- Сайт **не содержит** ключи Telegram/API, сторонние пиксели, внешние шрифты и JS-трекеры.
- Форма генерирует ТЗ локально. Пользователь сам копирует текст и вставляет его в Telegram-бота; автоотправка не заявляется.
- Раздел политики — первоначальная версия; для запуска форм с персональными данными и аналитики нужен отдельный юридический обзор.
- SEO/AEO инфраструктура не гарантирует индексацию и места в поиске.

## Источники идей для агентных ролей

- `https://github.com/VoltAgent/awesome-claude-code-subagents`
- `https://github.com/wshobson/agents`
- `https://github.com/msitarzewski/agency-agents`

Агентные инструкции локальные и проверяемые, **не являются автономными процессами**, не устанавливаются в сам ChatGPT и не получают доступ к ключам. См. `landing/agents/TEAM.md`.

## IndexNow
При появлении настоящего домена генератор создаёт файл `<key>.txt` и `indexnow-info.txt` в `dist/`. После публикации проверьте доступность ключа в корне сайта и отправьте URL по официальной документации Яндекс Вебмастера / Bing Webmaster Tools.

## Контроль качества

При каждом `npm run build` автоматически запускаются тесты (`prebuild`). Если проверка не пройдена, сборка завершается с ошибкой, а Tuqo не должен публиковать неисправную версию. Временный диагностический файл первого автодеплоя удалён из генератора.

## IndexNow automation

The GitHub Actions workflow `.github/workflows/indexnow.yml` runs after changes to the site code, builds and tests the pages, waits until `https://pavelbots.tuqo.app/deploy-revision.txt` matches the current source fingerprint, verifies the published IndexNow key, then sends all public sitemap URLs to Bing and Yandex. If the Tuqo deployment is blocked or delayed, notifications are not sent. Google indexing is managed via Search Console, not IndexNow. Notifications do not guarantee indexing. A manual rerun is available via the workflow_dispatch trigger.

## Search intent content (2026-11-23)

Added task-focused pages `/bot-dlya-zapisi/` and `/bot-dlya-zayavok/`, linked from the home page and footer and included in sitemap/llms.txt/IndexNow. They explain practical use cases, realistic limitations, basic workflow, and FAQs without invented pricing, reviews, or cases. `npm run build` still gates publication through tests.



## Приватная аналитика через существующий Telegram-бот (опционально)

Без платного счётчика, iframe и аналитических cookie. Файл `landing/analytics.js` **не публикуется и не исполняется**, пока не задана переменная сборки `SITE_ANALYTICS_ENDPOINT`. По умолчанию сайт вообще не отправляет события.

Когда в существующем сервере бота будет доступен публичный HTTPS-адрес `/event`, для сборки можно указать `SITE_ANALYTICS_ENDPOINT=https://ваш-проверенный-домен/event`. Сборка откажет в URL без HTTPS. Включатся агрегированные события `page_view`, `telegram_click`, `brief_copy` (последнее только при успешном копировании); только допустимый путь страницы и категория источника. Ни текста заявок, ни полей формы, ни cookie, ни идентификаторов посетителей не отправляется. При сбоях аналитики CTA не блокируются.

Тогда ссылки в Telegram получают параметр `?start=site`, чтобы бот мог помечать только явно начатые с сайта диалоги. Он хранит связку с Telegram ID в своей существующей базе на 30 дней для учёта реальных заявок и удаления по запросу. Перед активацией проверить текст страницы конфиденциальности и правила обработки данных.

**Порядок без риска:** сначала PR и CI для двух репозиториев; затем отдельная проверка HTTPS и постоянного тома, затем включение сервера и тестовая отправка, только после этого — переменная `SITE_ANALYTICS_ENDPOINT` в Tuqo. Никогда не публикуйте ключи Telegram в JavaScript.

## Изменения 2026-11-28
Новые посадочные: `/perenos-bota-v-max/`, `/bot-dlya-salona-krasoty/`, `/bot-dlya-avtoservisa/` (тексты — `landing/content.mjs`). Флаги сборки, по умолчанию выключены: `SITE_START_PARAMS=v1` и `SITE_CONTACT_EMAIL`. Перед включением прочитайте `landing/BOT_INTEGRATION.md`.

