(function(){
  const menu=document.querySelector('[data-menu]'); const nav=document.querySelector('[data-nav]');
  if(menu && nav){menu.addEventListener('click',()=>{const o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(o));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));}
  const form=document.querySelector('[data-brief]');if(!form)return;
  const output=document.querySelector('[data-output]');const copy=document.querySelector('[data-copy]');
  function makeBrief(){const p=form.elements.platform.value;const g=form.elements.goal.value;const task=form.elements.task.value.trim().replace(/\s+/g,' ').slice(0,900);return 'Здравствуйте! Хочу заказать чат-бота.\nПлатформа: '+p+'\nЗадача: '+g+(task?'\nПодробности: '+task:'')+'\nИсточник: сайт Pavel Bot Studio';}
  function update(){output.textContent=makeBrief();} form.addEventListener('input',update);update();
  copy.addEventListener('click',async()=>{const data=makeBrief();try{await navigator.clipboard.writeText(data);copy.textContent='Скопировано ✓';window.pavelTrack?.('brief_copy');setTimeout(()=>copy.textContent='Скопировать ТЗ',2400)}catch(e){const range=document.createRange();range.selectNodeContents(output);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);copy.textContent='Выделено — скопируйте';}});
})();
