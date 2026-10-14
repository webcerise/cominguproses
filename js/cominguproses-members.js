/* Coming Up Roses : members. Chargé uniquement si son contenu est présent. */
(()=>{
 'use strict';
 const register=()=>window.ComingUpRoses.register('members',".members-directory,.member-entry",api=>{
 const {slug,paint,pounds,loadGroups}=api;
 document.querySelectorAll('.member-entry').forEach(card=>{
  paint(card,card.querySelector('.userlist_pseudo'));
  const portrait=card.querySelector('.member-portrait'),photo=portrait?.querySelector('img');
  if(photo&&!portrait.querySelector('.member-tinted')){
   photo.classList.add('member-original');
   const tint=document.createElement('div');tint.className='member-tinted';
   const copy=photo.cloneNode();copy.classList.remove('member-original');copy.removeAttribute('id');copy.alt='';
   tint.append(copy);portrait.append(tint);
  }
 });
 const directory=document.querySelector('.members-directory');
 if(directory)loadGroups().then(groups=>{
  directory.querySelectorAll('.member-entry').forEach(card=>{
   const marker=card.querySelector('.userlist_pseudo [class*="group-"]');
   const id=marker?.className.match(/(?:^|\s)group-(\d+)(?:\s|$)/)?.[1];
   const group=groups.find(group=>new URL(group.href,location.origin).pathname.match(/^\/g(\d+)(?:-|$)/)?.[1]===id);
   if(!group)return;
   const label=card.querySelector('.member-group');label.textContent=group.name;label.hidden=false;
  });
 }).catch(()=>{});

 });
 if(window.ComingUpRoses?.register)register();
 else document.addEventListener('cur-core-ready',register,{once:true});
})();
