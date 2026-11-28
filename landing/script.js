(function(){
  // Источник перехода: только фиксированная категория. Без cookie и идентификаторов.
  const SOURCES=['direct','google','yandex','bing','social','other'];
  function hostIs(host,domain){return host===domain||host.endsWith('.'+domain);}
  function fromUtm(value){
    const v=String(value||'').toLowerCase();
    if(!v)return '';
    if(/^(yandex|ya)$/.test(v))return 'yandex';
    if(v==='google')return 'google';
    if(v==='bing')return 'bing';
    if(/^(telegram|tg|vk|max|dzen|youtube|rutube|ok|social)$/.test(v))return 'social';
    return 'other';
  }
  function fromReferrer(){
    if(!document.referrer)return 'direct';
    try{
      const h=new URL(document.referrer).hostname.toLowerCase();
      if(h===location.hostname)return '';
      if(/(^|\.)google\.[a-z.]{2,6}$/.test(h))return 'google';
      if(/(^|\.)(yandex\.[a-z.]{2,6}|ya\.ru)$/.test(h))return 'yandex';
      if(hostIs(h,'bing.com'))return 'bing';
      if(['t.me','telegram.org','vk.com','vk.ru','away.vk.com','max.ru','dzen.ru','ok.ru','youtube.com','rutube.ru','instagram.com','facebook.com'].some(d=>hostIs(h,d)))return 'social';
      return 'other';
    }catch(_){return 'other';}
  }
  function detectSource(){
    let saved='';
    try{saved=sessionStorage.getItem('pbs_source')||'';}catch(_){}
    let utm='';
    try{utm=fromUtm(new URLSearchParams(location.search).get('utm_source'));}catch(_){}
    const external=utm||fromReferrer();
    // Внутренний переход (external === '') сохраняет первоначальный источник вкладки.
    const result=external||(SOURCES.includes(saved)?saved:'direct');
    if(document.body.dataset.analytics==='on'||document.body.dataset.startParams==='v1'){
      try{sessionStorage.setItem('pbs_source',result);}catch(_){}
    }
    return result;
  }
  window.pavelSource=detectSource();

  // Формат v1: site_<источник>_<страница>. Только значения из списков; сырые URL и UTM не передаются.
  if(document.body.dataset.startParams==='v1'){
    const SRC={direct:'dir',google:'gg',yandex:'ya',bing:'bg',social:'soc',other:'oth'};
    const PAGE={'/':'home','/telegram/':'tg','/max/':'max','/vk/':'vk','/whatsapp/':'wa','/ai-bots/':'ai','/bot-dlya-zapisi/':'zapis','/bot-dlya-zayavok/':'zayavki','/perenos-bota-v-max/':'perenos','/bot-dlya-salona-krasoty/':'salon','/bot-dlya-avtoservisa/':'avto','/privacy/':'privacy'};
    const payload='site_'+SRC[window.pavelSource]+'_'+(PAGE[location.pathname]||'other');
    document.querySelectorAll('a[href^="https://t.me/pavel_chatbots_bot"]').forEach(a=>{
      const url=new URL(a.href);url.searchParams.set('start',payload);a.href=url.href;
    });
  }

  // Нижняя панель не дублирует кнопки первого экрана и не перекрывает форму и подвал.
  const cta=document.querySelector('[data-mobile-cta]');
  if(cta && 'IntersectionObserver' in window){
    const seen=new Set();
    const io=new IntersectionObserver(items=>{
      items.forEach(i=>i.isIntersecting?seen.add(i.target):seen.delete(i.target));
      cta.classList.toggle('hidden',seen.size>0);
    });
    document.querySelectorAll('.hero .actions, .article-header .actions, [data-brief], .footer').forEach(n=>io.observe(n));
  }

  const menu=document.querySelector('[data-menu]'); const nav=document.querySelector('[data-nav]');
  if(menu && nav){document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});}
  if(menu && nav){menu.addEventListener('click',()=>{const o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(o));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));}
  const form=document.querySelector('[data-brief]');if(!form)return;
  const output=document.querySelector('[data-output]');const copy=document.querySelector('[data-copy]');
  function makeBrief(){const p=form.elements.platform.value;const g=form.elements.goal.value;const task=form.elements.task.value.trim().replace(/\s+/g,' ').slice(0,900);return 'Здравствуйте! Хочу заказать чат-бота.\nПлатформа: '+p+'\nЗадача: '+g+(task?'\nПодробности: '+task:'')+'\nИсточник: сайт Pavel Bot Studio';}
  const status=form.querySelector('[data-form-status]');
  const say=t=>{if(status)status.textContent=t;};
  const manual='Не получилось скопировать автоматически. Выделите текст ТЗ выше и скопируйте его вручную.';
  function update(){output.textContent=makeBrief();}
  // После правки прежнее сообщение о копировании больше не относится к тексту.
  form.addEventListener('input',()=>{update();say('');copy.textContent='Скопировать ТЗ';});update();
  copy.addEventListener('click',async()=>{const data=makeBrief();try{await navigator.clipboard.writeText(data);copy.textContent='Скопировано ✓';say('ТЗ скопировано. Вставьте его в диалог с ботом.');window.pavelTrack?.('brief_copy');setTimeout(()=>copy.textContent='Скопировать ТЗ',2400)}catch(e){const range=document.createRange();range.selectNodeContents(output);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);copy.textContent='Выделено — скопируйте';say('Текст выделен. Скопируйте его вручную.');}});
  // Переход в бот заодно копирует ТЗ. Ссылка открывается в любом случае.
  form.parentElement.querySelector('[data-bot-open]')?.addEventListener('click',()=>{
    try{navigator.clipboard.writeText(makeBrief()).then(()=>{say('ТЗ скопировано. Вставьте его в диалог с ботом и отправьте.');window.pavelTrack?.('brief_copy');}).catch(()=>say(manual));}catch(_){say(manual);}
  });
})();
