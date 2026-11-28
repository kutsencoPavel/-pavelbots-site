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
  reset('salon');
})();
