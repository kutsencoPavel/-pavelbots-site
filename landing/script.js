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

  const menu=document.querySelector('[data-menu]'); const nav=document.querySelector('[data-nav]');
  if(menu && nav){menu.addEventListener('click',()=>{const o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(o));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));}
  const form=document.querySelector('[data-brief]');if(!form)return;
  const output=document.querySelector('[data-output]');const copy=document.querySelector('[data-copy]');
  function makeBrief(){const p=form.elements.platform.value;const g=form.elements.goal.value;const task=form.elements.task.value.trim().replace(/\s+/g,' ').slice(0,900);return 'Здравствуйте! Хочу заказать чат-бота.\nПлатформа: '+p+'\nЗадача: '+g+(task?'\nПодробности: '+task:'')+'\nИсточник: сайт Pavel Bot Studio';}
  // Письмо с ТЗ (кнопка есть, только если включён запасной email). Длинные mailto-ссылки
  // некоторые почтовые программы обрезают, поэтому длинное ТЗ вставляется из буфера.
  const mail=form.parentElement.querySelector('[data-mail-brief]');
  const mailBase=mail?mail.getAttribute('href'):'';
  function updateMail(){
    if(!mail)return;
    const full=mailBase+'&body='+encodeURIComponent(makeBrief().replace(/\n/g,'\r\n'));
    mail.href=full.length<=1800?full:mailBase+'&body='+encodeURIComponent('Здравствуйте! Хочу заказать чат-бота. Вставляю ТЗ:\r\n\r\n');
  }
  mail?.addEventListener('click',()=>{try{navigator.clipboard.writeText(makeBrief()).catch(()=>{});}catch(_){}});
  function update(){output.textContent=makeBrief();updateMail();} form.addEventListener('input',update);update();
  copy.addEventListener('click',async()=>{const data=makeBrief();try{await navigator.clipboard.writeText(data);copy.textContent='Скопировано ✓';window.pavelTrack?.('brief_copy');setTimeout(()=>copy.textContent='Скопировать ТЗ',2400)}catch(e){const range=document.createRange();range.selectNodeContents(output);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);copy.textContent='Выделено — скопируйте';}});
  // Переход в бот заодно копирует ТЗ. Ссылка открывается в любом случае.
  form.parentElement.querySelector('[data-bot-open]')?.addEventListener('click',()=>{
    try{navigator.clipboard.writeText(makeBrief()).then(()=>window.pavelTrack?.('brief_copy')).catch(()=>{});}catch(_){}
  });
})();
