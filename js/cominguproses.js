/* Coming Up Roses : fonctions communes et chargement par page. */
(()=>{
 'use strict';
 if(window.ComingUpRoses?.register)return;
 const script=document.currentScript;
 const base=new URL('.',script?.src||'https://cdn.jsdelivr.net/gh/webcerise/cominguproses@main/cominguproses.js');
 const modules={index:'.rose-pa,.group-legend',forums:'.rose-forum,.subforums,.rose-topic-row',members:'.members-directory,.member-entry',profile:'.live-profile',posts:'.topic-post',sheets:'.cur-sheet',awards:'.award',discover:'.rose-discover'};
 const api=window.ComingUpRoses={registered:new Set(),started:new Set(),requests:new Map(),version:'20261014-1'};
 const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
 api.register=(name,selector,init)=>{
  if(api.registered.has(name))return;
  api.registered.add(name);
  ready(()=>{if(!document.querySelector(selector))return;api.started.add(name);init(api)});
 };
 api.load=name=>{
  if(!Object.hasOwn(modules,name))return Promise.reject(new Error('Unknown Roses module'));
  if(api.registered.has(name))return Promise.resolve();
  if(api.requests.has(name))return api.requests.get(name);
  const url=new URL('cominguproses-'+name+'.js',base);
  url.searchParams.set('v',api.version);
  const request=new Promise((resolve,reject)=>{
   const node=document.createElement('script');node.src=url.href;node.async=true;node.dataset.rosesModule=name;
   node.onload=resolve;node.onerror=()=>{api.requests.delete(name);node.remove();reject(new Error('Module unavailable: '+name))};
   document.head.append(node);
  });
  api.requests.set(name,request);return request;
 };
 const slug=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const paint=(root,name)=>{const colored=name?.querySelector('[style*="color"]')||name;if(colored){const color=getComputedStyle(colored).color;root.style.setProperty('--group-color',color)}};
 const pounds=value=>{const amount=Number(String(value).replace(/[^\d.-]/g,''));return /\d/.test(String(value))&&Number.isFinite(amount)?new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',minimumFractionDigits:0,maximumFractionDigits:0}).format(amount):'—'};
 function loadGroups(){
  return api.groupsRequest ||= fetch('/groups',{credentials:'same-origin'}).then(response=>{
   if(!response.ok)throw new Error('Groups unavailable');return response.text();
  }).then(text=>{
   const doc=new DOMParser().parseFromString(text,'text/html');
   return Array.from(doc.querySelectorAll('.group_list a[href]')).filter(link=>/^\/g\d+(?:-|$)/.test(new URL(link.getAttribute('href'),location.origin).pathname)).map(link=>({href:link.getAttribute('href'),name:link.textContent.trim(),color:link.style.color||link.querySelector('[style]')?.style.color||''}));
  });
 }

 Object.assign(api,{slug,paint,pounds,loadGroups});
 document.dispatchEvent(new Event('cur-core-ready'));
 let creditsTrigger;
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-close-notiffi]')){
   if(document.querySelector('#notiffi_panel.open'))document.querySelector('#notiffi_button')?.click();
   return;
  }
  const opener=event.target.closest('[data-open-credits]');
  const dialog=document.querySelector('#rose-credits');
  if(!dialog)return;
  if(opener){creditsTrigger=opener;if(!dialog.open)dialog.showModal();return;}
  if(event.target.closest('[data-close-credits]'))dialog.close();
  else if(event.target===dialog){
   const box=dialog.getBoundingClientRect();
   if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  }
 });
 document.addEventListener('close',event=>{
  if(event.target.id==='rose-credits'&&creditsTrigger?.isConnected)creditsTrigger.focus();
 },true);

 function setupHeader(){
  const header=document.querySelector('#roses-header')||document.querySelector('.society-header:not(.header-window-scene)');
  if(!header)return;
  let scene=header.querySelector(':scope > .header-window-scene');
  if(!scene){scene=document.createElement('div');scene.className='society-header header-window-scene';for(const child of Array.from(header.children)){if(!child.matches('.main-nav,.header-home'))scene.append(child)}header.prepend(scene)}
  const decor=scene.cloneNode(true);decor.setAttribute('aria-hidden','true');
  decor.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));decor.querySelector('.header-brand')?.remove();
  decor.querySelectorAll('img').forEach(image=>{image.removeAttribute('fetchpriority');image.decoding='async'});
  const cloneScene=()=>decor.cloneNode(true);
  if(!document.querySelector('.page-header-backdrop')){const backdrop=cloneScene();backdrop.classList.add('page-header-backdrop');document.body.prepend(backdrop)}
  const observed=new WeakSet();
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>entries.forEach(entry=>{
   let child=entry.target.querySelector(':scope > .header-window-scene');
   if(entry.isIntersecting&&!child){child=cloneScene();entry.target.prepend(child)}
   child?.classList.toggle('scene-offscreen',!entry.isIntersecting);
  }),{rootMargin:'200px'}):null;
  api.decorateWindows=()=>document.querySelectorAll('.rose-category-head').forEach(window=>{
   if(observed.has(window))return;observed.add(window);
   if(observer)observer.observe(window);else if(!window.querySelector(':scope > .header-window-scene'))window.prepend(cloneScene());
  });
  api.decorateWindows();
  const ordered=Array.from(header.querySelectorAll('.pinterest-photo'),photo=>({photo,rect:photo.getBoundingClientRect()})).sort((a,b)=>a.rect.top-b.rect.top||a.rect.left-b.rect.left);
  ordered.forEach(({photo},index)=>photo.style.setProperty('--photo-delay',(index*65)+'ms'));
 }
 function detect(){
  for(const [name,selector] of Object.entries(modules)){
   if(!api.registered.has(name)&&!api.requests.has(name)&&document.querySelector(selector))api.load(name).catch(error=>console.error('[Coming Up Roses]',error.message));
  }
 }
 ready(()=>{
  const html=document.documentElement;
  setupHeader();
 const quicklinks=document.querySelector('#rose-quicklinks');
 const quicklinksToggle=document.querySelector('[data-open-quicklinks]');
 if(quicklinks&&quicklinksToggle){
  let closing=false,closeTimer;
  const finishClose=()=>{if(quicklinks.open)quicklinks.close()};
  const closeQuicklinks=()=>{
   if(!quicklinks.open||closing)return;
   closing=true;
   quicklinks.classList.remove('is-open');
   quicklinksToggle.setAttribute('aria-expanded','false');
   if(matchMedia('(prefers-reduced-motion: reduce)').matches)finishClose();
   else closeTimer=setTimeout(finishClose,280);
  };
  quicklinksToggle.addEventListener('click',()=>{
   if(quicklinks.open){closeQuicklinks();return;}
   quicklinks.showModal();
   html.classList.add('rose-quicklinks-open');
   quicklinksToggle.setAttribute('aria-expanded','true');
   quicklinks.getBoundingClientRect();
   quicklinks.classList.add('is-open');
  });
  quicklinks.addEventListener('cancel',event=>{event.preventDefault();closeQuicklinks()});
  quicklinks.addEventListener('click',event=>{
   if(event.target.closest('a')?.getAttribute('href')==='lien ici'){event.preventDefault();return;}
   if(event.target.closest('[data-close-quicklinks]')){closeQuicklinks();return;}
   if(event.target===quicklinks){
    const box=quicklinks.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeQuicklinks();
   }
  });
  quicklinks.addEventListener('transitionend',event=>{if(closing&&event.target===quicklinks&&event.propertyName==='transform')finishClose()});
  quicklinks.addEventListener('close',()=>{
   clearTimeout(closeTimer);closing=false;
   quicklinks.classList.remove('is-open');
   quicklinksToggle.setAttribute('aria-expanded','false');
   html.classList.remove('rose-quicklinks-open');
  });
 }
 const switcher=document.querySelector('#switcheroo');
 if(switcher){
  const labelAccounts=()=>switcher.querySelectorAll('.switcheroo__squircle').forEach(account=>{
   const name=account.querySelector('.switcheroo__popper')?.textContent.trim();
   if(name)account.title=name;
  });
  labelAccounts();
  new MutationObserver(labelAccounts).observe(switcher,{childList:true,subtree:true});
 }
 const syncTheme=()=>{html.dataset.theme=html.getAttribute('data-color-scheme')||'dark'};
 syncTheme();new MutationObserver(syncTheme).observe(html,{attributes:true,attributeFilter:['data-color-scheme']});

  const notification=document.querySelector('#notiffi_button');
  notification?.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();notification.click()}});
  detect();
  let pending=false;
  const selectors=Object.values(modules).join(',')+',.rose-category-head';
  const refresh=()=>{pending=false;detect();api.decorateWindows?.();document.dispatchEvent(new Event('cur-fragments-ready'))};
  const root=document.querySelector('#page-body')||document.body;
  new MutationObserver(records=>{
   if(pending)return;
   const relevant=records.some(record=>{
    if(record.target.nodeType===1&&record.target.closest('#textarea_content,.sceditor-container,.cur-tags'))return false;
    return Array.from(record.addedNodes).some(node=>node.nodeType===1&&!node.classList.contains('header-window-scene')&&(node.matches(selectors)||node.querySelector(selectors)))||record.target.closest?.('.group-legend');
   });
   if(relevant){pending=true;requestAnimationFrame(refresh)}
  }).observe(root,{childList:true,subtree:true});
  document.addEventListener('cur-sheets-ready',detect);
 });
})();
