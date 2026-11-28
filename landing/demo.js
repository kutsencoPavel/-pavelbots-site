// Интерактивная демонстрация на главной. Без запросов в сеть, без хранения и без аналитики.
(function () {
  const root = document.querySelector('[data-sim]');
  if (!root) return;
  const log = root.querySelector('[data-sim-log]');
  const replies = root.querySelector('[data-sim-replies]');
  const ticket = root.querySelector('[data-sim-ticket]');
  const title = root.querySelector('[data-sim-title]');
  const status = root.querySelector('[data-sim-status]');
  const scenarios = {
    salon: {
      title: 'Заявка для администратора',
      steps: [
        { ask: 'Здравствуйте! На какую услугу хотите записаться?', field: 'Услуга', options: ['Стрижка', 'Маникюр', 'Окрашивание'] },
        { ask: 'Когда вам удобно?', field: 'Когда', options: ['Пятница после 18:00', 'Суббота утром'] },
        { ask: 'Как с вами связаться?', field: 'Связь', options: ['Ответить в этом чате', 'Написать вечером'] },
      ],
      done: 'Передаю администратору. Запись будет действовать после его подтверждения.',
      status: 'ждёт подтверждения',
    },
    auto: {
      title: 'Заявка для мастера',
      steps: [
        { ask: 'Что случилось с автомобилем?', field: 'Проблема', options: ['Стук в подвеске', 'Замена шин', 'Плановое ТО'] },
        { ask: 'Какой у вас кузов?', field: 'Автомобиль', options: ['Седан', 'Кроссовер', 'Хэтчбек'] },
        { ask: 'Когда удобно подъехать?', field: 'Когда', options: ['Суббота утром', 'Будни вечером'] },
      ],
      done: 'Передаю мастеру. Причину и стоимость он назовёт после осмотра.',
      status: 'ждёт ответа мастера',
    },
    tutor: {
      title: 'Заявка для преподавателя',
      steps: [
        { ask: 'Какой формат занятий нужен?', field: 'Формат', options: ['Онлайн', 'Очно'] },
        { ask: 'Какой у вас уровень?', field: 'Уровень', options: ['Начальный', 'Средний'] },
        { ask: 'Когда вам удобно заниматься?', field: 'Когда', options: ['Вторник вечером', 'Выходные'] },
      ],
      done: 'Передаю пожелания. Время подтвердит преподаватель.',
      status: 'ждёт подтверждения',
    },
  };
  let current = 'salon';
  let step = 0;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function say(kind, text) {
    log.appendChild(el('p', 'msg ' + (kind === 'bot' ? 'from-bot' : 'from-client'), text));
    log.scrollTop = log.scrollHeight;
  }
  function showReplies(focus) {
    replies.textContent = '';
    const data = scenarios[current];
    const labels = step < data.steps.length ? data.steps[step].options : ['Пройти ещё раз'];
    labels.forEach((label) => {
      const button = el('button', step < data.steps.length ? 'reply' : 'reply again', label);
      button.type = 'button';
      button.addEventListener('click', () => choose(label));
      replies.appendChild(button);
    });
    if (focus) replies.querySelector('button')?.focus({ preventScroll: true });
  }
  function choose(label) {
    const data = scenarios[current];
    if (step >= data.steps.length) { reset(current); showReplies(true); return; }
    say('client', label);
    const row = ticket.children[step];
    row.querySelector('dd').textContent = label;
    row.classList.add('filled');
    step += 1;
    if (step < data.steps.length) say('bot', data.steps[step].ask);
    else {
      say('bot', data.done);
      status.textContent = data.status;
      root.classList.add('complete');
    }
    showReplies(true);
  }
  function reset(name) {
    current = name;
    step = 0;
    const data = scenarios[name];
    root.classList.remove('complete');
    log.textContent = '';
    say('bot', data.steps[0].ask);
    title.textContent = data.title;
    status.textContent = 'заполняется';
    ticket.textContent = '';
    data.steps.forEach((s) => {
      const row = el('div');
      row.append(el('dt', '', s.field), el('dd', '', '—'));
      ticket.appendChild(row);
    });
    showReplies(false);
  }
  root.querySelectorAll('[data-sim-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      root.querySelectorAll('[data-sim-tab]').forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
      reset(tab.dataset.simTab);
    });
  });
  // Пройденный пример подставляет в форму подходящую задачу. Платформу клиент выбирает сам.
  const goals = { salon: 'Запись клиентов', auto: 'Приём заявок', tutor: 'Запись клиентов' };
  root.querySelector('[data-sim-brief]')?.addEventListener('click', () => {
    const radio = document.querySelector('[data-brief] input[name="goal"][value="' + goals[current] + '"]');
    if (!radio) return;
    radio.checked = true;
    radio.dispatchEvent(new Event('input', { bubbles: true }));
  });
  reset('salon');
})();

// Демонстрация анкеты нашего бота: те же 9 вопросов и порядок шагов. Без сети, хранения и аналитики.
(function () {
  const root = document.querySelector('[data-botwalk]');
  if (!root) return;
  const screen = root.querySelector('[data-bw-screen]');
  const replies = root.querySelector('[data-bw-replies]');
  const progress = root.querySelector('[data-bw-progress]');
  const questions = [
    { label: 'Платформа', ask: 'Для какой платформы нужен бот?', options: ['Telegram', 'MAX', 'ВКонтакте', 'WhatsApp'] },
    { label: 'Бизнес / задача', ask: 'Опишите, чем занимается ваш бизнес и какую задачу должен решать бот.', options: ['Салон красоты: нужна запись клиентов', 'Автосервис: нужен приём обращений'] },
    { label: 'Функции', ask: 'Напишите, какие функции нужны боту.', options: ['Меню услуг и приём заявок', 'Ответы на частые вопросы и запись'] },
    { label: 'Искусственный интеллект', ask: 'Нужно ли добавить искусственный интеллект?', options: ['Да', 'Нет', 'Пока не знаю'] },
    { label: 'Интеграции', ask: 'Какие интеграции нужны? Например: CRM, оплата, уведомления.', options: ['Не нужны', 'Уведомления о новых заявках'] },
    { label: 'Пример похожего бота', ask: 'Есть пример похожего бота?', options: [], optional: true },
    { label: 'Ориентировочный бюджет', ask: 'Укажите предполагаемый бюджет, если уже определились.', options: ['Пока не определились'], optional: true },
    { label: 'Желаемые сроки', ask: 'Какой срок разработки предпочитаете?', options: ['В течение месяца', 'Не срочно'], optional: true },
    { label: 'Контакт для связи', ask: 'Как с вами удобнее связаться?', options: ['@username (пример)'] },
  ];
  const total = questions.length;
  let step = 0;
  let editing = false;
  let answers = [];
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (text, className, action) => {
    const b = el('button', className, text);
    b.type = 'button';
    b.addEventListener('click', action);
    return b;
  };
  const list = (rows, onEdit) => {
    const dl = el('dl', 'bw-list');
    rows.forEach(([label, value, index]) => {
      const row = el('div');
      const dd = el('dd', '', value);
      if (onEdit) {
        const change = button('Изменить', 'bw-edit', () => onEdit(index));
        change.setAttribute('aria-label', 'Изменить: ' + label);
        dd.appendChild(change);
      }
      row.append(el('dt', '', label), dd);
      dl.appendChild(row);
    });
    return dl;
  };
  function finishRender(focus, full, done) {
    root.classList.toggle('bw-done', Boolean(done));
    const wasFull = root.classList.contains('bw-full');
    root.classList.toggle('bw-full', Boolean(full));
    screen.scrollTop = 0;
    if (focus && (full || wasFull)) root.scrollIntoView({ block: 'start' });
    if (!focus) return;
    if (full) {
      // Итог читают сверху: фокус на первой реплике, а не на кнопке под списком.
      const heading = screen.firstElementChild;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    } else replies.querySelector('button')?.focus({ preventScroll: true });
  }
  function question(focus) {
    const q = questions[step];
    screen.textContent = '';
    replies.textContent = '';
    progress.textContent = 'Шаг ' + (step + 1) + ' из ' + total;
    if (step > 0 && !editing) screen.appendChild(el('p', 'msg from-client', answers[step - 1]));
    screen.appendChild(el('p', 'msg from-bot', q.ask));
    q.options.forEach((option) => replies.appendChild(button(option, 'reply', () => answer(option))));
    if (q.optional) replies.appendChild(button('Пропустить', 'reply', () => answer('—')));
    if (step > 0) replies.appendChild(button('← Назад', 'reply back', () => {
      if (editing) { editing = false; review(true); return; }
      step -= 1;
      question(true);
    }));
    finishRender(focus);
  }
  function answer(value) {
    answers[step] = value;
    if (editing || step === total - 1) { editing = false; review(true); return; }
    step += 1;
    question(true);
  }
  function review(focus) {
    screen.textContent = '';
    replies.textContent = '';
    progress.textContent = 'Проверка перед отправкой';
    screen.appendChild(el('p', 'msg from-bot', 'Проверьте заявку перед отправкой. Можно исправить любой пункт.'));
    screen.appendChild(list(questions.map((q, i) => [q.label, answers[i], i]), (i) => { step = i; editing = true; question(true); }));
    replies.appendChild(button('✓ Отправить заявку (демо)', 'reply send', () => done(true)));
    replies.appendChild(button('← Назад', 'reply back', () => { step = total - 1; question(true); }));
    finishRender(focus, true);
  }
  function done(focus) {
    screen.textContent = '';
    replies.textContent = '';
    progress.textContent = 'Демонстрация пройдена';
    screen.appendChild(el('p', 'msg from-bot', 'Заявка принята! Разработчик изучит ТЗ и свяжется с вами по указанному контакту. Стоимость и сроки согласуются отдельно.'));
    const owner = el('div', 'bw-owner');
    owner.appendChild(el('b', '', 'Что получает разработчик: новая заявка'));
    owner.appendChild(list([0, 1, 6, 7, 8].map((i) => [questions[i].label, answers[i], i])));
    owner.appendChild(el('p', '', 'И полное техническое задание отдельным файлом.'));
    screen.appendChild(owner);
    const next = el('div', 'bw-next');
    next.appendChild(el('p', '', 'Теперь опишите свою задачу — хватит двух-трёх предложений: «Старт» → «Связаться».'));
    const link = el('a', 'btn', 'Написать в Telegram');
    link.href = root.dataset.bot;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    next.appendChild(link);
    replies.appendChild(next);
    replies.appendChild(button('Пройти ещё раз', 'reply', () => start(true)));
    finishRender(focus, true, true);
  }
  function start(focus) {
    step = 0;
    editing = false;
    answers = [];
    question(focus);
  }
  start(false);
})();
